<script setup>
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
import AppNavbar from './components/AppNavbar.vue'
import { useAuthStore } from './stores/auth'
import { useI18n } from './composables/useI18n'

const authStore = useAuthStore()
const { t } = useI18n()

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
            {{
              authStore.preferences.language === 'en'
                ? 'Project developed for the University Laboratory of RIA Workshop.'
                : authStore.preferences.language === 'pt'
                  ? 'Projeto desenvolvido para o Laboratório Universitário de Oficina de RIA.'
                  : authStore.preferences.language === 'fr'
                    ? "Projet développé pour le Laboratoire Universitaire d'Atelier de RIA."
                    : authStore.preferences.language === 'de'
                      ? 'Projekt entwickelt für das Universitätslabor des RIA-Workshops.'
                      : authStore.preferences.language === 'it'
                        ? 'Progetto sviluppato per il Laboratorio Universitario del Laboratorio di RIA.'
                        : 'Proyecto desarrollado para el Laboratorio Universitario de Taller de RIA.'
            }}
          </p>
        </div>

        <div class="app-footer__section">
          <h4 class="app-footer__title">
            {{
              authStore.preferences.language === 'en'
                ? 'Quick Links'
                : authStore.preferences.language === 'pt'
                  ? 'Links rápidos'
                  : authStore.preferences.language === 'fr'
                    ? 'Liens rapides'
                    : authStore.preferences.language === 'de'
                      ? 'Schnelllinks'
                      : authStore.preferences.language === 'it'
                        ? 'Link rapidi'
                        : 'Enlaces rápidos'
            }}
          </h4>
          <div class="app-footer__links">
            <RouterLink to="/" class="app-footer__link">{{ t('nav.home') }}</RouterLink>
            <RouterLink to="/catalog" class="app-footer__link">{{ t('nav.catalog') }}</RouterLink>
            <RouterLink to="/favorites" class="app-footer__link">{{
              t('nav.favorites')
            }}</RouterLink>
            <RouterLink to="/profile" class="app-footer__link">{{ t('nav.profile') }}</RouterLink>
          </div>
        </div>

        <div class="app-footer__section">
          <h4 class="app-footer__title">
            {{
              authStore.preferences.language === 'en'
                ? 'API Status'
                : authStore.preferences.language === 'pt'
                  ? 'Estado da API'
                  : authStore.preferences.language === 'fr'
                    ? 'Statut API'
                    : authStore.preferences.language === 'de'
                      ? 'API-Status'
                      : authStore.preferences.language === 'it'
                        ? 'Stato API'
                        : 'Estado API'
            }}
          </h4>
          <p class="app-footer__text">
            {{
              authStore.preferences.language === 'en'
                ? 'Mode:'
                : authStore.preferences.language === 'pt'
                  ? 'Modo:'
                  : authStore.preferences.language === 'fr'
                    ? 'Mode :'
                    : authStore.preferences.language === 'de'
                      ? 'Modus:'
                      : authStore.preferences.language === 'it'
                        ? 'Modalità:'
                        : 'Modo:'
            }}
            <strong :class="authStore.rawgApiKey ? 'text-success' : 'text-warning'">
              {{
                authStore.rawgApiKey
                  ? authStore.preferences.language === 'en'
                    ? 'RAWG API Connected'
                    : authStore.preferences.language === 'pt'
                      ? 'RAWG API Conectada'
                      : authStore.preferences.language === 'fr'
                        ? 'RAWG API Connectée'
                        : authStore.preferences.language === 'de'
                          ? 'RAWG API Verbunden'
                          : authStore.preferences.language === 'it'
                            ? 'RAWG API Connessa'
                            : 'RAWG API Conectada'
                  : authStore.preferences.language === 'en'
                    ? 'Simulated (Offline)'
                    : authStore.preferences.language === 'pt'
                      ? 'Simulado (Offline)'
                      : authStore.preferences.language === 'fr'
                        ? 'Simulé (Hors ligne)'
                        : authStore.preferences.language === 'de'
                          ? 'Simuliert (Offline)'
                          : authStore.preferences.language === 'it'
                            ? 'Simulato (Offline)'
                            : 'Simulado (Offline)'
              }}
            </strong>
          </p>
        </div>
      </div>
      <div class="app-footer__copyright">
        © 2026 LittleBox Games.
        {{
          authStore.preferences.language === 'en'
            ? 'All rights reserved.'
            : authStore.preferences.language === 'pt'
              ? 'Todos os direitos reservados.'
              : authStore.preferences.language === 'fr'
                ? 'Tous droits réservés.'
                : authStore.preferences.language === 'de'
                  ? 'Alle Rechte vorbehalten.'
                  : authStore.preferences.language === 'it'
                    ? 'Tutti i diritti riservati.'
                    : 'Todos los derechos reservados.'
        }}
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

.app-footer__title--logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.app-footer__logo-svg {
  stroke: var(--color-primary);
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
