import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => {
    const defaultPrefs = {
      currency: 'USD',
      preferredGenre: '',
      newsletter: false,
      language: 'es',
    }
    const savedPrefs = JSON.parse(localStorage.getItem('user_preferences')) || {}
    return {
      user: JSON.parse(localStorage.getItem('auth_user')) || null,
      theme: localStorage.getItem('user_theme') || 'dark',
      preferences: { ...defaultPrefs, ...savedPrefs },
      rawgApiKey: localStorage.getItem('rawg_api_key') || '',
    }
  },

  getters: {
    isLoggedIn: (state) => !!state.user,
    getUsername: (state) => (state.user ? state.user.username : 'Invitado'),
    getTheme: (state) => state.theme,
    getPreferences: (state) => state.preferences,
    getApiKey: (state) => state.rawgApiKey,
  },

  actions: {
    async login(username, _password) {
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
      localStorage.setItem('auth_user', JSON.stringify(simulatedUser))

      // Sincronizar el carrito del usuario
      const { useGamesStore } = await import('./games')
      const gamesStore = useGamesStore()
      gamesStore.loadUserCart(simulatedUser.username)

      // Inicializar género preferido por defecto si está vacío para mostrar Recomendados de inmediato
      if (!this.preferences.preferredGenre) {
        this.updatePreferences({ preferredGenre: 'action' })
      }

      return simulatedUser
    },

    async logout() {
      this.user = null
      localStorage.removeItem('auth_user')

      // Sincronizar el carrito del usuario (vaciarlo en memoria)
      const { useGamesStore } = await import('./games')
      const gamesStore = useGamesStore()
      gamesStore.loadUserCart('')
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

    formatPrice(priceInUsd) {
      if (typeof priceInUsd !== 'number') return ''
      const currency = this.preferences.currency || 'USD'
      let rate = 1.0
      let symbol = '$'

      if (currency === 'EUR') {
        rate = 0.92
        symbol = '€'
      } else if (currency === 'UYU') {
        rate = 40.0
        symbol = '$U'
      }

      const converted = priceInUsd * rate
      return `${symbol} ${converted.toFixed(2)}`
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
