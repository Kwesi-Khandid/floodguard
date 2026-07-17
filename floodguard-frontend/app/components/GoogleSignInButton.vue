<script setup>
const config = useRuntimeConfig()
const auth = useAuthStore()
const buttonEl = ref(null)

onMounted(() => {
  const script = document.createElement('script')
  script.src = 'https://accounts.google.com/gsi/client'
  script.async = true
  script.onload = () => {
    window.google.accounts.id.initialize({
      client_id: config.public.googleClientId,
      callback: handleCredentialResponse
    })
    window.google.accounts.id.renderButton(buttonEl.value, {
      theme: 'outline',
      size: 'large',
      shape: 'pill'
    })
  }
  document.head.appendChild(script)
})

async function handleCredentialResponse(response) {
  await auth.loginWithGoogle(response.credential)
}
</script>

<template>
  <div ref="buttonEl"></div>
</template>