<script setup>
defineProps({ analysis: { type: Object, required: true } })
</script>

<template>
  <div class="card border-0 shadow-sm">
    <div class="card-body">
      <h6 class="text-uppercase text-muted small mb-3"><i class="bi bi-robot"></i> AI Explanation</h6>
      <p>{{ analysis.summary }}</p>
      <div class="mt-3">
        <p class="fw-semibold mb-1"><i class="bi bi-tools"></i> If building here</p>
        <p class="text-muted">{{ analysis.recommendation }}</p>
      </div>
      <div class="mt-3">
        <p class="fw-semibold mb-1"><i class="bi bi-cash-coin"></i> If buying this land</p>
        <p class="text-muted">{{ analysis.buyerAdvice }}</p>
      </div>
    </div>
  </div>
</template>