<script setup>
const props = defineProps({ score: { type: Number, required: true } })

const color = computed(() => {
  if (props.score >= 75) return '#212529'
  if (props.score >= 55) return '#dc3545'
  if (props.score >= 30) return '#ffc107'
  return '#198754'
})
</script>

<template>
  <div class="text-center">
    <svg width="140" height="140" viewBox="0 0 140 140">
      <circle cx="70" cy="70" r="60" fill="none" stroke="#e9ecef" stroke-width="12" />
      <circle
        cx="70" cy="70" r="60" fill="none" :stroke="color" stroke-width="12"
        stroke-linecap="round"
        :stroke-dasharray="2 * Math.PI * 60"
        :stroke-dashoffset="2 * Math.PI * 60 * (1 - score / 100)"
        transform="rotate(-90 70 70)"
      />
      <text x="70" y="78" text-anchor="middle" font-size="28" font-weight="bold" fill="#212529">
        {{ score }}
      </text>
    </svg>
    <p class="text-muted small mb-0">Risk score out of 100</p>
  </div>
</template>