<script setup>
defineProps({ level: { type: String, required: true } })

const colorMap = {
  'LOW': 'success',
  'MODERATE': 'warning',
  'HIGH': 'danger',
  'VERY HIGH': 'dark'
}
</script>

<template>
  <span class="badge rounded-pill fs-6 px-3 py-2" :class="`text-bg-${colorMap[level] || 'secondary'}`">
    {{ level }} RISK
  </span>
</template>