<script setup>
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
import AppNavbar from './components/AppNavbar.vue'
import { useAuthStore } from './stores/auth'
import { useOffline } from './composables/useOffline'
import { precalentarCache } from './composables/usePrecalentamientoCache'

const authStore = useAuthStore()
const { estaOffline } = useOffline()

// Al montar la app, sincronizamos el tema guardado en localStorage en el body.
// En background, precalentamos la caché de IndexedDB con datos del catálogo.
onMounted(() => {
  document.body.className = `theme-${authStore.theme}`
  precalentarCache()
})
</script>

<template>
  <div class="app-layout">
    <!-- Banner de modo offline -->
    <Transition name="offline-banner">
      <div v-if="estaOffline" class="offline-banner" role="alert" aria-live="assertive">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <line x1="1" y1="1" x2="23" y2="23"></line>
          <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"></path>
          <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"></path>
          <path d="M10.71 5.05A16 16 0 0 1 22.56 9"></path>
          <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"></path>
          <path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path>
          <line x1="12" y1="20" x2="12.01" y2="20"></line>
        </svg>
        <span>Sin conexión — navegando con datos en caché</span>
      </div>
    </Transition>

    <!-- Navbar Global -->
    <AppNavbar />

    <!-- Contenedor de Vistas -->
    <main class="app-layout__main">
      <RouterView />
    </main>

    <!-- Footer Global -->
    <footer class="app-footer">
      <div class="app-footer__container container">
        <div class="app-footer__section">
          <h4 class="app-footer__title app-footer__title--logo">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="app-footer__logo-svg"
            >
              <path
                d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"
              ></path>
              <polyline points="3.29 7 12 12 20.71 7"></polyline>
              <line x1="12" y1="22" x2="12" y2="12"></line>
            </svg>
            LITTLEBOX GAMES
          </h4>
          <p class="app-footer__text">
            Proyecto para el Laboratorio del Taller de RIA.
            <br />
            Hola Nico :D
          </p>
        </div>

        <div class="app-footer__section">
          <h4 class="app-footer__title">Enlaces rápidos</h4>
          <div class="app-footer__links">
            <RouterLink to="/" class="app-footer__link">Inicio</RouterLink>
            <RouterLink to="/catalog" class="app-footer__link">Catálogo</RouterLink>
            <RouterLink to="/favorites" class="app-footer__link">Favoritos</RouterLink>
            <RouterLink to="/profile" class="app-footer__link">Perfil</RouterLink>
          </div>
        </div>

        <div class="app-footer__section">
          <h4 class="app-footer__title">Estado API</h4>
          <p class="app-footer__text">
            Modo:
            <strong :class="authStore.rawgApiKey ? 'text-success' : 'text-warning'">
              {{ authStore.rawgApiKey ? 'RAWG API Conectada' : 'Simulado (Offline)' }}
            </strong>
          </p>
        </div>
      </div>
      <div class="app-footer__copyright">
        © 2026 LittleBox Games. Todos los derechos reservados.
      </div>
    </footer>
  </div>
</template>
