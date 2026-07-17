<template>
  <div class="flood-page">

    <!-- HERO -->
    <section class="hero-section">
      <div class="hero-content">
        <div class="hero-badge">
          <i class="bi bi-shield-check"></i>
          Flood Intelligence Platform
        </div>

        <h1>
          Know the flood risk
          <span>before you invest.</span>
        </h1>

        <p>
          Analyze any location using terrain, rainfall, waterways and
          environmental data to get an explainable flood-risk assessment.
        </p>

        <div class="hero-features">
          <div><i class="bi bi-geo-alt"></i> Location Based</div>
          <div><i class="bi bi-graph-up"></i> Data Driven</div>
          <div><i class="bi bi-robot"></i> AI Explained</div>
        </div>
      </div>
    </section>

    <!--
      IMPORTANT: this card stays mounted the whole time (v-show, not v-if).
      Previously it used v-if, which destroyed and recreated MapPicker every
      time a result came back / "Check Another Location" was clicked. Map
      libraries (Leaflet/Mapbox/Google Maps) size themselves at init time, so
      re-creating them inside a container that hasn't finished laying out
      yet is what caused the map to render blank/gray. Keeping it mounted
      and just hiding it avoids that entirely.
    -->
    <section
      v-show="!checking && !result"
      class="location-card"
    >
      <div class="card-header">
        <div>
          <h3>
            <i class="bi bi-pin-map"></i>
            Select Location
          </h3>
          <p>Drop a pin, enter coordinates, or use your current position.</p>
        </div>

        <GeolocationButton @located="onLocated" />
      </div>

      <!-- MAP -->
      <div ref="mapContainerRef" class="map-container">
        <MapPicker
          ref="mapPickerRef"
          mode="check"
          @pin-placed="onPinPlaced"
        />
      </div>

      <!-- ADDRESS -->
      <div v-if="pin" class="location-status">
        <div class="status-icon">
          <i class="bi bi-geo-alt-fill"></i>
        </div>
        <div>
          <small>Selected Location</small>
          <p>{{ resolvingAddress ? 'Resolving address...' : addressLabel }}</p>
        </div>
      </div>

      <!-- COORDINATES -->
      <div class="coordinate-grid">
        <div class="input-group-modern">
          <label><i class="bi bi-globe"></i> Latitude</label>
          <input v-model="manualLat" type="text" inputmode="decimal" placeholder="5.603720" />
        </div>

        <div class="input-group-modern">
          <label><i class="bi bi-compass"></i> Longitude</label>
          <input v-model="manualLng" type="text" inputmode="decimal" placeholder="-0.187010" />
        </div>
      </div>

      <!-- ERROR -->
      <p v-if="error" class="error-message">
        <i class="bi bi-exclamation-circle"></i>
        {{ error }}
      </p>

      <!-- ACTION BUTTON -->
      <button class="risk-button" :disabled="!pin" @click="checkRisk">
        <i class="bi bi-search"></i>
        Check Flood Risk
      </button>
    </section>

    <!-- LOADING -->
    <LoadingState v-if="checking" />

    <!-- RESULT SECTION -->
    <section v-if="result && !checking" class="result-section">

      <!-- MAIN RISK CARD -->
      <div class="risk-summary-card">
        <div class="result-location">
          <i class="bi bi-geo-alt-fill"></i>
          <span>{{ addressLabel }}</span>
        </div>

        <RiskBadge :level="result.risk.level" class="risk-badge" />
        <RiskGauge :score="result.risk.score" />

        <div class="confidence">
          <i class="bi bi-shield-check"></i>
          Confidence: <strong>{{ result.risk.confidence }}%</strong>
        </div>
      </div>

      <!-- FACTOR GRID -->
      <div class="factor-grid">
        <FactorCard
          icon="bi-arrow-up-square"
          label="Elevation"
          :value="`${result.factors.elevation} m`"
        />
        <FactorCard
          icon="bi-water"
          label="Nearest Waterway"
          :value="result.factors.riverDistance ? `${result.factors.riverDistance} m` : 'None nearby'"
        />
        <FactorCard
          icon="bi-cloud-rain"
          label="Annual Rainfall"
          :value="`${result.factors.annualRainfall} mm`"
        />
        <FactorCard
          icon="bi-layers"
          label="Soil Drainage"
          :value="result.factors.soilDrainage"
        />
      </div>

      <!-- AI EXPLANATION -->
      <div class="ai-card">
        <div class="ai-header">
          <div class="ai-icon">
            <i class="bi bi-robot"></i>
          </div>
          <div>
            <h4>AI Risk Explanation</h4>
            <p>Why this location received this rating</p>
          </div>
        </div>

        <AiExplanationBox :analysis="result.analysis" />
      </div>

      <!-- ACTIONS -->
      <div class="result-actions">
        <button class="secondary-button" @click="checkAnother">
          <i class="bi bi-arrow-repeat"></i>
          Check Another Location
        </button>

        <button class="primary-button" @click="viewFullResult">
          <i class="bi bi-file-earmark-text"></i>
          View Full Report
        </button>
      </div>

    </section>

  </div>
