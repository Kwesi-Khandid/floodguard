<script setup>
const route = useRoute()
const authStore = useAuthStore()
const isOpen = ref(false) // mobile drawer state

const navItems = [
  { to: '/', label: 'Check Risk', icon: 'bi-search' },
  { to: '/report', label: 'Report Flooding', icon: 'bi-exclamation-triangle' },
  { to: '/dashboard', label: 'Dashboard', icon: 'bi-bar-chart' },
  { to: '/about', label: 'About', icon: 'bi-info-circle' }
]

function isActive(path) {
  return path === '/' ? route.path === '/' : route.path.startsWith(path)
}

function closeMobile() {
  isOpen.value = false
}

// Close the mobile drawer whenever the route changes (after clicking a link)
watch(() => route.path, closeMobile)
</script>

<template>
  <!-- Mobile top bar: hamburger + brand, only visible under 992px -->
  <div class="mobile-topbar">
    <button class="hamburger" @click="isOpen = true" aria-label="Open menu">
      <i class="bi bi-list"></i>
    </button>
    <NuxtLink to="/" class="mobile-brand">
      <i class="bi bi-water"></i> FloodGuard
    </NuxtLink>
  </div>

  <!-- Backdrop, only shown when mobile drawer is open -->
  <div v-if="isOpen" class="backdrop" @click="closeMobile"></div>

  <aside class="sidebar" :class="{ 'sidebar-open': isOpen }">
    <div class="sidebar-header">
      <NuxtLink to="/" class="brand">
        <i class="bi bi-water"></i>
        <span>FloodGuard</span>
      </NuxtLink>
      <button class="close-btn" @click="closeMobile" aria-label="Close menu">
        <i class="bi bi-x-lg"></i>
      </button>
    </div>

    <nav class="nav-links">
      <NuxtLink
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        class="nav-link"
        :class="{ active: isActive(item.to) }"
      >
        <i :class="`bi ${item.icon}`"></i>
        <span>{{ item.label }}</span>
      </NuxtLink>

      <NuxtLink
        v-if="authStore.isLoggedIn"
        to="/history"
        class="nav-link"
        :class="{ active: isActive('/history') }"
      >
        <i class="bi bi-clock-history"></i>
        <span>My History</span>
      </NuxtLink>
    </nav>

    <div class="sidebar-footer">
      <template v-if="authStore.isLoggedIn">
        <div class="user-info">
          <img :src="authStore.user.avatar_url" class="avatar" />
          <div class="user-text">
            <p class="user-name">{{ authStore.user.full_name }}</p>
            <p class="user-email">{{ authStore.user.email }}</p>
          </div>
        </div>
        <button class="signout-btn" @click="authStore.logout">
          <i class="bi bi-box-arrow-right"></i> Sign out
        </button>
      </template>
      <template v-else>
        <p class="signin-prompt">Sign in to save your check history</p>
        <GoogleSignInButton />
      </template>
    </div>
  </aside>
</template>

<style>
/* ===========================
   MOBILE TOP BAR
=========================== */
.mobile-topbar {
  display: none;
  align-items: center;
  gap: 14px;
  padding: 14px 18px;
  background: white;
  box-shadow: 0 2px 10px rgba(15, 23, 42, .06);
  position: sticky;
  top: 0;
  z-index: 30;
}

.hamburger {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #0f172a;
  cursor: pointer;
  display: flex;
}

.mobile-brand {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 800;
  color: #2563eb;
  text-decoration: none;
  font-size: 1.1rem;
}

/* ===========================
   BACKDROP (mobile only)
=========================== */
.backdrop {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, .45);
  z-index: 40;
}

/* ===========================
   SIDEBAR
=========================== */
.sidebar {
  width: 260px;
  flex-shrink: 0;
  height: 100vh;
  position: sticky;
  top: 0;
  display: flex;
  flex-direction: column;
  background: white;
  border-right: 1px solid #eef2f7;
  box-sizing: border-box;
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 20px 20px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 800;
  font-size: 1.25rem;
  color: #2563eb;
  text-decoration: none;
}

.close-btn {
  display: none;
  background: none;
  border: none;
  font-size: 1.2rem;
  color: #64748b;
  cursor: pointer;
}

.nav-links {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 10px 14px;
  flex: 1;
  overflow-y: auto;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 14px;
  color: #475569;
  font-weight: 600;
  font-size: .95rem;
  text-decoration: none;
  transition: .18s;
}

.nav-link i {
  font-size: 1.1rem;
  width: 20px;
  text-align: center;
}

.nav-link:hover {
  background: #f1f5f9;
  color: #0f172a;
}

.nav-link.active {
  background: linear-gradient(135deg, #2563eb, #06b6d4);
  color: white;
  box-shadow: 0 8px 20px rgba(37, 99, 235, .25);
}

.sidebar-footer {
  padding: 16px;
  border-top: 1px solid #eef2f7;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  flex-shrink: 0;
}

.user-text {
  min-width: 0;
}

.user-name {
  margin: 0;
  font-weight: 700;
  font-size: .9rem;
  color: #0f172a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-email {
  margin: 0;
  font-size: .78rem;
  color: #94a3b8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.signout-btn {
  width: 100%;
  padding: 10px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  background: white;
  color: #475569;
  font-weight: 600;
  font-size: .85rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
}

.signout-btn:hover {
  background: #f8fafc;
}

.signin-prompt {
  font-size: .82rem;
  color: #64748b;
  margin: 0 0 10px;
  text-align: center;
}

/* ===========================
   RESPONSIVE — collapses to a
   slide-in drawer under 992px
=========================== */
@media (max-width: 992px) {
  .mobile-topbar {
    display: flex;
  }

  .backdrop {
    display: block;
  }

  .sidebar {
    position: fixed;
    left: 0;
    top: 0;
    z-index: 50;
    transform: translateX(-100%);
    transition: transform .25s ease;
    box-shadow: 0 0 40px rgba(15, 23, 42, .15);
  }

  .sidebar-open {
    transform: translateX(0);
  }

  .close-btn {
    display: flex;
  }
}
</style>