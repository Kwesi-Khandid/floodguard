<script setup>
import { Bar } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

const props = defineProps({ areas: { type: Array, default: () => [] } })

const severityColor = { Minor: '#ffc107', Moderate: '#fd7e14', Severe: '#dc3545' }

const chartData = computed(() => ({
  labels: props.areas.map((a) => a.areaLabel),
  datasets: [{
    label: 'Reports filed',
    data: props.areas.map((a) => a.reportCount),
    backgroundColor: props.areas.map((a) => severityColor[a.mostSevereRating] || '#6c757d')
  }]
}))

const chartOptions = {
  responsive: true,
  plugins: { legend: { display: false } },
  scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
}
</script>

<template>
  <div class="card border-0 shadow-sm">
    <div class="card-body">
      <h6 class="text-uppercase text-muted small mb-3">Most-reported flood-prone areas</h6>
      <Bar v-if="areas.length" :data="chartData" :options="chartOptions" />
      <p v-else class="text-muted text-center py-4">No community reports yet.</p>
    </div>
  </div>
</template>