</template>


<script setup>
import { ref, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'

const config = useRuntimeConfig()
const router = useRouter()

const mapPickerRef = ref(null)
const mapContainerRef = ref(null)

const pin = ref(null)              // { lat, lng }
const addressLabel = ref('')
const resolvingAddress = ref(false)

const manualLat = ref('')
const manualLng = ref('')

const checking = ref(false)
const error = ref('')
const result = ref(null)

let resizeObserver = null

// Tells the map to recompute its size. Safe to call even if MapPicker
// doesn't expose the method (e.g. hasn't wired it up yet) thanks to
// optional chaining — it just becomes a no-op.
function refreshMap() {
  nextTick(() => {
    mapPickerRef.value?.invalidateSize?.()
  })
}

onMounted(() => {
  refreshMap()

  if (typeof ResizeObserver !== 'undefined' && mapContainerRef.value) {
    resizeObserver = new ResizeObserver(() => refreshMap())
    resizeObserver.observe(mapContainerRef.value)
  }

  window.addEventListener('resize', refreshMap)
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  window.removeEventListener('resize', refreshMap)
})

// Whenever the location card goes from hidden -> visible again
// (i.e. result gets cleared), nudge the map to redraw itself.
watch(result, (newVal, oldVal) => {
  if (oldVal && !newVal) refreshMap()
})

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
  manualLat.value = lat.toFixed(6)
  manualLng.value = lng.toFixed(6)
  result.value = null
  await resolveAddress(lat, lng)
}

async function onLocated({ lat, lng, label }) {
  pin.value = { lat, lng }
  addressLabel.value = label
  manualLat.value = lat.toFixed(6)
  manualLng.value = lng.toFixed(6)
  result.value = null
  mapPickerRef.value?.setPin(lat, lng)
}

// Debounced reverse-geocode + pin update when the user types coordinates manually
let debounceTimer = null
watch([manualLat, manualLng], ([lat, lng]) => {
  clearTimeout(debounceTimer)
  const latNum = parseFloat(lat)
  const lngNum = parseFloat(lng)
  if (Number.isNaN(latNum) || Number.isNaN(lngNum)) return

  debounceTimer = setTimeout(async () => {
    pin.value = { lat: latNum, lng: lngNum }
    mapPickerRef.value?.setPin(latNum, lngNum)
    await resolveAddress(latNum, lngNum)
  }, 700)
})

async function checkRisk() {
  if (!pin.value) {
    error.value = 'Please choose a location on the map or enter coordinates first.'
    return
  }
  checking.value = true
  error.value = ''
  result.value = null

  try {
    const response = await $fetch(`${config.public.apiBase}/flood-risk`, {
      method: 'POST',
      credentials: 'include',
      body: {
        latitude: pin.value.lat,
        longitude: pin.value.lng,
        addressLabel: addressLabel.value
      }
    })
    result.value = response
  } catch (err) {
    error.value = 'Could not assess this location right now. Please try again.'
  } finally {
    checking.value = false
  }
}

function viewFullResult() {
  if (result.value?.id) router.push(`/results/${result.value.id}`)
}

function checkAnother() {
  result.value = null
  pin.value = null
  addressLabel.value = ''
  manualLat.value = ''
  manualLng.value = ''
}
</script>


<style scoped>

.flood-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #f8fafc 0%, #eef6ff 100%);
  padding: clamp(20px, 4vw, 30px) clamp(14px, 4vw, 20px) clamp(40px, 6vw, 60px);
}

/* ===========================
   HERO
=========================== */

.hero-section {
  max-width: 950px;
  margin: 0 auto clamp(24px, 5vw, 40px);
  text-align: center;
}

.hero-content {
  padding: clamp(20px, 4vw, 35px) clamp(5px, 2vw, 20px);
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(37, 99, 235, .1);
  color: #2563eb;
  padding: 10px 18px;
  border-radius: 50px;
  font-size: .9rem;
  font-weight: 600;
  margin-bottom: 20px;
}

.hero-content h1 {
  font-size: clamp(1.9rem, 6vw, 3.5rem);
  line-height: 1.15;
  font-weight: 800;
  color: #0f172a;
  margin-bottom: 20px;
}

