import { defineStore } from 'pinia'

export const useGamesStore = defineStore('games', {
  state: () => {
    const defaultFilters = {
      genre: '',
      ordering: '',
      page: 1,
      pageSize: 6,
    }
    const storedFilters = JSON.parse(sessionStorage.getItem('temp_filters')) || {}
    return {
      favorites: JSON.parse(localStorage.getItem('game_favorites')) || [],
      cart: JSON.parse(localStorage.getItem('game_cart')) || [],
      lastSearch: sessionStorage.getItem('last_search') || '',
      tempFilters: { ...defaultFilters, ...storedFilters },
      // Estado para caché de la página de inicio
      homeFeatured: [],
      homeLatest: [],
      homeRandomCategories: [],
      homeDiscover: [],
    }
  },

  getters: {
    isFavorite: (state) => (gameId) => {
      return state.favorites.some((game) => game.id === gameId)
    },
    favoritesCount: (state) => state.favorites.length,
    cartCount: (state) => state.cart.length,
    cartTotal: (state) => {
      return state.cart.reduce((total, game) => {
        const price = game.price || ((game.id % 6) + 1) * 10 - 0.01
        return total + price
      }, 0)
    },
    isInCart: (state) => (gameId) => {
      return state.cart.some((game) => game.id === gameId)
    },
    favoritesGenresStats: (state) => {
      const stats = {}
      state.favorites.forEach((game) => {
        if (game.genres && Array.isArray(game.genres)) {
          game.genres.forEach((genre) => {
            const name = genre.name || genre
            stats[name] = (stats[name] || 0) + 1
          })
        }
      })
      // Convertir el objeto { "Acción": 3, "RPG": 1 } a un array [{ name: "Acción", count: 3 }] para facilitar uso
      return Object.entries(stats)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
    },
  },

  actions: {
    toggleFavorite(game) {
      const index = this.favorites.findIndex((g) => g.id === game.id)
      if (index === -1) {
        // Guardar información básica del juego para renderizar en la vista de favoritos
        this.favorites.push({
          id: game.id,
          name: game.name,
          slug: game.slug,
          background_image: game.background_image,
          rating: game.rating,
          metacritic: game.metacritic,
          price: game.price || ((game.id % 6) + 1) * 10 - 0.01,
          genres: game.genres || [],
        })
      } else {
        this.favorites.splice(index, 1)
      }
      localStorage.setItem('game_favorites', JSON.stringify(this.favorites))
    },

    addToCart(game) {
      if (this.isInCart(game.id)) return

      this.cart.push({
        id: game.id,
        name: game.name,
        slug: game.slug,
        background_image: game.background_image,
        price: game.price || ((game.id % 6) + 1) * 10 - 0.01,
      })
      localStorage.setItem('game_cart', JSON.stringify(this.cart))
    },

    removeFromCart(gameId) {
      const index = this.cart.findIndex((game) => game.id === gameId)
      if (index !== -1) {
        this.cart.splice(index, 1)
        localStorage.setItem('game_cart', JSON.stringify(this.cart))
      }
    },

    clearCart() {
      this.cart = []
      localStorage.removeItem('game_cart')
    },

    setLastSearch(search) {
      this.lastSearch = search
      sessionStorage.setItem('last_search', search)
    },

    setTempFilters(filters) {
      this.tempFilters = { ...this.tempFilters, ...filters }
      sessionStorage.setItem('temp_filters', JSON.stringify(this.tempFilters))
    },

    clearTempFilters() {
      this.tempFilters = {
        genre: '',
        ordering: '',
        page: 1,
        pageSize: 6,
      }
      sessionStorage.removeItem('temp_filters')
    },

    // Actualizar caché de inicio
    setHomeCache(data) {
      if (data.featured) this.homeFeatured = data.featured
      if (data.latest) this.homeLatest = data.latest
      if (data.randomCategories) this.homeRandomCategories = data.randomCategories
      if (data.discover) this.homeDiscover = data.discover
    },
  },
})
