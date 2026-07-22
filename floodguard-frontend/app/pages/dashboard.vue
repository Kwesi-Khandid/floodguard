<script setup>
const config = useRuntimeConfig()

const reports = ref([])
const areas = ref([])
const loading = ref(true)
const error = ref('')
const precision = ref(6) // 4 = regional, 6 = default, 8 = near-exact

async function loadDashboard() {
  loading.value = true
  error.value = ''
  try {
    const [reportsRes, statsRes] = await Promise.all([
      $fetch(`${config.public.apiBase}/reports`),
      $fetch(`${config.public.apiBase}/reports/stats`, {
        query: { precision: precision.value }
      })
    ])
    reports.value = reportsRes.reports
    areas.value = statsRes.areas
  } catch {
    error.value = 'Could not load flood report data. Please try again later.'
  } finally {
    loading.value = false
  }
}


const totalReports = computed(() => reports.value.length)
const severeAreas = computed(() => areas.value.filter(a => a.mostSevereRating === 'Severe').length)

onMounted(loadDashboard)

// re-fetch whenever the user moves the precision slider
watch(precision, loadDashboard)
</script>

<template>
  <div class="dashboard-page">

    <section class="dashboard-header">
      <div class="header-content">
        <div class="header-badge">
          <i class="bi bi-people-fill"></i>
          Community Intelligence
        </div>

        <h1>Community Flood Reports</h1>

        <p>
          Real-world flood observations from residents.
          Use community reports to understand flood-prone
          areas before buying land or building.
        </p>
      </div>

      <NuxtLink to="/report" class="report-button">
        <i class="bi bi-exclamation-triangle-fill"></i>
        Report an Area
      </NuxtLink>
    </section>


    
      <!--precision control--> 

      <div class="precision-control">
    <label class="precision-label">
      Area detail: {{ precision === 4 ? 'Regional' : precision === 8 ? 'Street-level' : 'City block' }}
    </label>
    <input type="range" min="4" max="8" step="1" v-model.number="precision" class="precision-slider" />
  </div>

    <div v-if="loading" class="loading-box">
      <div class="spinner-border text-primary"></div>
      <p>Loading flood reports...</p>
    </div>


    <div v-else-if="error" class="error-box">
      <i class="bi bi-exclamation-circle"></i>
      {{ error }}
    </div>


    <template v-else>

      <section class="stats-grid">

        <div class="stat-card">
          <div class="stat-icon blue">
            <i class="bi bi-file-earmark-text"></i>
          </div>

          <div>
            <small>Total Reports</small>
            <h2>{{ totalReports }}</h2>
          </div>
        </div>


        <div class="stat-card">
          <div class="stat-icon cyan">
            <i class="bi bi-geo-alt"></i>
          </div>

          <div>
            <small>Areas Flagged</small>
            <h2>{{ areas.length }}</h2>
          </div>
        </div>


        <div class="stat-card">
          <div class="stat-icon red">
            <i class="bi bi-water"></i>
          </div>

          <div>
            <small>Severe Areas</small>
            <h2 class="danger-text">{{ severeAreas }}</h2>
          </div>
        </div>

      </section>


      <section class="analytics-grid">

        <div class="panel-card">

          <div class="panel-header">
            <div>
              <h3>Flood Trends</h3>
              <p>Severity distribution across locations</p>
            </div>

            <i class="bi bi-bar-chart-fill"></i>
          </div>

          <div class="chart-container">
            <FloodReportsChart :areas="areas" />
          </div>

        </div>


        <div class="panel-card">

          <div class="panel-header">
            <div>
              <h3>Report Map</h3>
              <p>Community flood locations</p>
            </div>

            <i class="bi bi-map-fill"></i>
          </div>

          <div class="map-container">
            <ReportsMap :reports="reports" />
          </div>

        </div>

      </section>

    </template>

  </div>
</template>


<style scoped>


.dashboard-page {

  min-height:100vh;

  background:
  linear-gradient(
    180deg,
    #f8fafc,
    #eef6ff
  );

  padding:35px 20px 60px;

}



/* HEADER */

