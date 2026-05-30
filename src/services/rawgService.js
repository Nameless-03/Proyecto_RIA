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

/**
 * Ajusta de forma determinista y estable la fecha de lanzamiento
 * para que caiga en los años 2025 o 2026, logrando una simulación
 * coherente con el año actual del proyecto (2026).
 */
function adjustReleaseDate(releasedStr, gameId) {
  if (!releasedStr || releasedStr === 'No disponible' || releasedStr === 'No especificado') {
    const month = String((gameId % 12) + 1).padStart(2, '0')
    const day = String((gameId % 28) + 1).padStart(2, '0')
    const year = 2025 + (gameId % 2) // 2025 o 2026
    return `${year}-${month}-${day}`
  }

  try {
    const parts = releasedStr.split('-')
    if (parts.length === 3) {
      let year = parseInt(parts[0], 10)
      if (year < 2025) {
        year = 2025 + (gameId % 2) // Mapear a 2025 o 2026
        return `${year}-${parts[1]}-${parts[2]}`
      }
    }
  } catch {
    // En caso de error, retornar original
  }
  return releasedStr
}

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
  async getGames({
    search = '',
    genres = '',
    ordering = '',
    dates = '',
    page = 1,
    page_size = 12,
  } = {}) {
    if (isUsingRealApi()) {
      try {
        // Pedimos el triple de juegos al servidor (page_size * 3) para tener un colchón de datos.
        // Esto permite que, tras aplicar los filtros de calidad y de control parental NSFW en el cliente,
        // sigamos teniendo suficientes juegos limpios para completar la página exacta solicitada de 6 juegos.
        const params = { page, page_size: page_size * 3 }
        if (search) params.search = search
        if (genres) params.genres = genres
        if (ordering) params.ordering = ordering

        // Si se está ordenando por fecha de lanzamiento, limitamos las fechas en el servidor
        // para evitar que el servidor devuelva juegos futuros de años como 2030 en la primera página.
        if (dates) {
          params.dates = dates
        } else if (ordering.includes('released')) {
          params.dates = '1990-01-01,2026-12-31'
        }

        const data = await fetchFromRawg('games', params)

        // Limpiar la respuesta de RAWG para evitar juegos basura/incompletos/del futuro lejano/NSFW
        const filteredResults = data.results.filter((game) => {
          // 1. Omitir juegos sin imagen de fondo
          if (!game.background_image) return false

          // 2. Omitir juegos con fecha de lanzamiento en el futuro (posterior al año 2026)
          if (game.released) {
            const year = parseInt(game.released.split('-')[0], 10)
            if (year > 2026) return false
          }

          // 3. Omitir juegos con nombres basura o de pruebas
          const nameLower = game.name.toLowerCase()
          if (
            nameLower.includes('placeholder') ||
            nameLower.includes('test game') ||
            nameLower.includes('test_') ||
            nameLower === 'test'
          ) {
            return false
          }

          // 4. Omitir juegos con contenido explícito para adultos (NSFW / Porno)
          // Bloquear clasificación oficial Adults Only (AO)
          if (game.esrb_rating?.slug === 'adults-only') return false

          // Bloquear palabras clave explícitas en el nombre
          const explicitWords = ['fap', 'hentai', 'porn', 'porno', 'sex', 'nsfw', 'erotica']
          if (explicitWords.some((word) => nameLower.includes(word))) {
            return false
          }

          // Bloquear tags explícitas
          if (game.tags && game.tags.length > 0) {
            const nsfwTags = ['hentai', 'nsfw', 'erotica', 'adults-only', 'sexual-content']
            const hasNsfwTag = game.tags.some((tag) => nsfwTags.includes(tag.slug))
            if (hasNsfwTag) return false
          }

          return true
        })

        // Retornamos exactamente la cantidad de juegos limpia solicitada para rellenar la página (slice)
        const adjustedResults = filteredResults.slice(0, page_size).map((game) => ({
          ...game,
          released: adjustReleaseDate(game.released, game.id),
        }))

        return {
          results: adjustedResults,
          count: data.count,
          next: data.next || filteredResults.length > page_size ? page + 1 : null,
          previous: page > 1 ? page - 1 : null,
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

      // Map CheapShark deals to RAWG-like game objects with de-duplication by title
      const uniqueGamesMap = new Map()
      for (const deal of deals) {
        const title = deal.title
        const price = parseFloat(deal.salePrice) || 19.99

        if (uniqueGamesMap.has(title)) {
          // If we have a duplicate title, keep the one with the cheapest deal
          const existing = uniqueGamesMap.get(title)
          if (price < existing.price) {
            existing.price = price
            existing.dealID = deal.dealID
          }
        } else {
          const gameId = parseInt(deal.gameID, 10) || Math.floor(Math.random() * 10000)
          const steamAppId = deal.steamAppID

          // Use high-resolution steam header banner if available, otherwise thumb
          const background_image = steamAppId
            ? `https://cdn.cloudflare.steamstatic.com/steam/apps/${steamAppId}/header.jpg`
            : deal.thumb

          const rawRelease = deal.releaseDate
            ? new Date(deal.releaseDate * 1000).toISOString().split('T')[0]
            : ''

          uniqueGamesMap.set(title, {
            id: gameId,
            slug: deal.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            name: deal.title,
            released: adjustReleaseDate(rawRelease, gameId),
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
            price,
            normalPrice: parseFloat(deal.normalPrice) || 19.99,
            dealID: deal.dealID,
            steamAppID: steamAppId,
          })
        }
      }

      let mappedGames = Array.from(uniqueGamesMap.values())

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

      // Filter out duplicate, unreleased/future, or NSFW/pornographic games in CheapShark as well
      mappedGames = mappedGames.filter((game) => {
        if (!game.background_image) return false
        if (game.released) {
          const year = parseInt(game.released.split('-')[0], 10)
          if (year > 2026) return false
        }

        // Bloquear palabras clave explícitas en el nombre
        const nameLower = game.name.toLowerCase()
        const explicitWords = ['fap', 'hentai', 'porn', 'porno', 'sex', 'nsfw', 'erotica']
        if (explicitWords.some((word) => nameLower.includes(word))) {
          return false
        }

        return true
      })

      // Sorting (ordering)
      if (ordering) {
        const isDescending = ordering.startsWith('-')
        const field = isDescending ? ordering.substring(1) : ordering

        mappedGames.sort((a, b) => {
          let valA = a[field]
          let valB = b[field]

          if (field === 'released') {
            valA = new Date(valA === 'N/A' || !valA ? 0 : valA)
            valB = new Date(valB === 'N/A' || !valB ? 0 : valB)
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

      // Adjust mock dates and filter future/empty/NSFW games
      const adjustedMockGames = results
        .filter((game) => {
          if (!game.background_image) return false
          if (game.released) {
            const year = parseInt(game.released.split('-')[0], 10)
            if (year > 2026) return false
          }

          const nameLower = game.name.toLowerCase()
          const explicitWords = ['fap', 'hentai', 'porn', 'porno', 'sex', 'nsfw', 'erotica']
          if (explicitWords.some((word) => nameLower.includes(word))) {
            return false
          }

          return true
        })
        .map((game) => ({
          ...game,
          released: adjustReleaseDate(game.released, game.id),
        }))

      const startIndex = (page - 1) * page_size
      return {
        results: adjustedMockGames.slice(startIndex, startIndex + page_size),
        count: adjustedMockGames.length,
        next: adjustedMockGames.length > startIndex + page_size ? page + 1 : null,
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
        released: adjustReleaseDate(mockGame.released, mockGame.id),
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

      const gameId = parseInt(idOrSlug, 10)

      return {
        id: gameId,
        name: info.title,
        slug: info.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        released: adjustReleaseDate('', gameId),
        background_image,
        rating: 4.5,
        metacritic: bestDeal?.savings ? Math.floor(100 - parseFloat(bestDeal.savings)) : 80, // estimate score or mock
        playtime: 40,
        description: `Disfruta de <strong>${info.title}</strong>, un increíble título ahora disponible. Encuentra las mejores ofertas de las tiendas oficiales de PC vinculadas mediante la base de datos abierta de CheapShark.`,
        genres: getStableGenres(info.title, gameId),
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
