import { obtenerDato, guardarDato, obtenerTodosLosDatos } from './dbService'

const BASE_URL = 'https://api.rawg.io/api'
const CHEAPSHARK_URL = 'https://www.cheapshark.com/api/1.0'

// Helper to get API key from Env or localStorage
export function getApiKey() {
  return import.meta.env.VITE_RAWG_API_KEY || localStorage.getItem('rawg_api_key') || ''
}

let rawgFailed = false

// Helper to check if we are using the real RAWG API
export function isUsingRealApi() {
  return !!getApiKey() && !rawgFailed
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

// Guardar detalles básicos de los juegos del listado para que estén disponibles offline
async function cachearDetallesBasicos(juegos, prefix) {
  if (!juegos || !Array.isArray(juegos)) return
  for (const game of juegos) {
    const claveCache = `${prefix}_game_detail_cache_${game.id}`
    try {
      const cached = await obtenerDato('games', claveCache)
      if (!cached) {
        const detalleBasico = {
          ...game,
          description: `Información de catálogo para <strong>${game.name}</strong>. Conéctate a internet para cargar la descripción completa y detalles adicionales del desarrollador.`,
          developers: [{ name: 'Desarrollador Oficial' }],
          publishers: [{ name: 'Distribuidor del Juego' }],
          short_screenshots: game.short_screenshots || [{ id: 1, image: game.background_image }],
        }
        await guardarDato('games', claveCache, detalleBasico, 600000)
      }
    } catch (err) {
      console.warn('Error cacheando detalle básico:', err)
    }
  }
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
    const cacheParams = { search, genres, ordering, dates, page, page_size }
    const prefix = isUsingRealApi() ? 'rawg' : 'cheapshark'
    const claveCache = `${prefix}_games_list_${JSON.stringify(cacheParams)}`

    // Buscar listado en caché temporal (intentando ambos prefijos por resiliencia offline)
    try {
      const rawgClave = `rawg_games_list_${JSON.stringify(cacheParams)}`
      const cheapsharkClave = `cheapshark_games_list_${JSON.stringify(cacheParams)}`
      const cachedList =
        (await obtenerDato('games', rawgClave)) || (await obtenerDato('games', cheapsharkClave))
      if (cachedList) {
        return cachedList
      }
    } catch (err) {
      console.warn('Error reading from IndexedDB games lists:', err)
    }

    if (isUsingRealApi()) {
      try {
        // Técnica de sobremuestreo (Oversampling): pedimos N * 3 juegos al servidor
        // para aplicar filtros locales y conservar la consistencia de la grilla en la UI.
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

        // Adaptamos el formato de lanzamiento y tomamos exactamente la cantidad solicitada (page_size)
        const adjustedResults = filteredResults
          .map((game) => ({
            ...game,
            released: adjustReleaseDate(game.released, game.id),
          }))
          .slice(0, page_size)

        const finalResult = {
          results: adjustedResults,
          count: data.count,
          next: data.next ? page + 1 : null,
          previous: page > 1 ? page - 1 : null,
        }
        cachearDetallesBasicos(adjustedResults, 'rawg').catch(() => null)
        try {
          await guardarDato('games', claveCache, finalResult, 600000)
        } catch (err) {
          console.warn('Error writing to IndexedDB games lists:', err)
        }
        return finalResult
      } catch (error) {
        console.warn('Error fetching from RAWG API, falling back to CheapShark API:', error)
        rawgFailed = true
      }
    }

    // Public API Fallback: CheapShark Deals (No API key required, CORS supported)
    try {
      // Consultar múltiples páginas de ofertas en paralelo para tener un catálogo robusto
      const paginasPromesas = [
        fetch(`${CHEAPSHARK_URL}/deals?pageNumber=0&pageSize=50`),
        fetch(`${CHEAPSHARK_URL}/deals?pageNumber=1&pageSize=50`),
        fetch(`${CHEAPSHARK_URL}/deals?pageNumber=2&pageSize=50`),
        fetch(`${CHEAPSHARK_URL}/deals?pageNumber=3&pageSize=50`),
        fetch(`${CHEAPSHARK_URL}/deals?pageNumber=4&pageSize=50`),
      ]

      const respuestas = await Promise.all(paginasPromesas)
      const listados = await Promise.all(
        respuestas.map(async (res) => {
          if (!res.ok) throw new Error('CheapShark API Error en página')
          return res.json()
        }),
      )

      // Combinar todos los resultados en un único array
      const deals = listados.flat()

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

      const finalResult = {
        results: paginatedResults,
        count: mappedGames.length,
        next: mappedGames.length > startIndex + page_size ? page + 1 : null,
        previous: page > 1 ? page - 1 : null,
      }
      cachearDetallesBasicos(paginatedResults, 'cheapshark').catch(() => null)
      try {
        await guardarDato('games', claveCache, finalResult, 600000)
      } catch (err) {
        console.warn('Error writing to IndexedDB games lists:', err)
      }
      return finalResult
    } catch (apiError) {
      console.warn('CheapShark API failed, loading games from cache:', apiError)

      let results = []
      try {
        const allCachedData = await obtenerTodosLosDatos('games')
        const uniqueGames = new Map()
        for (const item of allCachedData) {
          if (!item) continue
          if (Array.isArray(item.results)) {
            for (const g of item.results) {
              if (g && g.id) uniqueGames.set(g.id, g)
            }
          } else if (item.id) {
            uniqueGames.set(item.id, item)
          }
        }
        results = Array.from(uniqueGames.values())
      } catch (cacheErr) {
        console.error('Error fetching fallback data from cache:', cacheErr)
      }

      if (search) {
        const query = search.toLowerCase()
        results = results.filter((g) => g.name.toLowerCase().includes(query))
      }
      if (genres) {
        const genreSlugs = genres.split(',').map((g) => g.trim())
        results = results.filter((g) => g.genres && g.genres.some((genre) => genreSlugs.includes(genre.slug)))
      }

      const filteredResults = results
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

      const startIndex = (page - 1) * page_size
      const finalResult = {
        results: filteredResults.slice(startIndex, startIndex + page_size),
        count: filteredResults.length,
        next: filteredResults.length > startIndex + page_size ? page + 1 : null,
        previous: page > 1 ? page - 1 : null,
      }
      return finalResult
    }
  },
  /**
   * Obtener detalle de un videojuego por ID o slug
   */
  async getGameDetail(idOrSlug) {
    // Buscar detalle en caché temporal de la sesión (intentando ambos prefijos por resiliencia offline)
    try {
      const cachedDetail =
        (await obtenerDato('games', `rawg_game_detail_cache_${idOrSlug}`)) ||
        (await obtenerDato('games', `cheapshark_game_detail_cache_${idOrSlug}`))
      if (cachedDetail) {
        return cachedDetail
      }
    } catch (err) {
      console.warn('Error reading from IndexedDB games:', err)
    }

    const prefix = isUsingRealApi() ? 'rawg' : 'cheapshark'
    const claveCache = `${prefix}_game_detail_cache_${idOrSlug}`

    let result = null

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

        result = gameDetail
      } catch (error) {
        console.warn('Error fetching game detail from RAWG, falling back:', error)
        rawgFailed = true
      }
    }

    if (!result) {
      try {
        const allCachedData = await obtenerTodosLosDatos('games')
        for (const item of allCachedData) {
          if (!item) continue
          if (Array.isArray(item.results)) {
            const found = item.results.find((g) => g.id === Number(idOrSlug) || g.slug === idOrSlug)
            if (found) {
              result = {
                ...found,
                description: found.description || `Información de catálogo para <strong>${found.name}</strong>.`,
                released: adjustReleaseDate(found.released, found.id),
              }
              break
            }
          } else if (item.id === Number(idOrSlug) || item.slug === idOrSlug) {
            result = item
            break
          }
        }
      } catch (cacheErr) {
        console.warn('Error searching cache for detail:', cacheErr)
      }
    }

    if (!result) {
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

        result = {
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
        console.warn(
          'Failed to retrieve CheapShark detail, game not found, using cache search fallback:',
          e,
        )
        try {
          const allCachedData = await obtenerTodosLosDatos('games')
          for (const item of allCachedData) {
            if (!item) continue
            if (Array.isArray(item.results)) {
              const found = item.results.find((g) => g.id === Number(idOrSlug) || g.slug === idOrSlug)
              if (found) {
                result = {
                  ...found,
                  description: found.description || `Información de catálogo para <strong>${found.name}</strong>.`,
                  released: adjustReleaseDate(found.released, found.id),
                }
                break
              }
            } else if (item.id === Number(idOrSlug) || item.slug === idOrSlug) {
              result = item
              break
            }
          }
        } catch (cacheErr) {
          console.warn('Error searching cache in fallback:', cacheErr)
        }
      }
    }

    try {
      await guardarDato('games', claveCache, result, 600000)
    } catch (err) {
      console.warn('Error writing to IndexedDB games:', err)
    }
    return result
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
