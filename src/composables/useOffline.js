import { ref, onMounted, onUnmounted } from 'vue'

// Detectar estado de conexión a internet y registrar el Service Worker.
export function useOffline() {
  const estaOffline = ref(!navigator.onLine)

  function actualizarEstado() {
    estaOffline.value = !navigator.onLine
  }

  onMounted(() => {
    window.addEventListener('online', actualizarEstado)
    window.addEventListener('offline', actualizarEstado)
  })

  onUnmounted(() => {
    window.removeEventListener('online', actualizarEstado)
    window.removeEventListener('offline', actualizarEstado)
  })

  return { estaOffline }
}

// Registrar Service Worker en el navegador.
export async function registrarServiceWorker() {
  if (!('serviceWorker' in navigator)) return

  try {
    const registro = await navigator.serviceWorker.register('/sw.js', { scope: '/' })
    console.log('[SW] Registrado:', registro.scope)
  } catch (error) {
    console.error('[SW] Error al registrar:', error)
  }
}
