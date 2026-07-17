import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    loading: true
  }),

  actions: {
    async loginWithGoogle(credential) {
      const config = useRuntimeConfig()
      try {
        const { user } = await $fetch(`${config.public.apiBase}/auth/google`, {
          method: 'POST',
          credentials: 'include',
          body: { credential }
        })
        this.user = user
      } catch (err) {
        console.error('Google login failed', err)
        throw err
      }
    },

    async fetchMe() {
      const config = useRuntimeConfig()
      this.loading = true
      try {
        const { user } = await $fetch(`${config.public.apiBase}/auth/me`, {
          credentials: 'include'
        })
        this.user = user
      } catch {
        this.user = null
      } finally {
        this.loading = false
      }
    },

    async logout() {
      const config = useRuntimeConfig()
      await $fetch(`${config.public.apiBase}/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      })
      this.user = null
    }
  },

  getters: {
    isLoggedIn: (state) => !!state.user
  }
})