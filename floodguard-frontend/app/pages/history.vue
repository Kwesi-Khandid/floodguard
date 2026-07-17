<script setup>
const authStore = useAuthStore()
const assessmentStore = useAssessmentStore()

const loading = ref(true)
const error = ref('')

onMounted(async () => {
  if (!authStore.isLoggedIn) {
    loading.value = false
    return
  }
  try {
    await assessmentStore.fetchHistory()
  } catch {
    error.value = 'Could not load your history.'
  } finally {
    loading.value = false
  }
})

async function remove(id) {
  await assessmentStore.deleteAssessment(id)
}

const levelColor = {
  'LOW': 'success',
  'MODERATE': 'warning',
  'HIGH': 'danger',
  'VERY HIGH': 'dark'
}
</script>

<template>
  <div class="container py-4">
    <div class="row justify-content-center">
      <div class="col-lg-9">
        <h2 class="mb-4">Your Check History</h2>

        <div v-if="!authStore.isLoggedIn && !loading" class="card border-0 shadow-sm text-center py-5">
          <p class="text-muted mb-3">Sign in to save and revisit your past flood-risk checks.</p>
          <div class="d-flex justify-content-center">
            <GoogleSignInButton />
          </div>
        </div>

        <div v-else-if="loading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status"></div>
        </div>

        <p v-else-if="error" class="text-danger text-center py-5">{{ error }}</p>

        <div v-else-if="assessmentStore.history.length === 0" class="text-center py-5">
          <p class="text-muted">You haven't checked any locations yet.</p>
          <NuxtLink to="/" class="btn btn-primary">Check a location</NuxtLink>
        </div>

        <div v-else class="list-group">
          <div v-for="item in assessmentStore.history" :key="item.id"
            class="list-group-item d-flex justify-content-between align-items-center py-3">
            <div>
              <p class="mb-1 fw-semibold">{{ item.address_label || `${item.latitude}, ${item.longitude}` }}</p>
              <span class="badge rounded-pill" :class="`text-bg-${levelColor[item.risk_level]}`">
                {{ item.risk_level }}
              </span>
              <span class="text-muted small ms-2">
                {{ new Date(item.created_at).toLocaleDateString() }}
              </span>
            </div>
            <div class="d-flex gap-2">
              <NuxtLink :to="`/results/${item.id}`" class="btn btn-sm btn-outline-primary">View</NuxtLink>
              <button class="btn btn-sm btn-outline-danger" @click="remove(item.id)">
                <i class="bi bi-trash"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>