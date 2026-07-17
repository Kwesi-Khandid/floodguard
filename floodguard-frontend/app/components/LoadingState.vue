<script setup>
const messages = [
  'Checking elevation…',
  'Locating nearest waterway…',
  'Reviewing rainfall history…',
  'Checking soil drainage…',
  'Searching flood history records…'
]
const current = ref(0)
let interval
onMounted(() => {
  interval = setInterval(() => { current.value = (current.value + 1) % messages.length }, 1200)
})
onUnmounted(() => clearInterval(interval))
</script>

<template>
  <div class="text-center py-5">
    <div class="spinner-border text-primary mb-3" role="status"></div>
    <p class="text-muted">{{ messages[current] }}</p>
  </div>
</template>