import { guardarDato, obtenerDato } from '../services/dbService'
import { rawgService } from '../services/rawgService'

const CLAVE_PRIMER_ACCESO = 'precalentamiento_completado'
const TTL_PRECALENTAMIENTO = 24 * 60 * 60 * 1000 // 24 horas

// Generar todas las combinaciones de parámetros que usa el catálogo.
function generarCombinacionesCatalogo() {
  const pageSizes = [6, 12, 24]
  const ordenamientos = ['', '-rating', '-released', 'name']
  const paginas = [1, 2, 3, 4, 5]
  const combinaciones = []

  for (const page_size of pageSizes) {
    for (const ordering of ordenamientos) {
      for (const page of paginas) {
        combinaciones.push({ page, page_size, ordering, genres: '', search: '' })
      }
    }
  }

  return combinaciones
}

// Precalentar la caché de IndexedDB con datos del catálogo al primer acceso.
export async function precalentarCache() {
  try {
    // Verificar si ya se precalentó recientemente para no repetir.
    const yaCompleto = await obtenerDato('games', CLAVE_PRIMER_ACCESO)
    if (yaCompleto) return

    console.log('[Cache] Precalentando IndexedDB en background...')

    const combinaciones = generarCombinacionesCatalogo()

    // Descargar de a lotes de 5 peticiones para no saturar la red.
    const LOTE = 5
    for (let i = 0; i < combinaciones.length; i += LOTE) {
      const lote = combinaciones.slice(i, i + LOTE)
      await Promise.all(
        lote.map((params) =>
          rawgService.getGames(params).catch((err) => {
            console.warn(`[Cache] Error en combinación ${JSON.stringify(params)}:`, err)
            return null
          }),
        ),
      )
    }

    // Descargar géneros disponibles.
    await rawgService.getGenres().catch((err) => {
      console.warn('[Cache] Error precalentando géneros:', err)
    })

    // Marcar como completado.
    await guardarDato('games', CLAVE_PRIMER_ACCESO, true, TTL_PRECALENTAMIENTO)

    console.log('[Cache] Precalentamiento completado.')
  } catch (err) {
    console.warn('[Cache] Error durante precalentamiento:', err)
  }
}
