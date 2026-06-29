<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { rawgService } from '../services/rawgService'
import { useGamesStore } from '../stores/games'
import { useAuthStore } from '../stores/auth'
import { translateText } from '../services/translateService'
import { useI18n } from '../composables/useI18n'

const route = useRoute()
const router = useRouter()
const gamesStore = useGamesStore()
const authStore = useAuthStore()
const { t } = useI18n()

const game = ref(null)
const loading = ref(true)
const error = ref(null)

// Translation states
const originalDescription = ref('')
const translatedDescription = ref('')
const isTranslated = ref(false)
const translating = ref(false)
const showOriginal = ref(false)

const getLanguageName = (code) => {
  const mapping = {
    es: 'Español',
    en: 'Inglés',
    pt: 'Portugués',
    fr: 'Francés',
    de: 'Alemán',
    it: 'Italiano',
  }
  return mapping[code] || code
}

const toggleOriginal = () => {
  showOriginal.value = !showOriginal.value
  if (showOriginal.value) {
    game.value.description = originalDescription.value
  } else {
    game.value.description = translatedDescription.value
  }
}

onMounted(async () => {
  try {
    const gameId = route.params.id
    const gameData = await rawgService.getGameDetail(gameId)
    if (!gameData) {
      throw new Error('Juego no encontrado en caché y sin conexión')
    }
    game.value = gameData
    const desc = gameData.description || gameData.description_raw || ''
    originalDescription.value = desc

    // Attempt translation if preference is not English and we have description content
    const targetLang = authStore.preferences.language || 'es'
    if (targetLang !== 'en' && desc) {
      translating.value = true
      try {
        const translated = await translateText(desc, targetLang, 'auto')
        if (translated && translated !== desc) {
          translatedDescription.value = translated
          game.value.description = translated
          isTranslated.value = true
        }
      } catch (err) {
        console.warn('Failed to translate description:', err)
      } finally {
        translating.value = false
      }
    }
  } catch (err) {
    error.value = t('Error al cargar los detalles del juego.')
    console.error(err)
  } finally {
    loading.value = false
  }
})

const goToGenre = (genreSlug) => {
  if (authStore.isLoggedIn) {
    authStore.updatePreferences({
      preferredGenre: genreSlug,
    })
  }
  gamesStore.setTempFilters({
    genre: genreSlug,
    page: 1,
  })
  router.push('/catalog')
}
</script>

