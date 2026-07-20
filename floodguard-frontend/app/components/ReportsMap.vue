<script setup>
const props = defineProps({ reports: { type: Array, default: () => [] } })
const mapEl = ref(null)
let map = null

const severityColor = { Minor: 'gold', Moderate: 'orange', Severe: 'red' }

onMounted(async () => {
   const L = await import('leaflet')
  map = L.map(mapEl.value).setView([5.6037, -0.1870], 11)

  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0
  if (isTouchDevice) {
    map.dragging.disable()
  }

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map)

  renderPins(L)
})

watch(() => props.reports, async () => {
  if (!map) return
  const L = await import('leaflet')
  renderPins(L)
})

function renderPins(L) {
  props.reports.forEach((r) => {
    const icon = L.icon({
      iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${severityColor[r.severity] || 'grey'}.png`,
      iconSize: [25, 41],
      iconAnchor: [12, 41]
    })
    L.marker([r.latitude, r.longitude], { icon })
      .addTo(map)
      .bindPopup(`
        <strong>${r.address_label || 'Reported area'}</strong><br/>
        Severity: ${r.severity}<br/>
        ${r.event_date ? `Date: ${r.event_date}<br/>` : ''}
        ${r.description || ''}
      `)
  })
}
</script>

<template>
  <div ref="mapEl" style="height: 420px; width: 100%; border-radius: 8px;"></div>
</template>

<style scoped>
@import 'leaflet/dist/leaflet.css';
</style>