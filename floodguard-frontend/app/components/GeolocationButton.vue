<!-- components/GeolocationButton.vue -->
<script setup>
const emit = defineEmits(['located'])
const locating = ref(false)
const label = ref('')

function useMyLocation() {
  locating.value = true
  navigator.geolocation.getCurrentPosition(async (pos) => {
    const { latitude, longitude } = pos.coords
    const { label: resolved } = await $fetch('/api/geocode/reverse', {
      query: { lat: latitude, lng: longitude }
    })
    label.value = resolved
    emit('located', { lat: latitude, lng: longitude, label: resolved })
    locating.value = false
  }, () => { locating.value = false })
}
</script>

<template>
  <button class="btn btn-outline-primary" @click="useMyLocation" :disabled="locating">
    <i class="bi bi-geo-alt-fill"></i> {{ locating ? 'Locating…' : 'Use my location' }}
  </button>
  <p v-if="label" class="text-muted small mt-1">📍 {{ label }}</p>
</template>