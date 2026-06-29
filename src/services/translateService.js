import { obtenerDato, guardarDato } from './dbService'
/**
 * Service to handle translation requests using Google Translate's highly stable free endpoint.
 * This completely resolves CORS, speed, and API key requirements.
 */
export async function translateText(text, targetLang, sourceLang = 'auto') {
  if (!text || !targetLang || targetLang === sourceLang) {
    return text
  }

  // Evitar peticiones de red si estamos offline para evitar spam de errores en consola
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return text
  }

  // High performance cache for common game words and genre names
  const genreCache = {
    es: {
      action: 'Acción',
      adventure: 'Aventura',
      indie: 'Indie',
      rpg: 'RPG',
      shooter: 'Shooter',
      puzzle: 'Puzle',
      sports: 'Deportes',
      racing: 'Carreras',
      strategy: 'Estrategia',
      simulation: 'Simulación',
      arcade: 'Arcade',
      platformer: 'Plataformas',
      fighting: 'Lucha',
      family: 'Familiar',
      board: 'Juegos de mesa',
      card: 'Cartas',
      'role-playing-games-rpg': 'RPG',
      'massively-multiplayer': 'Multijugador masivo',
    },
    pt: {
      action: 'Ação',
      adventure: 'Aventura',
      indie: 'Indie',
      rpg: 'RPG',
      shooter: 'Tiro',
      puzzle: 'Quebra-cabeça',
      sports: 'Esportes',
      racing: 'Corrida',
      strategy: 'Estratégia',
      simulation: 'Simulação',
      arcade: 'Fliperama',
      platformer: 'Plataforma',
      fighting: 'Luta',
      family: 'Família',
      board: 'Jogos de tabuleiro',
      card: 'Cartas',
      'role-playing-games-rpg': 'RPG',
      'massively-multiplayer': 'Multijogador massivo',
    },
    fr: {
      action: 'Action',
      adventure: 'Aventure',
      indie: 'Indie',
      rpg: 'RPG',
      shooter: 'Tir',
      puzzle: 'Puzzle',
      sports: 'Sports',
      racing: 'Course',
      strategy: 'Stratégie',
      simulation: 'Simulation',
      arcade: 'Arcade',
      platformer: 'Plateforme',
      fighting: 'Combat',
      family: 'Famille',
      board: 'Jeux de société',
      card: 'Cartes',
      'role-playing-games-rpg': 'RPG',
      'massively-multiplayer': 'Multijoueur de masse',
    },
    de: {
      action: 'Action',
      adventure: 'Abenteuer',
      indie: 'Indie',
      rpg: 'Rollenspiel (RPG)',
      shooter: 'Shooter',
      puzzle: 'Puzzle',
      sports: 'Sport',
      racing: 'Rennspiele',
      strategy: 'Strategie',
      simulation: 'Simulation',
      arcade: 'Arcade',
      platformer: 'Plattformspiele',
      fighting: 'Kampfspiele',
      family: 'Familie',
      board: 'Brettspiele',
      card: 'Kartenspiele',
      'role-playing-games-rpg': 'RPG',
      'massively-multiplayer': 'Massive-Mehrspieler',
    },
    it: {
      action: 'Azione',
      adventure: 'Avventura',
      indie: 'Indie',
      rpg: 'RPG',
      shooter: 'Sparatutto',
      puzzle: 'Puzzle',
      sports: 'Sport',
      racing: 'Corse',
      strategy: 'Strategia',
      simulation: 'Simulazione',
      arcade: 'Arcade',
      platformer: 'Piattaforme',
      fighting: 'Picchiaduro',
      family: 'Famiglia',
      board: 'Giochi da tavolo',
      card: 'Carte',
      'role-playing-games-rpg': 'RPG',
      'massively-multiplayer': 'Multigiocatore di massa',
    },
  }

  const cleanText = text.trim()
  const lowerText = cleanText.toLowerCase()

  // Return cached translation if available
  if (genreCache[targetLang] && genreCache[targetLang][lowerText]) {
    return genreCache[targetLang][lowerText]
  }

  // Buscar en almacenamiento de caché del navegador
  const claveCache = `trans_cache_${targetLang}_${lowerText}`
  try {
    const cachedValue = await obtenerDato('translations', claveCache)
    if (cachedValue) {
      return cachedValue
    }
  } catch (err) {
    console.warn('Error reading from IndexedDB translations:', err)
  }

  try {
    const response = await fetch(
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(cleanText)}`,
    )

    if (!response.ok) {
      throw new Error(`Google Translate error: ${response.statusText}`)
    }

    const data = await response.json()
    if (data && data[0]) {
      const translated = data[0].map((s) => s[0]).join('')
      // Guardar en caché local
      try {
        await guardarDato('translations', claveCache, translated)
      } catch (err) {
        console.warn('Error writing to IndexedDB translations:', err)
      }
      return translated
    }
    return text
  } catch (error) {
    console.error('Translation failed, falling back to original content:', error)
    return text
  }
}
