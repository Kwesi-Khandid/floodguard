<script setup>
const config = useRuntimeConfig()
const mapPickerRef = ref(null)

const pin = ref(null)           // { lat, lng }
const addressLabel = ref('')
const resolvingAddress = ref(false)
const submittedReport = ref(null)

async function resolveAddress(lat, lng) {
  resolvingAddress.value = true
  try {
    const { label } = await $fetch(`${config.public.apiBase}/geocode/reverse`, {
      query: { lat, lng }
    })
    addressLabel.value = label
  } catch {
    addressLabel.value = `${lat.toFixed(5)}, ${lng.toFixed(5)}`
  } finally {
    resolvingAddress.value = false
  }
}

async function onPinPlaced({ lat, lng }) {
  pin.value = { lat, lng }
  await resolveAddress(lat, lng)
}

async function onLocated({ lat, lng, label }) {
  pin.value = { lat, lng }
  addressLabel.value = label
  mapPickerRef.value?.setPin(lat, lng)
}

function onReportSubmitted(report) {
  submittedReport.value = report
  pin.value = null
  addressLabel.value = ''
}

function reportAnother() {
  submittedReport.value = null
}
</script>

<template>
  <div class="report-page">

    <section class="report-header">
      <div class="header-badge">
        <i class="bi bi-exclamation-triangle-fill"></i>
        Community Safety Network
      </div>

      <h1>Report a Flood-Prone Area</h1>

      <p>
        Share locations that have flooded before.
        Your report helps others make safer land and building decisions.
      </p>
    </section>


    <div v-if="submittedReport" class="success-card">

      <div class="success-icon">
        <i class="bi bi-check-circle-fill"></i>
      </div>

      <h3>Report Submitted Successfully</h3>

      <p>
        Thank you. Your flood report has been added to the public dashboard.
      </p>

      <div class="action-buttons">
        <button class="secondary-btn" @click="reportAnother">
          <i class="bi bi-plus-circle"></i>
          Report Another Area
        </button>

        <NuxtLink to="/dashboard" class="primary-btn">
          <i class="bi bi-map"></i>
          View Dashboard
        </NuxtLink>
      </div>

    </div>


    <template v-else>

      <section class="report-card">

        <div class="step-header">
          <div>
            <h3>
              <span>1</span>
              Choose Location
            </h3>

            <p>
              Drop a pin or use your current location.
            </p>
          </div>

          <GeolocationButton @located="onLocated" />
        </div>


        <div class="map-box">
          <MapPicker
            ref="mapPickerRef"
            mode="report"
            @pin-placed="onPinPlaced"
          />
        </div>


        <div v-if="pin" class="location-box">

          <i class="bi bi-geo-alt-fill"></i>

          <div>
            <strong>
              {{ resolvingAddress ? 'Resolving address...' : addressLabel }}
            </strong>

            <small>
              {{ pin.lat.toFixed(5) }},
              {{ pin.lng.toFixed(5) }}
            </small>
          </div>

        </div>


        <div v-else class="hint-box">
          <i class="bi bi-info-circle"></i>
          Tap the map to drop a pin, or use your location above.
        </div>



        <div class="step-header form-step">
          <div>
            <h3>
              <span>2</span>
              Tell Us What Happened
            </h3>

            <p>
              Add details about the flood event.
            </p>
          </div>
        </div>


        <ReportForm
          :latitude="pin?.lat"
          :longitude="pin?.lng"
          :address-label="addressLabel"
          @submitted="onReportSubmitted"
        />

      </section>

    </template>

  </div>
</template>



<style scoped>

.report-page {
  min-height:100vh;
  background:linear-gradient(180deg,#f8fafc,#eef6ff);
  padding:35px 20px 60px;
}


.report-header {
  max-width:800px;
  margin:0 auto 35px;
  text-align:center;
}


.header-badge {
  display:inline-flex;
  gap:8px;
  align-items:center;
  background:#fee2e2;
  color:#dc2626;
  padding:8px 16px;
  border-radius:50px;
  font-weight:600;
  font-size:.85rem;
}


.report-header h1 {
  margin:18px 0 10px;
  color:#0f172a;
  font-size:clamp(2rem,5vw,3rem);
  font-weight:800;
}


.report-header p {
  color:#64748b;
  line-height:1.7;
}


.report-card,
.success-card {
  max-width:900px;
  margin:auto;
  background:white;
  padding:30px;
  border-radius:28px;
  box-shadow:0 20px 50px rgba(15,23,42,.08);
}


.step-header {
  display:flex;
  justify-content:space-between;
  align-items:center;
  gap:20px;
  margin-bottom:20px;
}


.step-header h3 {
  margin:0;
  font-size:1.1rem;
  color:#0f172a;
}


.step-header span {
  display:inline-flex;
  align-items:center;
  justify-content:center;
  width:30px;
  height:30px;
  border-radius:50%;
  background:#2563eb;
  color:white;
  margin-right:8px;
}


.step-header p {
  margin:5px 0 0;
  color:#64748b;
  font-size:.9rem;
}


.map-box {
  height:450px;
  border-radius:24px;
  overflow:hidden;
}


.location-box,
.hint-box {
  display:flex;
  align-items:center;
  gap:15px;
  margin-top:20px;
  padding:16px;
  border-radius:18px;
}


.location-box {
  background:#eff6ff;
  color:#2563eb;
}


.location-box strong,
.location-box small {
  display:block;
}


.location-box strong {
  color:#0f172a;
}


.location-box small {
  color:#64748b;
}


.hint-box {
  background:#f8fafc;
  color:#64748b;
}


.form-step {
  margin-top:30px;
}


.success-card {
  text-align:center;
  padding:50px 30px;
}


.success-icon {
  font-size:4rem;
  color:#16a34a;
}


.success-card h3 {
  margin-top:15px;
  color:#0f172a;
}


.success-card p {
  color:#64748b;
}


.action-buttons {
  display:flex;
  justify-content:center;
  gap:15px;
  margin-top:25px;
}


.primary-btn,
.secondary-btn {
  height:52px;
  padding:0 25px;
  border-radius:16px;
  display:flex;
  align-items:center;
  gap:8px;
  font-weight:700;
  text-decoration:none;
  border:none;
  cursor:pointer;
}


.primary-btn {
  background:linear-gradient(135deg,#2563eb,#06b6d4);
  color:white;
}


.secondary-btn {
  background:white;
  border:1px solid #cbd5e1;
  color:#334155;
}


@media(max-width:768px){

  .report-page {
    padding:20px 14px;
  }

  .report-card,
  .success-card {
    padding:20px;
    border-radius:22px;
  }

  .step-header {
    flex-direction:column;
    align-items:flex-start;
  }

  .map-box {
    height:330px;
  }

  .action-buttons {
    flex-direction:column;
  }

  .primary-btn,
  .secondary-btn {
    justify-content:center;
    width:100%;
  }

}

</style>