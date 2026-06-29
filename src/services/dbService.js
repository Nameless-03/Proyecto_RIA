const DB_NAME = 'LittleBoxGamesDB'
const DB_VERSION = 1
const STORE_TRANSLATIONS = 'translations'
const STORE_GAMES = 'games'

let dbInstance = null
let dbPromise = null

// Inicializar base de datos y cachear conexión.
export function inicializarDB() {
  if (dbPromise) return dbPromise

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => {
      dbPromise = null
      reject(request.error)
    }
    request.onsuccess = () => {
      dbInstance = request.result
      dbInstance.onversionchange = () => {
        dbInstance.close()
        dbInstance = null
        dbPromise = null
      }
      resolve(dbInstance)
    }

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

  return dbPromise
}

// Obtener dato de base de datos.
export async function obtenerDato(storeName, clave) {
  const db = await inicializarDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly')
    const store = transaction.objectStore(storeName)
    const request = store.get(clave)

    transaction.onerror = () => reject(transaction.error)
    request.onerror = () => reject(request.error)

    request.onsuccess = () => {
      const payload = request.result
      if (!payload) {
        resolve(null)
        return
      }

      // Validar si el dato ha expirado.
      if (payload.timestamp && payload.ttl && Date.now() - payload.timestamp > payload.ttl) {
        eliminarDato(storeName, clave).catch(console.error)
        resolve(null)
      } else {
        resolve(payload.value)
      }
    }
  })
}

// Guardar dato en base de datos.
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

    transaction.onerror = () => reject(transaction.error)
    request.onerror = () => reject(request.error)

    request.onsuccess = () => resolve(request.result)
  })
}

// Eliminar dato de base de datos.
export async function eliminarDato(storeName, clave) {
  const db = await inicializarDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite')
    const store = transaction.objectStore(storeName)
    const request = store.delete(clave)

    transaction.onerror = () => reject(transaction.error)
    request.onerror = () => reject(request.error)

    request.onsuccess = () => resolve()
  })
}

// Obtener todos los datos de un store.
export async function obtenerTodosLosDatos(storeName) {
  const db = await inicializarDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly')
    const store = transaction.objectStore(storeName)
    const request = store.getAll()

    transaction.onerror = () => reject(transaction.error)
    request.onerror = () => reject(request.error)

    request.onsuccess = () => {
      const results = request.result || []
      const validResults = results
        .filter((payload) => {
          if (payload && payload.timestamp && payload.ttl && Date.now() - payload.timestamp > payload.ttl) {
            return false
          }
          return true
        })
        .map((payload) => payload.value)
      resolve(validResults)
    }
  })
}

