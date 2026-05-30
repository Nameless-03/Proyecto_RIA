<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useI18n } from '../composables/useI18n'

const authStore = useAuthStore()
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
              <option value="ARS">
                {{ t('Peso Argentino ($ ARS)') }}
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
    </div>
  </div>
</template>

<style scoped>
.profile-view {
  padding-top: 2rem;
  padding-bottom: 4rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.profile-header {
  border-left: 4px solid var(--color-primary);
  padding-left: 1rem;
}

.profile-header__title {
  font-size: 2.25rem;
  font-weight: 800;
}

.profile-header__subtitle {
  color: var(--color-text-secondary);
}

/* Profile Grid */
.profile-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
}

@media (max-width: 768px) {
  .profile-grid {
    grid-template-columns: 1fr;
  }
}

.profile-card {
  background-color: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-lg);
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.profile-card--full-width {
  grid-column: 1 / -1;
}

.profile-card__title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #ffffff;
}

body.theme-light .profile-card__title {
  color: var(--color-text-primary);
}

.profile-card__text {
  color: var(--color-text-secondary);
  line-height: 1.6;
}

.profile-card__link {
  color: var(--color-primary);
  font-weight: 600;
  text-decoration: underline;
}

.profile-card__link:hover {
  color: var(--color-primary-hover);
}

.profile-card__divider {
  border: none;
  border-top: 1px solid var(--color-border);
}

/* User Profile (Logged In) */
.user-profile {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  text-align: center;
  background-color: var(--color-bg-tertiary);
  padding: 1.5rem;
  border-radius: var(--border-radius-lg);
  border: 1px solid var(--color-border);
}

.user-profile__avatar {
  background-color: var(--color-primary);
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-profile__info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.user-profile__username {
  font-size: 1.2rem;
}

.user-profile__email {
  color: var(--color-text-secondary);
  font-size: 0.95rem;
}

.user-profile__date {
  color: var(--color-text-secondary);
  font-size: 0.85rem;
}

.user-profile__btn {
  margin-top: 1rem;
  width: 100%;
}

/* Forms general */
.login-form,
.preferences-form,
.api-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.login-form__info {
  color: var(--color-text-secondary);
  font-size: 0.95rem;
}

.login-form__error {
  background-color: rgba(255, 56, 96, 0.15);
  border: 1px solid var(--color-danger);
  color: var(--color-danger);
  padding: 0.75rem;
  border-radius: var(--border-radius-md);
  font-size: 0.9rem;
  font-weight: 500;
}

.login-form__btn,
.preferences-form__btn {
  margin-top: 0.5rem;
}

.preferences-form__success,
.api-form__success {
  background-color: rgba(0, 245, 212, 0.15);
  border: 1px solid var(--color-accent-green);
  color: var(--color-accent-green);
  padding: 0.75rem;
  border-radius: var(--border-radius-md);
  font-size: 0.9rem;
  font-weight: 500;
}

/* Theme Selector */
.theme-selector {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.theme-selector__label {
  font-weight: 600;
  color: var(--color-text-secondary);
}

.theme-selector__buttons {
  display: flex;
  gap: 1rem;
}

.theme-selector__buttons .btn {
  flex: 1;
}

/* Form fields overrides */
.form-field--checkbox {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.form-field__checkbox {
  margin-top: 0.25rem;
  cursor: pointer;
  accent-color: var(--color-primary);
  width: 18px;
  height: 18px;
}

.form-field__label-checkbox {
  font-size: 0.95rem;
  color: var(--color-text-secondary);
  cursor: pointer;
}

/* API form input group */
.api-form__input-group {
  display: flex;
  gap: 1rem;
}

.api-form__input {
  flex: 1;
  margin-bottom: 0;
}

.form-field__help {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
  margin-top: 0.4rem;
}

@media (max-width: 576px) {
  .api-form__input-group {
    flex-direction: column;
  }
}
</style>
