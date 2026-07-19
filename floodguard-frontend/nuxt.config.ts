export default defineNuxtConfig({
  compatibilityDate: '2026-01-01',
  devtools: { enabled: true },

  css: [
    'bootstrap/dist/css/bootstrap.min.css',
    'bootstrap-icons/font/bootstrap-icons.css',
    'leaflet/dist/leaflet.css'   // add this line
  ],

  app: {
    head: {
      title: 'FloodGuard',
      meta: [
        { name: 'description', content: 'Check flood risk for any location before you buy or build.' }
      ]
    }
  },

  runtimeConfig: {
    public: {
      // Points at your Express backend — swap for the deployed URL in production
      apiBase: process.env.NUXT_PUBLIC_API_BASE,
      googleClientId: process.env.NUXT_PUBLIC_GOOGLE_CLIENT_ID
    }
  },

  modules: ['@pinia/nuxt'],

  build: {
    transpile: ['chart.js']
  },

  vite: {
  optimizeDeps: {
    include: [
      'leaflet',
      '@vue/devtools-core',
      '@vue/devtools-kit'
    ]
  }
}
})