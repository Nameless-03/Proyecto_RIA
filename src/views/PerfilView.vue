<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useGamesStore } from '../stores/games'
import { useI18n } from '../composables/useI18n'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { Pie } from 'vue-chartjs'

ChartJS.register(ArcElement, Tooltip, Legend)

const authStore = useAuthStore()
const gamesStore = useGamesStore()
const { t } = useI18n()

// Form States
const usernameInput = ref('')
const passwordInput = ref('')
const loginError = ref('')

// Preferences local states
const selectedCurrency = ref(authStore.preferences.currency)
const selectedGenre = ref(authStore.preferences.preferredGenre)
const selectedLanguage = ref(authStore.preferences.language)
const newsletterChecked = ref(authStore.preferences.newsletter)
const showPrefsSuccess = ref(false)

const handleLogin = () => {
  loginError.value = ''
  try {
    authStore.login(usernameInput.value, passwordInput.value)
    // Reset forms
    usernameInput.value = ''
    passwordInput.value = ''
  } catch (err) {
    loginError.value = err.message
  }
}

const handleLogout = () => {
  authStore.logout()
}

const handleSavePreferences = () => {
  authStore.updatePreferences({
    currency: selectedCurrency.value,
    preferredGenre: selectedGenre.value,
    language: selectedLanguage.value,
    newsletter: newsletterChecked.value,
  })
  showPrefsSuccess.value = true
  setTimeout(() => {
    showPrefsSuccess.value = false
  }, 3000)
}

// Chart Data
const chartData = computed(() => {
  const stats = gamesStore.favoritesGenresStats
  const backgroundColors = [
    '#9146FF',
    '#00F5D4',
    '#F15BB5',
    '#FEE440',
    '#00BBF9',
    '#9B5DE5',
    '#38B000',
    '#F50057',
    '#FF9F1C',
    '#2EC4B6',
  ]
  return {
    labels: stats.map((s) => s.name),
    datasets: [
      {
        backgroundColor: backgroundColors.slice(0, stats.length),
        borderWidth: 2,
        borderColor: authStore.theme === 'dark' ? '#2b2b36' : '#ffffff',
        data: stats.map((s) => s.count),
      },
    ],
  }
})

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        color: authStore.theme === 'dark' ? '#ffffff' : '#1e1e24',
        padding: 20,
        font: {
          family: 'Inter, system-ui, sans-serif',
          size: 13,
        },
      },
    },
    tooltip: {
      bodyFont: {
        family: 'Inter, system-ui, sans-serif',
      },
    },
  },
}))
</script>

