import { useAuthStore } from '../stores/auth'
import { getTranslation } from '../data/translations'

export function useI18n() {
  const authStore = useAuthStore()

  const t = (key) => {
    return getTranslation(key, authStore.preferences.language)
  }

  return { t }
}
