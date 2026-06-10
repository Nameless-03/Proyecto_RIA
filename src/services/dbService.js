const DB_NAME = 'LittleBoxGamesDB'
const DB_VERSION = 1
const STORE_TRANSLATIONS = 'translations'
const STORE_GAMES = 'games'

// Inicializar base de datos
export function inicializarDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)

    request.onupgradeneeded = (event) => {
      const db = event.target.result
      if (!db.objectStoreNames.contains(STORE_TRANSLATIONS)) {
        db.createObjectStore(STORE_TRANSLATIONS)
      }
      if (!db.objectStoreNames.contains(STORE_GAMES)) {
        db.createObjectStore(STORE_GAMES)
      }
    }
  })
}

// Obtener dato de base de datos
export async function obtenerDato(storeName, clave) {
  const db = await inicializarDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly')
    const store = transaction.objectStore(storeName)
    const request = store.get(clave)

    request.onsuccess = () => {
      const payload = request.result
      if (!payload) {
        resolve(null)
        return
      }

      // Validar si el dato ha expirado
      if (payload.timestamp && payload.ttl && Date.now() - payload.timestamp > payload.ttl) {
        db.transaction(storeName, 'readwrite').objectStore(storeName).delete(clave)
        resolve(null)
      } else {
        resolve(payload.value)
      }
    }
    request.onerror = () => reject(request.error)
  })
}

// Guardar dato en base de datos
export async function guardarDato(storeName, clave, valor, ttlMs = null) {
  const db = await inicializarDB()
  const payload = {
    value: valor,
    timestamp: ttlMs ? Date.now() : null,
    ttl: ttlMs,
  }
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite')
    const store = transaction.objectStore(storeName)
    const request = store.put(payload, clave)

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}
