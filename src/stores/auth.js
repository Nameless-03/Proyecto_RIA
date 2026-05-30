import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(sessionStorage.getItem('auth_user')) || null,
    theme: localStorage.getItem('user_theme') || 'dark',
    preferences: JSON.parse(localStorage.getItem('user_preferences')) || {
      currency: 'USD',
      preferredGenre: '',
      newsletter: false,
    },
    rawgApiKey: localStorage.getItem('rawg_api_key') || '',
  }),

  getters: {
    isLoggedIn: (state) => !!state.user,
    getUsername: (state) => (state.user ? state.user.username : 'Invitado'),
    getTheme: (state) => state.theme,
    getPreferences: (state) => state.preferences,
    getApiKey: (state) => state.rawgApiKey,
  },

  actions: {
    login(username, _password) {
      // Simulación de login - acepta cualquier usuario no vacío
      if (!username || !username.trim()) {
        throw new Error('El nombre de usuario es obligatorio')
      }

      const simulatedUser = {
        username: username.trim(),
        email: `${username.trim().toLowerCase()}@example.com`,
        joinedDate: new Date().toLocaleDateString(),
      }

      this.user = simulatedUser
      sessionStorage.setItem('auth_user', JSON.stringify(simulatedUser))
      return simulatedUser
    },

    logout() {
      this.user = null
      sessionStorage.removeItem('auth_user')
    },

    setTheme(newTheme) {
      if (newTheme !== 'dark' && newTheme !== 'light') return
      this.theme = newTheme
      localStorage.setItem('user_theme', newTheme)
      // Aplicar clase al body para el estilo global
      document.body.className = `theme-${newTheme}`
    },

    updatePreferences(newPrefs) {
      this.preferences = { ...this.preferences, ...newPrefs }
      localStorage.setItem('user_preferences', JSON.stringify(this.preferences))
    },

    updateApiKey(key) {
      this.rawgApiKey = key.trim()
      if (this.rawgApiKey) {
        localStorage.setItem('rawg_api_key', this.rawgApiKey)
      } else {
        localStorage.removeItem('rawg_api_key')
      }
    },
  },
})
