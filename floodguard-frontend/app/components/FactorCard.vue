<script setup>
defineProps({ icon: String, label: String, value: [String, Number] })
</script>

<template>
  <div class="col-6 col-md-3">
    <div class="card border-0 shadow-sm h-100">
      <div class="card-body text-center py-3">
        <i :class="`bi ${icon} fs-4 text-primary`"></i>
        <p class="text-muted small mb-0 mt-2">{{ label }}</p>
        <p class="fw-semibold mb-0">{{ value }}</p>
      </div>
    </div>
  </div>
</template>