<template>
  <div class="game-detail container fade-in">
    <!-- Back Button -->
    <button @click="router.back()" class="btn btn--secondary game-detail__back-btn">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <line x1="19" y1="12" x2="5" y2="12"></line>
        <polyline points="12 19 5 12 12 5"></polyline>
      </svg>
      {{ t('Volver') }}
    </button>

    <div v-if="loading" class="game-detail__loading">{{ t('Cargando detalles del juego...') }}</div>

    <div v-else-if="error" class="game-detail__error">
      {{ error }}
    </div>

    <div v-else-if="game" class="game-detail__layout">
      <!-- Media Header (Hero) -->
      <header
        class="game-detail__hero"
        :style="{
          backgroundImage: `linear-gradient(to bottom, rgba(14, 14, 16, 0.4), rgba(14, 14, 16, 0.95)), url(${game.background_image})`,
        }"
      >
        <div class="game-detail__hero-content">
          <div class="game-detail__headline">
            <button
              v-for="g in game.genres"
              :key="g.id"
              class="game-detail__tag game-detail__tag--clickable"
              @click="goToGenre(g.slug)"
            >
              {{ g.name }}
            </button>
          </div>
          <h1 class="game-detail__title">{{ game.name }}</h1>
          <p class="game-detail__release">
            {{ t('Publicado:') }}
            {{ game.released || t('No especificado') }}
          </p>
        </div>
      </header>

      <!-- Main Info grid -->
      <div class="game-detail__grid">
        <!-- Details Column -->
        <main class="game-detail__main">
          <section class="game-detail__section">
            <div class="game-detail__section-header">
              <h2 class="game-detail__section-title">{{ t('Sobre el Juego') }}</h2>

              <!-- Translation Indicator / Button -->
              <div v-if="isTranslated" class="translation-status">
                <span class="translation-status__badge">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="sparkle-icon"
                  ></svg>
                  {{ t('Traducido al') }}
                  {{ getLanguageName(authStore.preferences.language) }}
                </span>
                <button
                  @click="toggleOriginal"
                  class="btn btn--secondary btn--xs translation-status__btn"
                >
                  {{ showOriginal ? t('Ver Traducido') : t('Ver Original') }}
                </button>
              </div>
              <div v-else-if="translating" class="translation-status">
                <span class="translation-status__loading">
                  <span class="spinner"></span>
                  {{ t('Traduciendo descripción...') }}
                </span>
              </div>
            </div>

            <div
              class="game-detail__description"
              v-html="
                game.description || game.description_raw || t('No hay descripción disponible.')
              "
            ></div>
          </section>

          <!-- Screenshots Carousel / Grid -->
          <section
            v-if="game.short_screenshots && game.short_screenshots.length > 0"
            class="game-detail__section"
          >
            <h2 class="game-detail__section-title">{{ t('Capturas de Pantalla') }}</h2>
            <div class="game-detail__screenshots">
              <img
                v-for="ss in game.short_screenshots.filter((s) => s.id !== -1)"
                :key="ss.id"
                :src="ss.image"
                :alt="`Screenshot of ${game.name}`"
                class="game-detail__screenshot-img"
                loading="lazy"
              />
            </div>
          </section>
        </main>

        <!-- Sidebar / Purchase Block -->
        <aside class="game-detail__sidebar">
          <div class="purchase-box">
            <div class="purchase-box__price-row">
              <span class="purchase-box__label">{{ t('Precio Estimado') }}</span>
              <span class="purchase-box__price">
                {{ authStore.formatPrice(game.price || ((game.id % 6) + 1) * 10 - 0.01) }}
              </span>
            </div>

            <div class="purchase-box__actions">
              <button
                @click="gamesStore.addToCart(game)"
                class="btn btn--primary purchase-box__btn"
                :class="{ 'btn--disabled': gamesStore.isInCart(game.id) }"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <circle cx="9" cy="21" r="1"></circle>
                  <circle cx="20" cy="21" r="1"></circle>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>
                <span>{{ gamesStore.isInCart(game.id) ? t('En Carrito') : t('Comprar') }}</span>
              </button>

              <button
                @click="gamesStore.toggleFavorite(game)"
                class="btn btn--secondary purchase-box__btn"
                :class="{ 'btn--active': gamesStore.isFavorite(game.id) }"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="heart-icon"
                  :class="{ 'heart-icon--filled': gamesStore.isFavorite(game.id) }"
                >
                  <path
                    d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                  ></path>
                </svg>
                <span>{{
                  gamesStore.isFavorite(game.id) ? t('Favorito') : t('Añadir a favoritos')
                }}</span>
              </button>
            </div>
          </div>

          <div class="specs-box">
            <div v-if="game.metacritic" class="specs-box__row">
              <span class="specs-box__label">Metacritic:</span>
              <span
                class="specs-box__score"
                :class="{
                  'specs-box__score--high': game.metacritic >= 75,
                  'specs-box__score--medium': game.metacritic >= 50 && game.metacritic < 75,
                  'specs-box__score--low': game.metacritic < 50,
                }"
                >{{ game.metacritic }}</span
              >
            </div>

            <div v-if="game.rating" class="specs-box__row">
              <span class="specs-box__label">Rating:</span>
              <span class="specs-box__rating">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#ffc107"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="star-icon"
                >
                  <polygon
                    points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
                  ></polygon>
                </svg>
                {{ game.rating }} / 5 ({{ game.ratings_count }} {{ t('votos') }})
              </span>
            </div>

            <div v-if="game.playtime" class="specs-box__row">
              <span class="specs-box__label">{{ t('Tiempo de juego:') }}</span>
              <span>{{ game.playtime }} {{ t('horas') }}</span>
            </div>

            <div v-if="game.platforms" class="specs-box__row specs-box__row--vertical">
              <span class="specs-box__label">{{ t('Plataformas:') }}</span>
              <div class="specs-box__platforms">
                <span
                  v-for="p in game.platforms"
                  :key="p.platform.id"
                  class="specs-box__platform-tag"
                >
                  {{ p.platform.name }}
                </span>
              </div>
            </div>

            <div v-if="game.developers && game.developers.length > 0" class="specs-box__row">
              <span class="specs-box__label">{{ t('Desarrollador:') }}</span>
              <span>{{ game.developers.map((d) => d.name).join(', ') }}</span>
            </div>

            <div v-if="game.publishers && game.publishers.length > 0" class="specs-box__row">
              <span class="specs-box__label">{{ t('Editor:') }}</span>
              <span>{{ game.publishers.map((p) => p.name).join(', ') }}</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  </div>
</template>
