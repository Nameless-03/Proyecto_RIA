const CACHE_SHELL = 'littlebox-shell-v1'
const CACHE_API = 'littlebox-api-v1'

// Assets del shell de la aplicación (SPA).
const SHELL_ASSETS = [
  '/',
  '/index.html',
  '/favicon.ico',
]

// Instalar SW y pre-cachear shell.
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_SHELL).then((cache) => cache.addAll(SHELL_ASSETS))
  )
  self.skipWaiting()
})

// Activar SW y limpiar caches viejos.
self.addEventListener('activate', (event) => {
  const cachesValidos = new Set([CACHE_SHELL, CACHE_API])
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => !cachesValidos.has(key))
          .map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Ignorar peticiones no GET.
  if (request.method !== 'GET') return

  // Estrategia: stale-while-revalidate para la API de RAWG.
  if (url.hostname === 'api.rawg.io') {
    event.respondWith(staleWhileRevalidate(CACHE_API, request))
    return
  }

  // Estrategia: cache-first para assets del propio origen.
  if (url.origin === self.location.origin) {
    event.respondWith(cacheFirstConFallback(request))
  }
})

// Cache-first: sirve desde cache, si no hay va a red y guarda en cache de shell.
async function cacheFirstConFallback(request) {
  const cached = await caches.match(request)
  if (cached) return cached

  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(CACHE_SHELL)
      cache.put(request, response.clone())
    }
    return response
  } catch {
    // Sin red y sin cache: devolver index.html para que Vue Router maneje la ruta.
    const fallback = await caches.match('/index.html')
    return fallback || new Response('Sin conexión', { status: 503 })
  }
}

// Stale-while-revalidate: sirve cache inmediatamente y actualiza en background.
async function staleWhileRevalidate(cacheName, request) {
  const cache = await caches.open(cacheName)
  const cached = await cache.match(request)

  const fetchPromise = fetch(request)
    .then((response) => {
      if (response.ok) cache.put(request, response.clone())
      return response
    })
    .catch(() => null)

  // Si hay cache, servirlo inmediatamente (actualización en background).
  return cached || fetchPromise || new Response(JSON.stringify({ error: 'offline' }), {
    status: 503,
    headers: { 'Content-Type': 'application/json' },
  })
}
