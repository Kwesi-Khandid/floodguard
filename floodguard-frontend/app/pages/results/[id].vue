<script setup>
const route = useRoute()
const assessmentStore = useAssessmentStore()

const result = ref(null)
const loading = ref(true)
const error = ref('')

onMounted(async () => {
  try {
    const data = await assessmentStore.fetchById(route.params.id)
    // Normalize the DB row shape into the same shape index.vue produces,
    // so RiskBadge/RiskGauge/FactorCard/AiExplanationBox work unchanged.
    result.value = {
      id: data.id,
      addressLabel: data.address_label,
      coordinates: { latitude: data.latitude, longitude: data.longitude },
      risk: { level: data.risk_level, score: data.risk_score, confidence: data.confidence },
      factors: {
        elevation: data.elevation,
        slope: data.slope,
        riverDistance: data.river_distance,
        riverType: data.river_type,
        annualRainfall: data.annual_rainfall,
        soilDrainage: data.soil_drainage,
        landCover: data.land_cover
      },
      reasons: data.reasons,
      analysis: {
        summary: data.ai_summary,
        recommendation: data.ai_recommendation,
        buyerAdvice: data.ai_buyer_advice
      }
    }
  } catch {
    error.value = 'Could not load this assessment. It may not exist.'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="container py-4">
    <div class="row justify-content-center">
      <div class="col-lg-9">

        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status"></div>
        </div>

        <p v-else-if="error" class="text-danger text-center py-5">{{ error }}</p>

        <template v-else>
          <NuxtLink to="/" class="btn btn-sm btn-outline-secondary mb-3">
            <i class="bi bi-arrow-left"></i> Check another location
          </NuxtLink>

          <div class="card border-0 shadow-sm mb-4">
            <div class="card-body text-center py-4">
              <p class="text-muted small mb-1">{{ result.addressLabel }}</p>
              <p class="text-muted small mb-3">
                {{ result.coordinates.latitude.toFixed(5) }}, {{ result.coordinates.longitude.toFixed(5) }}
              </p>
              <RiskBadge :level="result.risk.level" class="mb-3" />
              <RiskGauge :score="result.risk.score" />
              <p class="text-muted small mt-2 mb-0">Confidence: {{ result.risk.confidence }}%</p>
            </div>
          </div>

          <div class="row g-3 mb-4">
            <FactorCard icon="bi-arrow-up-square" label="Elevation" :value="`${result.factors.elevation} m`" />
            <FactorCard icon="bi-water" label="Nearest waterway"
              :value="result.factors.riverDistance ? `${result.factors.riverDistance} m` : 'None nearby'" />
            <FactorCard icon="bi-cloud-rain" label="Annual rainfall" :value="`${result.factors.annualRainfall} mm`" />
            <FactorCard icon="bi-layers" label="Soil drainage" :value="result.factors.soilDrainage" />
            <FactorCard icon="bi-graph-up" label="Slope" :value="`${result.factors.slope}°`" />
            <FactorCard icon="bi-map" label="Land cover" :value="result.factors.landCover" />
          </div>

          <div v-if="result.reasons?.length" class="card border-0 shadow-sm mb-4">
            <div class="card-body">
              <h6 class="text-uppercase text-muted small mb-3">Why this score</h6>
              <ul class="mb-0">
                <li v-for="(reason, i) in result.reasons" :key="i">{{ reason }}</li>
              </ul>
            </div>
          </div>

          <AiExplanationBox :analysis="result.analysis" />
        </template>
      </div>
    </div>
  </div>
</template>