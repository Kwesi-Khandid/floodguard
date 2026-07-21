<!-- <script setup>
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
</script> -->



<!-- 
<template>
  <div class="card border-0 shadow-sm">
    <div class="card-body">
      <h6 class="text-uppercase text-muted small mb-3">Most-reported flood-prone areas</h6>
      <Bar v-if="areas.length" :data="chartData" :options="chartOptions" />
      <p v-else class="text-muted text-center py-4">No community reports yet.</p>
    </div>
  </div>
</template> -->




<script setup>
import { computed } from 'vue'
import { Bar } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

const props = defineProps({
  areas: { type: Array, default: () => [] }
})

const severityColor = {
  Minor: '#ffc107',
  Moderate: '#fd7e14',
  Severe: '#dc3545'
}

const shortLabel = (label) => {
  if (!label) return ''
  return label.split(',')[0].trim()
}

const chartData = computed(() => ({
  labels: props.areas.map(a => shortLabel(a.areaLabel)),
  datasets: [{
    label: 'Reports Filed',
    data: props.areas.map(a => a.reportCount),
    backgroundColor: props.areas.map(a => severityColor[a.mostSevereRating] || '#6c757d'),
    borderRadius: 8,
    borderSkipped: false
  }]
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
   tooltip: {
      callbacks: {
        title(context) {
          const area = props.areas[context[0].dataIndex]
          return area.areaLabel
        },
        label(context) {
          const area = props.areas[context.dataIndex]
          return [
            `Reports: ${area.reportCount}`,
            `Severity: ${area.mostSevereRating}`
          ]
        }
      }
    }
  },
  scales: {
    x: {
      ticks: {
        maxRotation: 25,
        minRotation: 25,
        font: { size: 11 }
      },
      grid: { display: false }
    },
    y: {
      beginAtZero: true,
      ticks: { stepSize: 1 },
      grid: { color: '#e5e7eb' }
    }
  }
}
</script>

<template>
  <div class="card border-0 shadow-sm h-100">
    <div class="card-body">
      <h6 class="text-uppercase text-muted small mb-3">
        Most-Reported Flood-Prone Areas
      </h6>

      <div class="chart-wrapper">
        <Bar v-if="areas.length" :data="chartData" :options="chartOptions" />
        <p v-else class="text-muted text-center py-5">
          No community reports yet.
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.chart-wrapper {
  position: relative;
  height: 350px;
}
</style>