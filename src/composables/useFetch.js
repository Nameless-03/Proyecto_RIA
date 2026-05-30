import { ref } from 'vue'

/**
 * Composable reutilizable para gestionar peticiones asíncronas,
 * estados de carga (loading) y errores.
 */
export function useFetch(asyncFunction) {
  const data = ref(null)
  const loading = ref(false)
  const error = ref(null)

  const execute = async (...args) => {
    loading.value = true
    error.value = null
    try {
      data.value = await asyncFunction(...args)
      return data.value
    } catch (err) {
      error.value = err.message || 'Error al realizar la petición.'
      console.error('useFetch error:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    data,
    loading,
    error,
    execute,
  }
}
