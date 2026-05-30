import { reactive, watch } from 'vue'
import { useAuthStore } from '../stores/auth'
import { translateText } from '../services/translateService'

// Load translation cache from localStorage
const translationCache = reactive(
  JSON.parse(localStorage.getItem('dynamic_translations_cache')) || {},
)

// Watch and save cache to localStorage
watch(
  () => translationCache,
  (newCache) => {
    localStorage.setItem('dynamic_translations_cache', JSON.stringify(newCache))
  },
  { deep: true },
)

export function useI18n() {
  const authStore = useAuthStore()

  const t = (text) => {
    if (!text) return ''
    const cleanText = String(text).trim()
    if (!cleanText) return ''

    const lang = authStore.preferences.language || 'es'
    if (lang === 'es') return cleanText // Original text is in Spanish

    const cacheKey = `${lang}:${cleanText}`

    // If translation is in cache, return it instantly
    if (translationCache[cacheKey]) {
      return translationCache[cacheKey]
    }

    // Otherwise, translate asynchronously and update cache reactively
    translationCache[cacheKey] = cleanText // Temporarily set to cleanText to avoid duplicate fetches

    translateText(cleanText, lang, 'es')
      .then((translated) => {
        if (translated) {
          translationCache[cacheKey] = translated
        }
      })
      .catch((err) => {
        console.warn(`Dynamic translation failed for "${cleanText}":`, err)
      })

    return cleanText // Return original text as fallback while translating
  }

  return { t }
}
