import { ref, watch } from 'vue'
import { useGamesStore } from '../stores/games'

/**
 * Composable reutilizable para gestionar los filtros temporales
 * y persistentes de la búsqueda de videojuegos.
 */
export function useFilters() {
  const gamesStore = useGamesStore()

  const searchInput = ref(gamesStore.lastSearch)
  const selectedGenre = ref(gamesStore.tempFilters.genre)
  const selectedOrdering = ref(gamesStore.tempFilters.ordering)

  // Sincronizar cambios locales al store de Pinia automáticamente
  watch(searchInput, (newSearch) => {
    gamesStore.setLastSearch(newSearch)
  })

  watch([selectedGenre, selectedOrdering], ([newGenre, newOrdering]) => {
    gamesStore.setTempFilters({
      genre: newGenre,
      ordering: newOrdering,
    })
  })

  const clearFilters = () => {
    searchInput.value = ''
    selectedGenre.value = ''
    selectedOrdering.value = ''
    gamesStore.setLastSearch('')
    gamesStore.clearTempFilters()
  }

  return {
    searchInput,
    selectedGenre,
    selectedOrdering,
    clearFilters,
  }
}
