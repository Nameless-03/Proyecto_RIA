import { mockGames } from '../data/mockGames'

const BASE_URL = 'https://api.rawg.io/api'

// Helper to get API key from Env or localStorage (so user can type it in Perfil)
export function getApiKey() {
  return import.meta.env.VITE_RAWG_API_KEY || localStorage.getItem('rawg_api_key') || ''
}

// Helper to check if we are using the real API
export function isUsingRealApi() {
  return !!getApiKey()
}

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
   * Obtener listado de videojuegos con filtros opcionales
   */
  async getGames({ search = '', genres = '', ordering = '', page = 1, page_size = 12 } = {}) {
    if (isUsingRealApi()) {
      try {
        const params = {
          page,
          page_size,
        }
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
        console.warn('Error fetching from RAWG API, falling back to mock data:', error)
        // Fall through to mock logic
      }
    }

    // Mock filtering logic for offline mode
    let results = [...mockGames]

    // Filter by search query
    if (search) {
      const query = search.toLowerCase()
      results = results.filter(
        (game) =>
          game.name.toLowerCase().includes(query) ||
          (game.description_raw && game.description_raw.toLowerCase().includes(query)),
      )
    }

    // Filter by genres (slugs)
    if (genres) {
      const genreSlugs = genres.split(',').map((g) => g.trim())
      results = results.filter((game) =>
        game.genres.some((genre) => genreSlugs.includes(genre.slug)),
      )
    }

    // Sorting (ordering)
    if (ordering) {
      const isDescending = ordering.startsWith('-')
      const field = isDescending ? ordering.substring(1) : ordering

      results.sort((a, b) => {
        let valA = a[field]
        let valB = b[field]

        // Handle nested fields if any, or date/numbers
        if (field === 'released') {
          valA = new Date(valA || 0)
          valB = new Date(valB || 0)
        }

        if (valA < valB) return isDescending ? 1 : -1
        if (valA > valB) return isDescending ? -1 : 1
        return 0
      })
    }

    // Pagination
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
        console.warn('Error fetching game detail from RAWG, falling back to mock:', error)
      }
    }

    // Mock detail logic
    const game = mockGames.find((g) => g.id === Number(idOrSlug) || g.slug === idOrSlug)

    if (!game) {
      throw new Error('Game not found')
    }

    // Return the game structure, enriched with details if needed
    return {
      ...game,
      description: game.description_raw, // RAWG detail returns description (HTML) and description_raw
    }
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
        console.warn('Error fetching genres, using default genres:', error)
      }
    }

    // Default static genres from our mock data
    return [
      { id: 4, name: 'Action', slug: 'action' },
      { id: 5, name: 'RPG', slug: 'role-playing-games-rpg' },
      { id: 3, name: 'Adventure', slug: 'adventure' },
      { id: 74, name: 'Indie', slug: 'indie' },
      { id: 2, name: 'Shooter', slug: 'shooter' },
      { id: 83, name: 'Puzzle', slug: 'puzzle' },
    ]
  },
}
