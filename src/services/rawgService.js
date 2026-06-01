import { mockGames } from '../data/mockGames'

const BASE_URL = 'https://api.rawg.io/api'

// Helper to get API key from Env or localStorage
export function getApiKey() {
  return import.meta.env.VITE_RAWG_API_KEY || localStorage.getItem('rawg_api_key') || ''
}

// Helper to check if we are using the real RAWG API
export function isUsingRealApi() {
  return !!getApiKey()
}

const GENRES = [
  { id: 4, name: 'Acción', slug: 'action' },
  { id: 5, name: 'RPG', slug: 'role-playing-games-rpg' },
  { id: 3, name: 'Aventura', slug: 'adventure' },
  { id: 74, name: 'Indie', slug: 'indie' },
  { id: 2, name: 'Shooter', slug: 'shooter' },
  { id: 83, name: 'Puzle', slug: 'puzzle' },
]

export async function fetchFromRawg(endpoint, params = {}) {
  const apiKey = getApiKey()
  if (!apiKey) {
    throw new Error('No API key configured')
  }

  const queryParams = new URLSearchParams({
    key: apiKey,
    ...params,
  })

  const response = await fetch(`${BASE_URL}/${endpoint}?${queryParams}`)
  if (!response.ok) {
    throw new Error(`RAWG API error: ${response.statusText}`)
  }
  return response.json()
}

export const rawgService = {
  /**
   * Obtener listado de videojuegos con filtros opcionales (RAWG o mockGames fallback)
   */
  async getGames({ search = '', genres = '', ordering = '', page = 1, page_size = 12 } = {}) {
    if (isUsingRealApi()) {
      try {
        const params = { page, page_size }
        if (search) params.search = search
        if (genres) params.genres = genres
        if (ordering) params.ordering = ordering

        const data = await fetchFromRawg('games', params)
        return {
          results: data.results,
          count: data.count,
          next: data.next,
          previous: data.previous,
        }
      } catch (error) {
        console.warn('Error al conectar con la API de RAWG, usando base de datos mock local:', error)
      }
    }

    // Fallback directo a mockGames (Simulación offline / Sin API Key)
    let results = [...mockGames]

    // Filtrar por término de búsqueda (nombre)
    if (search) {
      const query = search.toLowerCase()
      results = results.filter((game) => game.name.toLowerCase().includes(query))
    }

    // Filtrar por géneros (slugs coincidentes)
    if (genres) {
      const genreSlugs = genres.split(',').map((g) => g.trim())
      results = results.filter((game) =>
        game.genres.some((genre) => genreSlugs.includes(genre.slug))
      )
    }

    // Ordenamiento
    if (ordering) {
      const isDescending = ordering.startsWith('-')
      const field = isDescending ? ordering.substring(1) : ordering

      results.sort((a, b) => {
        let valA = a[field]
        let valB = b[field]

        if (field === 'released') {
          valA = new Date(valA || 0)
          valB = new Date(valB || 0)
        }

        if (valA === null || valA === undefined) return 1
        if (valB === null || valB === undefined) return -1

        if (valA < valB) return isDescending ? 1 : -1
        if (valA > valB) return isDescending ? -1 : 1
        return 0
      })
    }

    // Paginación
    const startIndex = (page - 1) * page_size
    const paginatedResults = results.slice(startIndex, startIndex + page_size)

    return {
      results: paginatedResults,
      count: results.length,
      next: results.length > startIndex + page_size ? page + 1 : null,
      previous: page > 1 ? page - 1 : null,
    }
  },

  /**
   * Obtener detalle de un videojuego por ID o slug
   */
  async getGameDetail(idOrSlug) {
    if (isUsingRealApi()) {
      try {
        return await fetchFromRawg(`games/${idOrSlug}`)
      } catch (error) {
        console.warn('Error al obtener detalles de la API de RAWG, buscando en base local:', error)
      }
    }

    // Buscar en mockGames local
    const mockGame = mockGames.find(
      (g) => g.id === Number(idOrSlug) || g.slug === idOrSlug
    )

    if (mockGame) {
      return {
        ...mockGame,
        description: mockGame.description_raw,
      }
    }

    throw new Error('Juego no encontrado')
  },

  /**
   * Obtener géneros de videojuegos
   */
  async getGenres() {
    if (isUsingRealApi()) {
      try {
        const data = await fetchFromRawg('genres')
        return data.results
      } catch (error) {
        console.warn('Error al obtener géneros de la API de RAWG, usando géneros locales:', error)
      }
    }

    return GENRES
  },
}
