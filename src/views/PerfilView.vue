<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()

// Form States
const usernameInput = ref('')
const passwordInput = ref('')
const loginError = ref('')

// Preferences local states
const selectedCurrency = ref(authStore.preferences.currency)
const selectedGenre = ref(authStore.preferences.preferredGenre)
const newsletterChecked = ref(authStore.preferences.newsletter)
const showPrefsSuccess = ref(false)

// API key local state
const apiKeyInput = ref(authStore.rawgApiKey)
const showApiSuccess = ref(false)

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
    newsletter: newsletterChecked.value,
  })
  showPrefsSuccess.value = true
  setTimeout(() => {
    showPrefsSuccess.value = false
  }, 3000)
}

const handleSaveApiKey = () => {
  authStore.updateApiKey(apiKeyInput.value)
  showApiSuccess.value = true
  setTimeout(() => {
    showApiSuccess.value = false
  }, 3000)
  // Reload page to refresh API data source
  setTimeout(() => {
    window.location.reload()
  }, 800)
}
</script>

<template>
  <div class="profile-view container fade-in">
    <header class="profile-header">
      <h1 class="profile-header__title">Mi Perfil y Preferencias</h1>
      <p class="profile-header__subtitle">
        Gestiona tu sesión simulada, el tema visual y las configuraciones de la aplicación.
      </p>
    </header>

    <div class="profile-grid">
      <!-- Section 1: Simulated Auth -->
      <section class="profile-card">
        <h2 class="profile-card__title">Sesión Simulada (sessionStorage)</h2>

        <!-- Case 1: User is Logged In -->
        <div v-if="authStore.isLoggedIn" class="user-profile">
          <div class="user-profile__avatar">👤</div>
          <div class="user-profile__info">
            <p class="user-profile__username">
              Bienvenido, <strong>{{ authStore.getUsername }}</strong>
            </p>
            <p class="user-profile__email">{{ authStore.user.email }}</p>
            <p class="user-profile__date">Miembro desde: {{ authStore.user.joinedDate }}</p>
          </div>
          <button @click="handleLogout" class="btn btn--danger user-profile__btn">
            Cerrar Sesión
          </button>
        </div>

        <!-- Case 2: Guest Mode / Login Form -->
        <form v-else @submit.prevent="handleLogin" class="login-form">
          <p class="login-form__info">
            Inicia sesión de forma simulada para desbloquear la gestión completa del perfil.
          </p>

          <div v-if="loginError" class="login-form__error">
            {{ loginError }}
          </div>

          <div class="form-field">
            <label class="form-field__label" for="username">Nombre de usuario</label>
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
            <label class="form-field__label" for="password">Contraseña (Simulada)</label>
            <input
              id="password"
              type="password"
              v-model="passwordInput"
              placeholder="••••••••"
              class="form-field__input"
              required
            />
          </div>

          <button type="submit" class="btn btn--primary login-form__btn">Iniciar Sesión</button>
        </form>
      </section>

      <!-- Section 2: Visual and App Preferences -->
      <section class="profile-card">
        <h2 class="profile-card__title">Configuraciones y Tema (localStorage)</h2>

        <!-- Theme Selection -->
        <div class="theme-selector">
          <span class="theme-selector__label">Tema Visual:</span>
          <div class="theme-selector__buttons">
            <button
              @click="authStore.setTheme('dark')"
              class="btn"
              :class="authStore.theme === 'dark' ? 'btn--primary' : 'btn--secondary'"
            >
              🌙 Oscuro (Twitch)
            </button>
            <button
              @click="authStore.setTheme('light')"
              class="btn"
              :class="authStore.theme === 'light' ? 'btn--primary' : 'btn--secondary'"
            >
              ☀️ Claro
            </button>
          </div>
        </div>

        <hr class="profile-card__divider" />

        <!-- User Preferences Form -->
        <form @submit.prevent="handleSavePreferences" class="preferences-form">
          <div v-if="showPrefsSuccess" class="preferences-form__success">
            ✓ Preferencias guardadas correctamente en localStorage.
          </div>

          <div class="form-field">
            <label class="form-field__label" for="currency">Moneda de compra</label>
            <select id="currency" v-model="selectedCurrency" class="form-field__input">
              <option value="USD">Dólar ($ USD)</option>
              <option value="EUR">Euro (€ EUR)</option>
              <option value="ARS">Peso Argentino ($ ARS)</option>
            </select>
          </div>

          <div class="form-field">
            <label class="form-field__label" for="pref-genre">Género preferido</label>
            <select id="pref-genre" v-model="selectedGenre" class="form-field__input">
              <option value="">Ninguno</option>
              <option value="action">Acción</option>
              <option value="role-playing-games-rpg">RPG</option>
              <option value="adventure">Aventura</option>
              <option value="indie">Indie</option>
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
              Recibir ofertas de videojuegos por correo electrónico
            </label>
          </div>

          <button type="submit" class="btn btn--secondary preferences-form__btn">
            Guardar Preferencias
          </button>
        </form>
      </section>

      <!-- Section 3: RAWG API Config -->
      <section class="profile-card profile-card--full-width">
        <h2 class="profile-card__title">Conexión con RAWG.io (Opcional)</h2>
        <p class="profile-card__text">
          Por defecto, el laboratorio utiliza una base de datos local simulada para evitar errores
          de conexión. Si quieres consumir la API real de RAWG.io con miles de videojuegos reales,
          puedes obtener una clave gratuita en
          <a href="https://rawg.io/apidocs" target="_blank" class="profile-card__link"
            >RAWG API Docs</a
          >
          e ingresarla aquí.
        </p>

        <form @submit.prevent="handleSaveApiKey" class="api-form">
          <div v-if="showApiSuccess" class="api-form__success">
            ✓ Clave API guardada. Recargando la aplicación...
          </div>

          <div class="form-field">
            <label class="form-field__label" for="api-key">Clave de API de RAWG</label>
            <div class="api-form__input-group">
              <input
                id="api-key"
                type="text"
                v-model="apiKeyInput"
                placeholder="Ingresa tu API Key (ej. 3abcde12345...)"
                class="form-field__input api-form__input"
              />
              <button type="submit" class="btn btn--primary">Conectar API</button>
            </div>
            <p class="form-field__help">
              Se guardará de forma segura en tu navegador (localStorage).
            </p>
          </div>
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
  font-size: 3.5rem;
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
