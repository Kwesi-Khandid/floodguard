<script setup>
const emit = defineEmits(['located'])
const locating = ref(false)
const label = ref('')
const error = ref('')
const config = useRuntimeConfig()

async function useMyLocation() {
  error.value = ''

  if (!navigator.geolocation) {
    error.value = 'Geolocation is not supported by this browser.'
    return
  }

  locating.value = true

  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      const { latitude, longitude } = pos.coords
      try {
        const { label: resolved } = await $fetch(`${config.public.apiBase}/geocode/reverse`, {
          query: { lat: latitude, lng: longitude }
        })
        label.value = resolved
        emit('located', { lat: latitude, lng: longitude, label: resolved })
      } catch {
        label.value = `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`
        emit('located', { lat: latitude, lng: longitude, label: label.value })
      }
      locating.value = false
    },
    (err) => {
      locating.value = false
      if (err.code === err.PERMISSION_DENIED) {
        error.value = 'Location permission denied. Check your browser\'s site settings and allow location access.'
      } else if (err.code === err.POSITION_UNAVAILABLE) {
        error.value = 'Location unavailable. Try again or enter coordinates manually.'
      } else if (err.code === err.TIMEOUT) {
        error.value = 'Location request timed out. Try again.'
      } else {
        error.value = 'Could not get your location.'
      }
    },
    { enableHighAccuracy: true, timeout: 10000 }
  )
}
</script>

<template>
  <div>
    <button class="btn btn-outline-primary" type="button" @click="useMyLocation" :disabled="locating">
      <i class="bi bi-geo-alt-fill"></i>
      {{ locating ? 'Locating…' : 'Use my location' }}
    </button>
    <p v-if="label" class="text-muted small mt-1 mb-0">📍 {{ label }}</p>
    <p v-if="error" class="text-danger small mt-1 mb-0">{{ error }}</p>
  </div>
</template>