.hero-content h1 span {
  display: block;
  background: linear-gradient(90deg, #2563eb, #06b6d4);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.hero-content p {
  max-width: 650px;
  margin: auto;
  color: #64748b;
  font-size: clamp(.95rem, 2.2vw, 1.1rem);
  line-height: 1.7;
}

.hero-features {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 25px;
}

.hero-features div {
  display: flex;
  align-items: center;
  gap: 8px;
  background: white;
  padding: 10px 16px;
  border-radius: 50px;
  box-shadow: 0 10px 25px rgba(15, 23, 42, .06);
  font-size: .85rem;
  font-weight: 600;
  color: #334155;
  white-space: nowrap;
}

/* ===========================
   CARDS (shared)
=========================== */

.location-card,
.risk-summary-card,
.ai-card {
  width: 100%;
  max-width: 950px;
  margin: 0 auto;
  background: white;
  border-radius: 28px;
  padding: clamp(18px, 4vw, 30px);
  box-shadow: 0 20px 50px rgba(15, 23, 42, .08);
  box-sizing: border-box;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 25px;
}

.card-header h3 {
  margin: 0;
  color: #0f172a;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 8px;
}

.card-header p {
  margin: 5px 0 0;
  color: #64748b;
}

/* ===========================
   MAP
   Fluid height via aspect-ratio instead of hard breakpoint jumps,
   with min/max clamps so it never gets too short or too tall.
=========================== */

.map-container {
  width: 100%;
  aspect-ratio: 16 / 10;
  min-height: 280px;
  max-height: 520px;
  overflow: hidden;
  border-radius: 24px;
  position: relative;
  background: #e2e8f0; /* avoids a blank-white flash while tiles load */
}

.map-container :deep(> *) {
  width: 100%;
  height: 100%;
  border-radius: 24px;
}

@media (max-width: 480px) {
  .map-container {
    aspect-ratio: 4 / 5;
    min-height: 300px;
  }
}

/* ===========================
   LOCATION STATUS
=========================== */

.location-status {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-top: 20px;
  padding: 16px;
  background: #eff6ff;
  border-radius: 18px;
}

.status-icon {
  flex-shrink: 0;
  width: 45px;
  height: 45px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #2563eb;
  color: white;
}

.location-status small {
  color: #64748b;
}

.location-status p {
  margin: 3px 0 0;
  font-weight: 600;
  color: #0f172a;
  word-break: break-word;
}

/* ===========================
   INPUTS
=========================== */

.coordinate-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 20px;
  margin-top: 25px;
}

.input-group-modern label {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
  font-size: .85rem;
  font-weight: 600;
  color: #475569;
}

.input-group-modern input {
  width: 100%;
  height: 55px;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  padding: 0 18px;
  font-size: 1rem;
  box-sizing: border-box;
  transition: .2s;
}

.input-group-modern input:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 4px rgba(37, 99, 235, .12);
}

/* ===========================
   BUTTONS
=========================== */

.risk-button,
.primary-button,
.secondary-button {
  width: 100%;
  min-height: 55px;
  padding: 12px 18px;
  border-radius: 18px;
  border: none;
  font-weight: 700;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  cursor: pointer;
  transition: .25s;
}

.risk-button,
.primary-button {
  background: linear-gradient(135deg, #2563eb, #06b6d4);
  color: white;
}

.risk-button {
  margin-top: 25px;
}

.risk-button:hover,
.primary-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 15px 30px rgba(37, 99, 235, .25);
}

.risk-button:disabled {
  opacity: .5;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.secondary-button {
  background: white;
  border: 1px solid #cbd5e1;
  color: #334155;
}

/* ===========================
   RESULT
=========================== */

.result-section {
  width: 100%;
  max-width: 950px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 25px;
  box-sizing: border-box;
}

.risk-summary-card {
  text-align: center;
}

.result-location {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  color: #64748b;
  margin-bottom: 20px;
  word-break: break-word;
}

.confidence {
  margin-top: 20px;
  color: #64748b;
}

.confidence strong {
  color: #0f172a;
}

/* FACTORS */

.factor-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

/* AI */

.ai-header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
}

.ai-icon {
  flex-shrink: 0;
  width: 50px;
  height: 50px;
  border-radius: 15px;
  background: #dbeafe;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #2563eb;
  font-size: 1.4rem;
}

.ai-header h4 {
  margin: 0;
}

.ai-header p {
  margin: 3px 0;
  color: #64748b;
}

/* ACTIONS */

.result-actions {
  display: flex;
  gap: 15px;
}

.result-actions button {
  flex: 1;
}

.error-message {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 15px;
  color: #dc2626;
}

/* ===========================
   RESPONSIVE
=========================== */

@media (max-width: 900px) {
  .factor-grid {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 768px) {
  .card-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .result-actions {
    flex-direction: column;
  }
}

@media (max-width: 560px) {
  .coordinate-grid {
    grid-template-columns: 1fr;
  }

  .hero-features {
    flex-direction: column;
    align-items: stretch;
  }

  .hero-features div {
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .factor-grid {
    grid-template-columns: 1fr;
  }
}
</style>