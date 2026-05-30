import { mockGames } from '../data/mockGames'

const BASE_URL = 'https://api.rawg.io/api'
const CHEAPSHARK_URL = 'https://www.cheapshark.com/api/1.0'

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

const PLATFORMS = [
  { platform: { id: 4, name: 'PC', slug: 'pc' } },
  { platform: { id: 187, name: 'PlayStation 5', slug: 'playstation5' } },
  { platform: { id: 186, name: 'Xbox Series S/X', slug: 'xbox-series-x' } },
]

// Helper to assign stable genres based on game title or ID
function getStableGenres(title, gameId) {
  const t = title.toLowerCase()
  const genres = []
  if (
    t.includes('rpg') ||
    t.includes('fantasy') ||
    t.includes('scrolls') ||
    t.includes('elden') ||
    t.includes('cyberpunk') ||
    t.includes('witcher')
  ) {
    genres.push(GENRES[1]) // RPG
  }
  if (
    t.includes('action') ||
    t.includes('auto') ||
    t.includes('dead') ||
    t.includes('assassin') ||
    t.includes('batman') ||
    t.includes('spider')
  ) {
    genres.push(GENRES[0]) // Acción
  }
  if (
    t.includes('adventure') ||
    t.includes('tomb') ||
    t.includes('raider') ||
    t.includes('hollow') ||
    t.includes('portal') ||
    t.includes('zelda')
  ) {
    genres.push(GENRES[2]) // Aventura
  }
  if (
    t.includes('shoot') ||
    t.includes('duty') ||
    t.includes('halo') ||
    t.includes('war') ||
    t.includes('strike') ||
    t.includes('doom') ||
    t.includes('resident')
  ) {
    genres.push(GENRES[4]) // Shooter
  }
  if (
    t.includes('puzzle') ||
    t.includes('tetris') ||
    t.includes('portal') ||
    t.includes('witness') ||
    t.includes('box')
  ) {
    genres.push(GENRES[5]) // Puzle
  }

  if (genres.length === 0) {
    genres.push(GENRES[gameId % GENRES.length])
  }
  return genres
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
   * Obtener listado de videojuegos con filtros opcionales (RAWG o CheapShark fallback)
   */
  async getGames({ search = '', genres = '', ordering = '', page = 1, page_size = 12 } = {}) {
    if (isUsingRealApi()) {
      try {
        const params = { page, page_size }
        if (search) params.search = search
        if (genres) params.genres = genres
        if (ordering) params.ordering = ordering

        const data = await fetchFromRawg('games', params)
        let results = data.results

        // Translate categories/genres in results
        const prefs = JSON.parse(localStorage.getItem('user_preferences'))
        const targetLang = prefs?.language || 'es'
        if (targetLang !== 'en' && results) {
          try {
            const { translateText } = await import('./translateService')
            results = await Promise.all(
              results.map(async (game) => {
                if (game.genres) {
                  const translatedGenres = await Promise.all(
                    game.genres.map(async (g) => {
                      const name = await translateText(g.name, targetLang, 'en')
                      return { ...g, name }
                    }),
                  )
                  return { ...game, genres: translatedGenres }
                }
                return game
              }),
            )
          } catch (trErr) {
            console.warn('Failed to translate game genres in list:', trErr)
          }
        }

        return {
          results,
          count: data.count,
          next: data.next,
          previous: data.previous,
        }
      } catch (error) {
        console.warn('Error fetching from RAWG API, falling back to CheapShark API:', error)
      }
    }

    // Public API Fallback: CheapShark Deals (No API key required, CORS supported)
    try {
      const response = await fetch(`${CHEAPSHARK_URL}/deals?pageSize=60`)
      if (!response.ok) throw new Error('CheapShark API Error')

      const deals = await response.json()

      // Map CheapShark deals to RAWG-like game objects
      let mappedGames = deals.map((deal) => {
        const gameId = parseInt(deal.gameID, 10) || Math.floor(Math.random() * 10000)
        const steamAppId = deal.steamAppID

        // Use high-resolution steam header banner if available, otherwise thumb
        const background_image = steamAppId
          ? `https://cdn.cloudflare.steamstatic.com/steam/apps/${steamAppId}/header.jpg`
          : deal.thumb

        return {
          id: gameId,
          slug: deal.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          name: deal.title,
          released: deal.releaseDate
            ? new Date(deal.releaseDate * 1000).toISOString().split('T')[0]
            : '2020-01-01',
          background_image,
          rating: deal.steamRatingPercent
            ? parseFloat((deal.steamRatingPercent / 20).toFixed(1))
            : 4.0,
          rating_top: 5,
          ratings_count: parseInt(deal.steamRatingCount, 10) || 120,
          metacritic: parseInt(deal.metacriticScore, 10) || null,
          playtime: Math.floor(gameId % 80) + 10,
          genres: getStableGenres(deal.title, gameId),
          platforms: PLATFORMS,
          price: parseFloat(deal.salePrice) || 19.99,
          normalPrice: parseFloat(deal.normalPrice) || 19.99,
          dealID: deal.dealID,
          steamAppID: steamAppId,
        }
      })

      // Filter by search query
      if (search) {
        const query = search.toLowerCase()
        mappedGames = mappedGames.filter((game) => game.name.toLowerCase().includes(query))
      }

      // Filter by genres (slugs)
      if (genres) {
        const genreSlugs = genres.split(',').map((g) => g.trim())
        mappedGames = mappedGames.filter((game) =>
          game.genres.some((genre) => genreSlugs.includes(genre.slug)),
        )
      }

      // Sorting (ordering)
      if (ordering) {
        const isDescending = ordering.startsWith('-')
        const field = isDescending ? ordering.substring(1) : ordering

        mappedGames.sort((a, b) => {
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

      // Pagination
      const startIndex = (page - 1) * page_size
      const paginatedResults = mappedGames.slice(startIndex, startIndex + page_size)

      return {
        results: paginatedResults,
        count: mappedGames.length,
        next: mappedGames.length > startIndex + page_size ? page + 1 : null,
        previous: page > 1 ? page - 1 : null,
      }
    } catch (apiError) {
      console.warn('CheapShark API failed, using static mockGames data:', apiError)

      // Static mockGames fallback
      let results = [...mockGames]
      if (search) {
        const query = search.toLowerCase()
        results = results.filter((g) => g.name.toLowerCase().includes(query))
      }
      if (genres) {
        const genreSlugs = genres.split(',').map((g) => g.trim())
        results = results.filter((g) => g.genres.some((genre) => genreSlugs.includes(genre.slug)))
      }

      const startIndex = (page - 1) * page_size
      return {
        results: results.slice(startIndex, startIndex + page_size),
        count: results.length,
        next: results.length > startIndex + page_size ? page + 1 : null,
        previous: page > 1 ? page - 1 : null,
      }
    }
  },

  /**
   * Obtener detalle de un videojuego por ID o slug
   */
  async getGameDetail(idOrSlug) {
    if (isUsingRealApi()) {
      try {
        const gameDetail = await fetchFromRawg(`games/${idOrSlug}`)
        try {
          const screenshotsData = await fetchFromRawg(`games/${idOrSlug}/screenshots`)
          if (screenshotsData && screenshotsData.results) {
            gameDetail.short_screenshots = screenshotsData.results.map((ss, idx) => ({
              id: ss.id || idx,
              image: ss.image,
            }))
          }
        } catch (screenshotError) {
          console.warn('Could not fetch screenshots from RAWG:', screenshotError)
          gameDetail.short_screenshots = []
        }

        // Translate categories/genres in game detail
        const prefs = JSON.parse(localStorage.getItem('user_preferences'))
        const targetLang = prefs?.language || 'es'
        if (targetLang !== 'en' && gameDetail.genres) {
          try {
            const { translateText } = await import('./translateService')
            gameDetail.genres = await Promise.all(
              gameDetail.genres.map(async (g) => {
                const name = await translateText(g.name, targetLang, 'en')
                return { ...g, name }
              }),
            )
          } catch (trErr) {
            console.warn('Failed to translate game genres in detail:', trErr)
          }
        }

        return gameDetail
      } catch (error) {
        console.warn('Error fetching game detail from RAWG, falling back:', error)
      }
    }

    // Try finding in mockGames first
    const mockGame = mockGames.find((g) => g.id === Number(idOrSlug) || g.slug === idOrSlug)
    if (mockGame) {
      return {
        ...mockGame,
        description: mockGame.description_raw,
      }
    }

    // Search and detail from CheapShark API
    try {
      const response = await fetch(`${CHEAPSHARK_URL}/games?id=${idOrSlug}`)
      if (!response.ok) throw new Error('Game detail not found')
      const gameData = await response.json()

      const info = gameData.info
      const steamAppId = info.steamAppID
      const background_image = steamAppId
        ? `https://cdn.cloudflare.steamstatic.com/steam/apps/${steamAppId}/header.jpg`
        : info.thumb

      // Extract prices from deals list
      const bestDeal = gameData.deals?.[0]
      const salePrice = bestDeal
        ? parseFloat(bestDeal.price)
        : parseFloat(gameData.cheapestPriceEver?.price) || 19.99
      const retailPrice = bestDeal ? parseFloat(bestDeal.retailPrice) : salePrice

      // Generate screenshots from steam if steamAppId exists
      const screenshots = []
      if (steamAppId) {
        screenshots.push({
          id: 1,
          image: `https://cdn.cloudflare.steamstatic.com/steam/apps/${steamAppId}/ss_1.jpg`,
        })
        screenshots.push({
          id: 2,
          image: `https://cdn.cloudflare.steamstatic.com/steam/apps/${steamAppId}/ss_2.jpg`,
        })
        screenshots.push({
          id: 3,
          image: `https://cdn.cloudflare.steamstatic.com/steam/apps/${steamAppId}/ss_3.jpg`,
        })
      } else {
        screenshots.push({ id: 1, image: background_image })
      }

      return {
        id: parseInt(idOrSlug, 10),
        name: info.title,
        slug: info.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        released: 'No disponible',
        background_image,
        rating: 4.5,
        metacritic: bestDeal?.savings ? Math.floor(100 - parseFloat(bestDeal.savings)) : 80, // estimate score or mock
        playtime: 40,
        description: `Disfruta de <strong>${info.title}</strong>, un increíble título ahora disponible. Encuentra las mejores ofertas de las tiendas oficiales de PC vinculadas mediante la base de datos abierta de CheapShark.`,
        genres: getStableGenres(info.title, parseInt(idOrSlug, 10)),
        platforms: PLATFORMS,
        price: salePrice,
        normalPrice: retailPrice,
        short_screenshots: screenshots,
        developers: [{ name: 'Desarrollador Oficial' }],
        publishers: [{ name: 'Distribuidor del Juego' }],
      }
    } catch (e) {
      console.warn('Failed to retrieve CheapShark detail, game not found:', e)
      throw new Error('Juego no encontrado', { cause: e })
    }
  },

  async getGenres() {
    let results = GENRES
    if (isUsingRealApi()) {
      try {
        const data = await fetchFromRawg('genres')
        results = data.results
      } catch (error) {
        console.warn('Error fetching genres:', error)
      }
    }

    // Translate genres based on preferred language
    const prefs = JSON.parse(localStorage.getItem('user_preferences'))
    const targetLang = prefs?.language || 'es'
    if (targetLang !== 'en' && results) {
      try {
        const { translateText } = await import('./translateService')
        results = await Promise.all(
          results.map(async (g) => {
            const translatedName = await translateText(g.name, targetLang, 'en')
            return { ...g, name: translatedName }
          }),
        )
      } catch (err) {
        console.warn('Failed to translate genres list:', err)
      }
    }

    return results
  },
}
