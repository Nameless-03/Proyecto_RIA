import { guardarDato, obtenerDato } from '../services/dbService'
import { rawgService } from '../services/rawgService'

const CLAVE_PRIMER_ACCESO = 'precalentamiento_completado'
const TTL_PRECALENTAMIENTO = 60 * 60 * 1000 // 1 hora

// Precalentar la caché de IndexedDB con datos del catálogo al primer acceso.
export async function precalentarCache() {
  try {
    // Verificar si ya se precalentó recientemente para no repetir.
    const yaCompleto = await obtenerDato('games', CLAVE_PRIMER_ACCESO)
    if (yaCompleto) return

    console.log('[Cache] Precalentando IndexedDB en background...')

    // Descargar las primeras 3 páginas del catálogo en paralelo.
    const paginas = [1, 2, 3]
    const peticionesCatalogo = paginas.map((page) =>
      rawgService.getGames({ page, page_size: 12 }).catch((err) => {
        console.warn(`[Cache] Error precalentando página ${page}:`, err)
        return null
      }),
    )

    // Descargar géneros disponibles.
    const peticionGeneros = rawgService.getGenres().catch((err) => {
      console.warn('[Cache] Error precalentando géneros:', err)
      return null
    })

    // Ejecutar todo en paralelo sin bloquear la UI.
    await Promise.all([...peticionesCatalogo, peticionGeneros])

    // Marcar como completado para no repetir en la siguiente hora.
    await guardarDato('games', CLAVE_PRIMER_ACCESO, true, TTL_PRECALENTAMIENTO)

    console.log('[Cache] Precalentamiento completado.')
  } catch (err) {
    console.warn('[Cache] Error durante precalentamiento:', err)
  }
}
