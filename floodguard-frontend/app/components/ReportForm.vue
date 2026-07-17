<script setup>
const props = defineProps({
  latitude: Number,
  longitude: Number,
  addressLabel: String
})
const emit = defineEmits(['submitted'])
const config = useRuntimeConfig()

const severity = ref('Moderate')
const eventDate = ref('')
const description = ref('')
const submitting = ref(false)
const error = ref('')

async function submit() {
  if (!props.latitude || !props.longitude) {
    error.value = 'Please choose a location on the map first.'
    return
  }
  submitting.value = true
  error.value = ''
  try {
    const { report } = await $fetch(`${config.public.apiBase}/reports`, {
      method: 'POST',
      credentials: 'include',
      body: {
        latitude: props.latitude,
        longitude: props.longitude,
        addressLabel: props.addressLabel,
        severity: severity.value,
        eventDate: eventDate.value || null,
        description: description.value
      }
    })
    emit('submitted', report)
  } catch (err) {
    error.value = 'Could not submit report. Please try again.'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <form @submit.prevent="submit" class="card border-0 shadow-sm">
    <div class="card-body">
      <h6 class="mb-3">Has this area flooded before?</h6>

      <div class="mb-3">
        <label class="form-label small text-muted">Severity</label>
        <select v-model="severity" class="form-select">
          <option value="Minor">Minor — some water pooling</option>
          <option value="Moderate">Moderate — roads/paths affected</option>
          <option value="Severe">Severe — homes/property damaged</option>
        </select>
      </div>

      <div class="mb-3">
        <label class="form-label small text-muted">Approximate date (optional)</label>
        <input v-model="eventDate" type="date" class="form-control" />
      </div>

      <div class="mb-3">
        <label class="form-label small text-muted">What happened?</label>
        <textarea v-model="description" class="form-control" rows="3"
          placeholder="e.g. Heavy rain in June caused flooding along this road..."></textarea>
      </div>

      <p v-if="error" class="text-danger small">{{ error }}</p>

      <button type="submit" class="btn btn-danger w-100" :disabled="submitting">
        <i class="bi bi-exclamation-triangle-fill"></i>
        {{ submitting ? 'Submitting…' : 'Submit Report' }}
      </button>
    </div>
  </form>
</template>