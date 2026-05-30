import { computed } from 'vue'
import { useGamesStore } from '../stores/games'

/**
 * Composable reutilizable para gestionar los favoritos
 * encapsulando el acceso al Pinia store.
 */
export function useFavorites() {
  const gamesStore = useGamesStore()

  const favorites = computed(() => gamesStore.favorites)
  const favoritesCount = computed(() => gamesStore.favoritesCount)

  const isFavorite = (gameId) => gamesStore.isFavorite(gameId)
  const toggleFavorite = (game) => gamesStore.toggleFavorite(game)

  return {
    favorites,
    favoritesCount,
    isFavorite,
    toggleFavorite,
  }
}
