<script setup>
// Reusable Leaflet map for both flood-risk checking and community flood reporting.
// mode="check" -> blue pin, emits {lat,lng}
// mode="report" -> red pin, emits {lat,lng}
const props = defineProps({
  mode: { type: String, default: 'check' }, // 'check' | 'report'
  center: { type: Object, default: () => ({ lat: 5.6037, lng: -0.1870 }) } // Accra default
})
const emit = defineEmits(['pin-placed'])

const mapEl = ref(null)
let map = null
let marker = null
let L = null

// Smaller screens show a wider area at a lower zoom so the context around
// a pin is still visible even in a shorter map container; larger screens
// can afford to zoom in tighter since the container itself is bigger.
function zoomForWidth(width) {
  if (width < 480) return 11
  if (width < 768) return 12
  if (width < 1200) return 13
  return 14
}

onMounted(async () => {
   L = await import('leaflet')

  const initialZoom = zoomForWidth(window.innerWidth)
  map = L.map(mapEl.value, {
    zoomControl: true,
    tap: true
  }).setView([props.center.lat, props.center.lng], initialZoom)


  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0
  if (isTouchDevice) {
    map.dragging.disable()
  }

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 19
  }).addTo(map)
  const pinColor = props.mode === 'report' ? 'red' : 'blue'
  const icon = L.icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${pinColor}.png`,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
  })

  map.on('click', (e) => {
    placePin(e.latlng.lat, e.latlng.lng, icon)
    emit('pin-placed', { lat: e.latlng.lat, lng: e.latlng.lng })
  })

  // Re-fit zoom when the viewport crosses a breakpoint (e.g. rotating a phone,
  // or resizing a browser window past 768px) rather than only on initial load.
  window.addEventListener('resize', handleResize)

  // Leaflet sizes its canvas from the container's dimensions at init time.
  // If the container was still animating/collapsed (e.g. inside a v-show
  // that just became visible), the map can render at the wrong size until
  // told to recalculate — invalidateSize() below is exposed for exactly that.
  requestAnimationFrame(() => map.invalidateSize())
})

let resizeTimer = null
function handleResize() {
  clearTimeout(resizeTimer)
  resizeTimer = setTimeout(() => {
    if (!map) return
    map.invalidateSize()

    const targetZoom = zoomForWidth(window.innerWidth)
    // Only adjust zoom if no pin has been placed yet — once a user has
    // zoomed/panned to a specific spot, resizing shouldn't yank them
    // back out to a wider view and lose their place.
    if (!marker) {
      map.setZoom(targetZoom)
    }
  }, 200)
}

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  clearTimeout(resizeTimer)
  map?.remove()
})

function placePin(lat, lng, icon) {
  if (marker) map.removeLayer(marker)
  marker = L.marker([lat, lng], { icon }).addTo(map)
}

// Lets a parent (e.g. GeolocationButton or coordinate input) move the pin programmatically
async function setPin(lat, lng) {
  if (!map || !L) return
  const pinColor = props.mode === 'report' ? 'red' : 'blue'
  const icon = L.icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${pinColor}.png`,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
  })
  placePin(lat, lng, icon)
  // Zoom in closer once a specific point is chosen, regardless of screen size —
  // this is the "confirm my exact spot" zoom level, not the initial browse level.
  map.setView([lat, lng], Math.max(zoomForWidth(window.innerWidth), 15))
}

// Called by the parent page after a container becomes visible again
// (e.g. v-show toggling from hidden -> shown) so Leaflet recalculates
// its canvas size instead of rendering blank/gray.
function invalidateSize() {
  if (!map) return
  requestAnimationFrame(() => map.invalidateSize())
}

defineExpose({ setPin, invalidateSize })
</script>

<template>
  <div ref="mapEl" style="height: 100%; width: 100%;"></div>
</template>