.dashboard-header {

  max-width:1100px;

  margin:auto;

  display:flex;

  justify-content:space-between;

  align-items:center;

  gap:30px;

  margin-bottom:35px;

}



.header-badge {

  display:inline-flex;

  align-items:center;

  gap:8px;

  background:#dbeafe;

  color:#2563eb;

  padding:8px 15px;

  border-radius:50px;

  font-weight:600;

  font-size:.85rem;

}



.header-content h1 {

  font-size:clamp(2rem,4vw,3rem);

  margin:15px 0 10px;

  font-weight:800;

  color:#0f172a;

}



.header-content p {

  max-width:650px;

  color:#64748b;

  line-height:1.7;

}





/* BUTTON */


.report-button {

  background:
  linear-gradient(
    135deg,
    #dc2626,
    #f97316
  );

  color:white;

  text-decoration:none;

  padding:16px 25px;

  border-radius:18px;

  font-weight:700;

  display:flex;

  align-items:center;

  gap:10px;

  white-space:nowrap;

  transition:.25s;

}



.report-button:hover {

  transform:translateY(-3px);

  box-shadow:
  0 15px 30px rgba(220,38,38,.25);

}





/* LOADING */

.loading-box {

  text-align:center;

  padding:80px;

}



.loading-box p {

  color:#64748b;

  margin-top:15px;

}




.error-box {

  background:#fee2e2;

  color:#b91c1c;

  padding:20px;

  border-radius:20px;

  text-align:center;

}




/* STAT CARDS */


.stats-grid {

  max-width:1100px;

  margin:auto;

  display:grid;

  grid-template-columns:repeat(3,1fr);

  gap:20px;

  margin-bottom:35px;

}



.stat-card {

  background:white;

  padding:25px;

  border-radius:24px;

  display:flex;

  align-items:center;

  gap:20px;

  box-shadow:
  0 15px 40px rgba(15,23,42,.07);

}



.stat-card small {

  color:#64748b;

}



.stat-card h2 {

  margin:5px 0 0;

  font-size:2rem;

}



.stat-icon {

  width:55px;

  height:55px;

  display:flex;

  align-items:center;

  justify-content:center;

  border-radius:18px;

  font-size:1.4rem;

}



.blue {

 background:#dbeafe;
 color:#2563eb;

}


.cyan {

 background:#cffafe;
 color:#0891b2;

}


.red {

 background:#fee2e2;
 color:#dc2626;

}


.danger-text {

 color:#dc2626;

}




/* ANALYTICS */


.analytics-grid {

 max-width:1100px;

 margin:auto;

 display:grid;

 grid-template-columns:1fr 1fr;

 gap:25px;

}



.panel-card {

 background:white;

 border-radius:28px;

 padding:25px;

 box-shadow:
 0 20px 50px rgba(15,23,42,.08);

}



.panel-header {

 display:flex;

 justify-content:space-between;

 align-items:center;

 margin-bottom:20px;

}



.panel-header h3 {

 margin:0;

 color:#0f172a;

}



.panel-header p {

 margin:5px 0 0;

 color:#64748b;

 font-size:.9rem;

}



.panel-header i {

 font-size:1.5rem;

 color:#2563eb;

}




.chart-container {

 min-height:350px;

}



.map-container {

 height:350px;

 border-radius:20px;

 overflow:hidden;

}




/* MOBILE */


@media(max-width:900px){


.dashboard-header {

 flex-direction:column;

 align-items:flex-start;

}



.stats-grid {

 grid-template-columns:1fr;

}



.analytics-grid {

 grid-template-columns:1fr;

}


}



@media(max-width:500px){


.dashboard-page {

 padding:20px 14px;

}



.panel-card,
.stat-card {

 border-radius:20px;

}


.report-button {

 width:100%;

 justify-content:center;

}

}


.precision-control {
  max-width: 1100px;
  margin: 0 auto 25px;
}

.precision-label {
  display: block;
  font-size: .85rem;
  font-weight: 600;
  color: #64748b;
  margin-bottom: 8px;
}

.precision-slider {
  width: 100%;
  max-width: 320px;
  accent-color: #2563eb;
}


</style>