<template>
  <div class="profile-view container fade-in">
    <header class="profile-header">
      <h1 class="profile-header__title">{{ t('Mi Perfil') }}</h1>
      <p class="profile-header__subtitle">
        {{ t('Configura tu experiencia de juego y tus preferencias personales') }}
      </p>
    </header>

    <div class="profile-grid">
      <!-- Section 1: Simulated Auth -->
      <section class="profile-card">
        <h2 class="profile-card__title">{{ t('Control de Sesión') }}</h2>

        <!-- Case 1: User is Logged In -->
        <div v-if="authStore.isLoggedIn" class="user-profile">
          <div class="user-profile__avatar">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="36"
              height="36"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#ffffff"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
          <div class="user-profile__info">
            <p class="user-profile__username">
              {{ t('¡Bienvenido,') }} <strong>{{ authStore.getUsername }}</strong>
            </p>
            <p class="user-profile__email">{{ authStore.user.email }}</p>
            <p class="user-profile__date">
              {{ t('Miembro desde:') }} {{ authStore.user.joinedDate }}
            </p>
          </div>
          <button @click="handleLogout" class="btn btn--danger user-profile__btn">
            {{ t('Cerrar Sesión') }}
          </button>
        </div>

        <!-- Case 2: Guest Mode / Login Form -->
        <form v-else @submit.prevent="handleLogin" class="login-form">
          <p class="login-form__info">
            {{
              t(
                'Inicia sesión de forma simulada para desbloquear la experiencia personalizada y sincronizar tus favoritos en la nube.',
              )
            }}
          </p>

          <div v-if="loginError" class="login-form__error">
            {{ loginError }}
          </div>

          <div class="form-field">
            <label class="form-field__label" for="username">{{ t('Nombre de usuario') }}</label>
            <input
              id="username"
              type="text"
              v-model="usernameInput"
              placeholder="Ej: gamer123"
              class="form-field__input"
              required
            />
          </div>

          <div class="form-field">
            <label class="form-field__label" for="password">{{ t('Contraseña') }}</label>
            <input
              id="password"
              type="password"
              v-model="passwordInput"
              placeholder="••••••••"
              class="form-field__input"
              required
            />
          </div>

          <button type="submit" class="btn btn--primary login-form__btn">
            {{ t('Iniciar Sesión') }}
          </button>
        </form>
      </section>

      <!-- Section 2: Visual and App Preferences -->
      <section class="profile-card">
        <h2 class="profile-card__title">{{ t('Preferencias de Plataforma') }}</h2>

        <!-- Theme Selection -->
        <div class="theme-selector">
          <span class="theme-selector__label">{{ t('Tema Visual') }}</span>
          <div class="theme-selector__buttons">
            <button
              @click="authStore.setTheme('dark')"
              class="btn"
              :class="authStore.theme === 'dark' ? 'btn--primary' : 'btn--secondary'"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
              </svg>
              <span>{{ t('Tema Oscuro') }}</span>
            </button>
            <button
              @click="authStore.setTheme('light')"
              class="btn"
              :class="authStore.theme === 'light' ? 'btn--primary' : 'btn--secondary'"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <circle cx="12" cy="12" r="5"></circle>
                <line x1="12" y1="1" x2="12" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line>
                <line x1="21" y1="12" x2="23" y2="12"></line>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
              </svg>
              <span>{{ t('Tema Claro') }}</span>
            </button>
          </div>
        </div>

        <hr class="profile-card__divider" />

        <!-- User Preferences Form -->
        <form @submit.prevent="handleSavePreferences" class="preferences-form">
          <div v-if="showPrefsSuccess" class="preferences-form__success">
            {{ t('¡Preferencias guardadas con éxito!') }}
          </div>

          <div class="form-field">
            <label class="form-field__label" for="currency">{{ t('Moneda Preferida') }}</label>
            <select id="currency" v-model="selectedCurrency" class="form-field__input">
              <option value="USD">
                {{ t('Dólar ($ USD)') }}
              </option>
              <option value="EUR">Euro (€ EUR)</option>
              <option value="UYU">
                {{ t('Peso Uruguayo ($ UYU)') }}
              </option>
            </select>
          </div>

          <div class="form-field">
            <label class="form-field__label" for="pref-genre">{{ t('Género Favorito') }}</label>
            <select id="pref-genre" v-model="selectedGenre" class="form-field__input">
              <option value="">
                {{ t('Ninguno') }}
              </option>
              <option value="action">
                {{ t('Acción') }}
              </option>
              <option value="role-playing-games-rpg">RPG</option>
              <option value="adventure">
                {{ t('Aventura') }}
              </option>
              <option value="indie">Indie</option>
            </select>
          </div>

          <div class="form-field">
            <label class="form-field__label" for="pref-language">{{
              t('Idioma de Preferencia')
            }}</label>
            <select id="pref-language" v-model="selectedLanguage" class="form-field__input">
              <option value="es">Español</option>
              <option value="en">Inglés (Original)</option>
              <option value="pt">Portugués</option>
              <option value="fr">Francés</option>
              <option value="de">Alemán</option>
              <option value="it">Italiano</option>
            </select>
          </div>

          <div class="form-field form-field--checkbox">
            <input
              id="newsletter"
              type="checkbox"
              v-model="newsletterChecked"
              class="form-field__checkbox"
            />
            <label class="form-field__label-checkbox" for="newsletter">
              {{ t('Recibir ofertas de videojuegos por correo electrónico') }}
            </label>
          </div>

          <button type="submit" class="btn btn--secondary preferences-form__btn">
            {{ t('Guardar Preferencias') }}
          </button>
        </form>
      </section>

      <!-- Section 3: Estadísticas -->
      <section class="profile-card profile-card--full-width fade-in">
        <h2 class="profile-card__title">{{ t('Tus Géneros Favoritos') }}</h2>
        <div class="stats-container">
          <div v-if="gamesStore.favoritesGenresStats.length === 0" class="stats-empty">
            {{ t('Agrega juegos a tus favoritos para ver tus estadísticas.') }}
          </div>
          <div v-else class="chart-wrapper">
            <Pie :data="chartData" :options="chartOptions" />
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
