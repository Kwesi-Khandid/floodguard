import { defineStore } from 'pinia'

export const useAssessmentStore = defineStore('assessment', {
  state: () => ({
    current: null,   // holds the last /api/flood-risk response, for handoff between pages
    history: []       // logged-in user's past assessments, loaded on history.vue
  }),

  actions: {
    setCurrent(result) {
      this.current = result
    },

    clearCurrent() {
      this.current = null
    },

    async fetchById(id) {
      const config = useRuntimeConfig()
      const data = await $fetch(`${config.public.apiBase}/flood-risk/${id}`)
      return data
    },

    async fetchHistory() {
      const config = useRuntimeConfig()
      const { assessments } = await $fetch(`${config.public.apiBase}/history`, {
        credentials: 'include'
      })
      this.history = assessments
    },

    async deleteAssessment(id) {
      const config = useRuntimeConfig()
      await $fetch(`${config.public.apiBase}/history/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      })
      this.history = this.history.filter((a) => a.id !== id)
    }
  }
})