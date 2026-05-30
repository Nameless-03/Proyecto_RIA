<script setup>
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
import AppNavbar from './components/AppNavbar.vue'
import { useAuthStore } from './stores/auth'

const authStore = useAuthStore()

// Al montar la app, sincronizamos el tema guardado en localStorage en el body.
onMounted(() => {
  document.body.className = `theme-${authStore.theme}`
})
</script>

<template>
  <div class="app-layout">
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
          <h4 class="app-footer__title">🎮 ANTIGRAVITY GAMES</h4>
          <p class="app-footer__text">
            Proyecto desarrollado para el Laboratorio Universitario de Taller de RIA.
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
        © 2026 Antigravity Games. Todos los derechos reservados.
      </div>
    </footer>
  </div>
</template>

<style scoped>
.app-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.app-layout__main {
  flex-grow: 1;
  width: 100%;
}

/* Footer styling in Twitch theme */
.app-footer {
  background-color: var(--color-bg-secondary);
  border-top: 1px solid var(--color-border);
  padding: 3rem 0 1.5rem;
  margin-top: auto;
  color: var(--color-text-secondary);
}

.app-footer__container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2.5rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid var(--color-border);
}

.app-footer__section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.app-footer__title {
  color: #ffffff;
  font-size: 1.1rem;
  font-weight: 700;
}

body.theme-light .app-footer__title {
  color: var(--color-text-primary);
}

.app-footer__text {
  font-size: 0.95rem;
  line-height: 1.6;
}

.app-footer__links {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.app-footer__link {
  font-size: 0.95rem;
}

.app-footer__link:hover {
  color: var(--color-primary);
}

.app-footer__copyright {
  text-align: center;
  font-size: 0.85rem;
  margin-top: 1.5rem;
  color: var(--color-text-secondary);
}

.text-success {
  color: var(--color-accent-green);
}

.text-warning {
  color: #ffc107;
}

@media (max-width: 768px) {
  .app-footer__container {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
}
</style>
