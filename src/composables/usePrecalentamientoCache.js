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

// Pre-fetchear una imagen para que el SW la guarde en caché.
async function prefetchearImagen(url) {
  if (!url) return
  try {
    await fetch(url, { mode: 'no-cors' })
  } catch {
    // Silenciar errores de red — si falla, simplemente no se cachea.
  }
}

// Precalentar la caché de IndexedDB con datos del catálogo al primer acceso.
export async function precalentarCache() {
  try {
    // Verificar si ya se precalentó recientemente para no repetir.
    const yaCompleto = await obtenerDato('games', CLAVE_PRIMER_ACCESO)
    if (yaCompleto) return

    console.log('[Cache] Precalentando IndexedDB en background...')

    const combinaciones = generarCombinacionesCatalogo()
    const juegosCargados = new Map() // id → game object

    // Descargar catálogo de a lotes de 5 peticiones.
    const LOTE = 5
    for (let i = 0; i < combinaciones.length; i += LOTE) {
      const lote = combinaciones.slice(i, i + LOTE)
      const resultados = await Promise.all(
        lote.map((params) =>
          rawgService.getGames(params).catch(() => null),
        ),
      )
      // Acumular juegos únicos por id.
      for (const resultado of resultados) {
        if (!resultado?.results) continue
        for (const juego of resultado.results) {
          if (!juegosCargados.has(juego.id)) {
            juegosCargados.set(juego.id, juego)
          }
        }
      }
    }

    // Descargar géneros.
    await rawgService.getGenres().catch(() => null)

    // Descargar detalles completos + imágenes de los primeros 40 juegos únicos.
    const idsUnicos = [...juegosCargados.keys()].slice(0, 40)

    for (let i = 0; i < idsUnicos.length; i += LOTE) {
      const lote = idsUnicos.slice(i, i + LOTE)
      await Promise.all(
        lote.map(async (id) => {
          // Detalle completo → queda en IndexedDB.
          const detalle = await rawgService.getGameDetail(id).catch(() => null)

          // Imágenes → el fetch hace que el SW las cachee automáticamente.
          const imagenes = []
          if (detalle?.background_image) imagenes.push(detalle.background_image)
          if (detalle?.short_screenshots) {
            for (const ss of detalle.short_screenshots) {
              if (ss.image) imagenes.push(ss.image)
            }
          }

          // También la imagen de portada del listado.
          const juegoListado = juegosCargados.get(id)
          if (juegoListado?.background_image) imagenes.push(juegoListado.background_image)

          // Pre-fetchear todas las imágenes en paralelo.
          await Promise.all(imagenes.map(prefetchearImagen))
        }),
      )
    }

    // Marcar como completado.
    await guardarDato('games', CLAVE_PRIMER_ACCESO, true, TTL_PRECALENTAMIENTO)

    console.log(`[Cache] Precalentamiento completado. ${idsUnicos.length} juegos con detalles e imágenes cacheados.`)
  } catch (err) {
    console.warn('[Cache] Error durante precalentamiento:', err)
  }
}
