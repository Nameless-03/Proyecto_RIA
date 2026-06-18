<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { rawgService } from '../services/rawgService'
import { useGamesStore } from '../stores/games'
import GameCard from '../components/GameCard.vue'
import { useFavorites } from '../composables/useFavorites'
import { useI18n } from '../composables/useI18n'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const gamesStore = useGamesStore()
const authStore = useAuthStore()
const { isFavorite, toggleFavorite } = useFavorites()
const { t } = useI18n()

// Destacados
const featuredGames = ref(gamesStore.homeFeatured)
const loading = ref(gamesStore.homeFeatured.length === 0)
const error = ref(null)

// Últimos Lanzamientos
const latestReleases = ref(gamesStore.homeLatest)
const latestLoading = ref(gamesStore.homeLatest.length === 0)
const latestError = ref(null)

// Categorías Aleatorias (Exploración Rápida)
const randomCategories = ref(gamesStore.homeRandomCategories)
const categoriesLoading = ref(gamesStore.homeRandomCategories.length === 0)
const categoriesError = ref(null)

// Descubre
const discoverCategories = ref(gamesStore.homeDiscover)
const discoverLoading = ref(gamesStore.homeDiscover.length === 0)
const discoverError = ref(null)

// Recomendados para el usuario
const recommendedGames = ref([])
const recommendedGenreName = ref('')
const recommendedLoading = ref(false)
const recommendedError = ref(null)

// Navegación interactiva filtrada mediante Pinia hacia el Catálogo
const exploreCategory = (genreSlug) => {
  if (authStore.isLoggedIn) {
    authStore.updatePreferences({
      preferredGenre: genreSlug,
    })
  }
  gamesStore.setTempFilters({ genre: genreSlug, page: 1 })
  router.push('/catalog')
}

onMounted(async () => {
  // Cargar juegos recomendados según gustos si está iniciado sesión
  if (authStore.isLoggedIn && authStore.preferences.preferredGenre) {
    recommendedLoading.value = true
    try {
      const genreSlug = authStore.preferences.preferredGenre

      // Obtener el nombre legible del género
      const genres = await rawgService.getGenres()
      const genreObj = genres.find((g) => g.slug === genreSlug)
      recommendedGenreName.value = genreObj ? genreObj.name : genreSlug

      const data = await rawgService.getGames({
        genres: genreSlug,
        page_size: 4,
      })
      recommendedGames.value = data.results
    } catch (err) {
      recommendedError.value = t('Error al cargar los juegos recomendados.')
      console.error(err)
    } finally {
      recommendedLoading.value = false
    }
  }

  // Cargar videojuegos destacados (Títulos Destacados)
  try {
    const data = await rawgService.getGames({ page_size: 3 })
    featuredGames.value = data.results
    gamesStore.setHomeCache({ featured: data.results })
  } catch (err) {
    error.value = t('Error al cargar los videojuegos destacados.')
    console.error(err)
  } finally {
    loading.value = false
  }

  // Cargar últimos lanzamientos
  try {
    const latestData = await rawgService.getGames({
      ordering: '-released',
      page_size: 4,
    })
    latestReleases.value = latestData.results
    gamesStore.setHomeCache({ latest: latestData.results })
  } catch (err) {
    latestError.value = t('Error al cargar los últimos lanzamientos.')
    console.error(err)
  } finally {
    latestLoading.value = false
  }

  // Cargar categorías de exploración rápida aleatorias
  try {
    const genres = await rawgService.getGenres()
    if (genres && genres.length > 0) {
      // Barajar y tomar 5 géneros al azar
      const shuffledGenres = [...genres].sort(() => 0.5 - Math.random())
      randomCategories.value = shuffledGenres.slice(0, 5)
      gamesStore.setHomeCache({ randomCategories: shuffledGenres.slice(0, 5) })
    }
  } catch (err) {
    categoriesError.value = t('Error al cargar las categorías de exploración.')
    console.error(err)
  } finally {
    categoriesLoading.value = false
  }

  // Cargar sección Descubre (categorías aleatorias con juegos aleatorios)
  try {
    const genres = await rawgService.getGenres()
    if (genres && genres.length > 0) {
      // Barajar y elegir 2 géneros al azar distintos de los recomendados
      const shuffledGenres = [...genres].sort(() => 0.5 - Math.random())
      const selectedGenres = shuffledGenres.slice(0, 2)

      const categoriesData = []
      for (const genre of selectedGenres) {
        // Pedir 12 juegos para tener una buena muestra que barajar
        const data = await rawgService.getGames({
          genres: genre.slug,
          page_size: 12,
        })

        if (data && data.results && data.results.length > 0) {
          // Barajar juegos obtenidos y tomar 4 al azar
          const shuffledGames = [...data.results].sort(() => 0.5 - Math.random())
          categoriesData.push({
            id: genre.id,
            name: genre.name,
            slug: genre.slug,
            games: shuffledGames.slice(0, 4),
          })
        }
      }
      discoverCategories.value = categoriesData
      gamesStore.setHomeCache({ discover: categoriesData })
    }
  } catch (err) {
    discoverError.value = 'Error al cargar las categorías de descubrimiento.'
    console.error(err)
  } finally {
    discoverLoading.value = false
  }
})
</script>

<template>
  <div class="home-view fade-in">
    <!-- Hero Banner (Steam/Twitch vibe) -->
    <header class="home-hero">
      <div class="home-hero__content">
        <h1 class="home-hero__title">{{ t('Descubre tu próximo juego favorito') }}</h1>
        <p class="home-hero__subtitle">
          {{
            t(
              'Explora miles de títulos, gestiona tu biblioteca y compra de forma segura con la mejor experiencia gaming.',
            )
          }}
        </p>
        <div class="home-hero__actions">
          <RouterLink to="/catalog" class="btn btn--primary">
            {{ t('Explorar Catálogo') }}
          </RouterLink>
          <RouterLink to="/profile" class="btn btn--secondary">
            {{ t('Mi Perfil') }}
          </RouterLink>
        </div>
      </div>
    </header>

    <!-- Recommended Games Section (Personalized) -->
    <section
      v-if="authStore.isLoggedIn && recommendedGames.length > 0"
      class="home-recommended container"
    >
      <h2 class="home-recommended__title">
        {{ t('Recomendados para ti') }}
        <span class="home-recommended__genre-badge">{{ recommendedGenreName }}</span>
      </h2>
      <p class="home-recommended__subtitle">
        {{ t('Basado en tu interés por los juegos de la categoría') }}
        <strong>{{ recommendedGenreName }}</strong
        >.
      </p>

      <div v-if="recommendedLoading" class="home-recommended__loading">
        {{ t('Cargando recomendaciones personalizadas...') }}
      </div>
      <div v-else-if="recommendedError" class="home-recommended__error">
        {{ recommendedError }}
      </div>
      <div v-else class="home-recommended__grid">
        <GameCard v-for="game in recommendedGames" :key="game.id" :game="game">
          <template #actions>
            <RouterLink :to="`/game/${game.id}`" class="btn btn--secondary btn--primary-hover">
              {{ t('Ver Detalles') }}
            </RouterLink>
            <button
              @click="toggleFavorite(game)"
              class="btn btn--outline"
              :class="{ 'btn--active': isFavorite(game.id) }"
              :title="t('Añadir a favoritos')"
            >
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
                class="heart-icon"
                :class="{ 'heart-icon--filled': isFavorite(game.id) }"
              >
                <path
                  d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                ></path>
              </svg>
              {{ t('Fav') }}
            </button>
          </template>
        </GameCard>
      </div>
    </section>

    <!-- Featured Games Section -->
    <section class="home-featured container">
      <h2 class="home-featured__title">{{ t('Títulos Destacados') }}</h2>

      <div v-if="loading" class="home-featured__loading">
        {{ t('Cargando juegos destacados...') }}
      </div>

      <div v-else-if="error" class="home-featured__error">
        {{ error }}
      </div>

      <div v-else class="home-featured__grid">
        <GameCard v-for="game in featuredGames" :key="game.id" :game="game">
          <template #actions>
            <RouterLink :to="`/game/${game.id}`" class="btn btn--secondary btn--primary-hover">
              {{ t('Ver Detalles') }}
            </RouterLink>
            <button
              @click="toggleFavorite(game)"
              class="btn btn--outline"
              :class="{ 'btn--active': isFavorite(game.id) }"
              :title="t('Añadir a favoritos')"
            >
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
                class="heart-icon"
                :class="{ 'heart-icon--filled': isFavorite(game.id) }"
              >
                <path
                  d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                ></path>
              </svg>
              {{ t('Fav') }}
            </button>
          </template>
        </GameCard>
      </div>
    </section>

    <!-- Latest Releases Section -->
    <section class="home-latest container">
      <h2 class="home-latest__title">{{ t('Últimos Lanzamientos') }}</h2>

      <div v-if="latestLoading" class="home-latest__loading">
        {{ t('Cargando últimos lanzamientos...') }}
      </div>
      <div v-else-if="latestError" class="home-latest__error">
        {{ t(latestError) }}
      </div>
      <div v-else class="home-latest__grid">
        <GameCard v-for="game in latestReleases" :key="game.id" :game="game">
          <template #actions>
            <RouterLink :to="`/game/${game.id}`" class="btn btn--secondary btn--primary-hover">
              {{ t('Ver Detalles') }}
            </RouterLink>
            <button
              @click="toggleFavorite(game)"
              class="btn btn--outline"
              :class="{ 'btn--active': isFavorite(game.id) }"
              :title="t('Añadir a favoritos')"
            >
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
                class="heart-icon"
                :class="{ 'heart-icon--filled': isFavorite(game.id) }"
              >
                <path
                  d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                ></path>
              </svg>
              {{ t('Fav') }}
            </button>
          </template>
        </GameCard>
      </div>
    </section>

    <!-- Explore by Category Section -->
    <section class="home-categories container">
      <div class="home-categories__header">
        <h2 class="home-categories__title">{{ t('Explorar por Categoría') }}</h2>
        <p class="home-categories__subtitle">
          {{
            t(
              'Haz clic en cualquier categoría para ver los mejores videojuegos de ese género en el catálogo.',
            )
          }}
        </p>
      </div>

      <div v-if="categoriesLoading" class="home-categories__loading">
        {{ t('Cargando categorías de exploración...') }}
      </div>
      <div v-else-if="categoriesError" class="home-categories__error">
        {{ categoriesError }}
      </div>
      <div v-else class="home-categories__grid">
        <div
          v-for="category in randomCategories"
          :key="category.id"
          class="category-card"
          @click="exploreCategory(category.slug)"
        >
          <!-- Glowing background accent -->
          <div class="category-card__glow"></div>

          <!-- Category Details -->
          <span class="category-card__icon">
            <!-- Acción (action) -->
            <svg
              v-if="category.slug === 'action'"
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M14.5 17.5L3 6V3h3l11.5 11.5M13 19l-2-2M19 13l-2-2"></path>
              <circle cx="18" cy="6" r="3"></circle>
            </svg>

            <!-- Shooter -->
            <svg
              v-else-if="category.slug === 'shooter'"
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="22" y1="12" x2="18" y2="12"></line>
              <line x1="6" y1="12" x2="2" y2="12"></line>
              <line x1="12" y1="6" x2="12" y2="2"></line>
              <line x1="12" y1="22" x2="12" y2="18"></line>
            </svg>

            <!-- RPG (role-playing-games-rpg) -->
            <svg
              v-else-if="category.slug === 'role-playing-games-rpg'"
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            </svg>

            <!-- Aventura (adventure) -->
            <svg
              v-else-if="category.slug === 'adventure'"
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon>
            </svg>

            <!-- Indie -->
            <svg
              v-else-if="category.slug === 'indie'"
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path
                d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A5 5 0 0 0 8 8c0 1 .3 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"
              ></path>
              <line x1="9" y1="18" x2="15" y2="18"></line>
              <line x1="10" y1="22" x2="14" y2="22"></line>
            </svg>

            <!-- Puzle (puzzle) -->
            <svg
              v-else-if="category.slug === 'puzzle'"
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <rect x="3" y="3" width="7" height="7"></rect>
              <rect x="14" y="3" width="7" height="7"></rect>
              <rect x="14" y="14" width="7" height="7"></rect>
              <rect x="3" y="14" width="7" height="7"></rect>
            </svg>

            <!-- Deportes (sports) -->
            <svg
              v-else-if="category.slug === 'sports'"
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              view="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
              <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
              <path d="M4 22h16"></path>
              <path d="M10 14.66V17c0 .55-.45 1-1 1H4v2h16v-2h-5c-.55 0-1-.45-1-1v-2.34"></path>
              <path d="M12 2a6 6 0 0 1 6 6v5a6 6 0 0 1-6 6 6 6 0 0 1-6-6V8a6 6 0 0 1 6-6z"></path>
            </svg>

            <!-- Carreras (racing) -->
            <svg
              v-else-if="category.slug === 'racing'"
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path>
              <line x1="4" y1="22" x2="4" y2="15"></line>
            </svg>

            <!-- Estrategia (strategy) -->
            <svg
              v-else-if="category.slug === 'strategy'"
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
              <path d="M2 17l10 5 10-5"></path>
              <path d="M2 12l10 5 10-5"></path>
            </svg>

            <!-- Simulación (simulation) -->
            <svg
              v-else-if="category.slug === 'simulation'"
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
              <line x1="8" y1="21" x2="16" y2="21"></line>
              <line x1="12" y1="17" x2="12" y2="21"></line>
            </svg>

            <!-- Icono Gamepad por Defecto -->
            <svg
              v-else
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <line x1="6" y1="12" x2="10" y2="12"></line>
              <line x1="8" y1="10" x2="8" y2="14"></line>
              <line x1="15" y1="13" x2="15.01" y2="13"></line>
              <line x1="18" y1="11" x2="18.01" y2="11"></line>
              <rect x="2" y="6" width="20" height="12" rx="3"></rect>
            </svg>
          </span>
          <span class="category-card__name">{{ category.name }}</span>
        </div>
      </div>
    </section>

    <!-- Discover Section -->
    <section class="home-discover container">
      <div class="home-discover__header">
        <h2 class="home-discover__title">{{ t('Descubre') }}</h2>
        <p class="home-discover__subtitle">
          {{ t('Explora categorías nuevas y descubre tu próximo título favorito.') }}
        </p>
      </div>

      <div v-if="discoverLoading" class="home-discover__loading">
        {{ t('Cargando categorías recomendadas...') }}
      </div>

      <div v-else-if="discoverError" class="home-discover__error">
        {{ t(discoverError) }}
      </div>

      <div v-else class="home-discover__categories">
        <div
          v-for="category in discoverCategories"
          :key="category.id"
          class="home-discover__category"
        >
          <h3 class="home-discover__category-title">
            <!-- Gamepad category icon outline -->
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--color-primary)"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="home-discover__category-icon"
            >
              <line x1="6" y1="12" x2="10" y2="12"></line>
              <line x1="8" y1="10" x2="8" y2="14"></line>
              <line x1="15" y1="13" x2="15.01" y2="13"></line>
              <line x1="18" y1="11" x2="18.01" y2="11"></line>
              <rect x="2" y="6" width="20" height="12" rx="3"></rect>
            </svg>
            {{ t('Categoría') }}: {{ category.name }}
          </h3>

          <div class="home-discover__grid">
            <GameCard v-for="game in category.games" :key="game.id" :game="game">
              <template #actions>
                <RouterLink :to="`/game/${game.id}`" class="btn btn--secondary btn--primary-hover">
                  {{ t('Ver Detalles') }}
                </RouterLink>
                <button
                  @click="toggleFavorite(game)"
                  class="btn btn--outline"
                  :class="{ 'btn--active': isFavorite(game.id) }"
                  :title="t('Añadir a favoritos')"
                >
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
                    class="heart-icon"
                    :class="{ 'heart-icon--filled': isFavorite(game.id) }"
                  >
                    <path
                      d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                    ></path>
                  </svg>
                  {{ t('Fav') }}
                </button>
              </template>
            </GameCard>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.heart-icon {
  stroke: currentColor;
  transition:
    transform 0.2s ease,
    fill 0.2s ease;
}

.heart-icon--filled {
  fill: var(--color-primary);
  stroke: var(--color-primary);
}

.btn--active .heart-icon {
  stroke: var(--color-primary);
  fill: var(--color-primary);
}

.home-view {
  display: flex;
  flex-direction: column;
  gap: 3.5rem;
  padding-bottom: 4rem;
}

.home-hero {
  position: relative;
  background:
    linear-gradient(135deg, rgba(145, 70, 255, 0.4) 0%, rgba(14, 14, 16, 0.9) 100%),
    url('https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=1600&auto=format&fit=crop&q=80')
      no-repeat center/cover;
  padding: 6rem 2rem;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  border-bottom: 1px solid var(--color-border);
}

.home-hero__content {
  max-width: 800px;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.home-hero__title {
  font-size: 3rem;
  font-weight: 800;
  color: #ffffff;
  line-height: 1.2;
  letter-spacing: -1px;
}

.home-hero__subtitle {
  font-size: 1.25rem;
  color: var(--color-text-secondary);
  line-height: 1.6;
}

.home-hero__actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 1rem;
}

.home-featured {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.home-featured__title {
  font-size: 2rem;
  font-weight: 700;
  border-left: 4px solid var(--color-primary);
  padding-left: 0.75rem;
}

.home-featured__loading,
.home-featured__error {
  text-align: center;
  padding: 3rem;
  background-color: var(--color-bg-secondary);
  border-radius: var(--border-radius-lg);
  color: var(--color-text-secondary);
}

.home-featured__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
}

/* Latest Releases Section */
.home-latest {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.home-latest__title {
  font-size: 2rem;
  font-weight: 700;
  border-left: 4px solid var(--color-primary);
  padding-left: 0.75rem;
}

.home-latest__loading,
.home-latest__error {
  text-align: center;
  padding: 3rem;
  background-color: var(--color-bg-secondary);
  border-radius: var(--border-radius-lg);
  color: var(--color-text-secondary);
}

.home-latest__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;
}

/* Explore by Category Section */
.home-categories {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.home-categories__header {
  border-left: 4px solid var(--color-primary);
  padding-left: 0.75rem;
}

.home-categories__title {
  font-size: 2rem;
  font-weight: 700;
}

.home-categories__subtitle {
  color: var(--color-text-secondary);
  font-size: 0.95rem;
  margin-top: 0.25rem;
}

.home-categories__loading,
.home-categories__error {
  text-align: center;
  padding: 2rem;
  background-color: var(--color-bg-secondary);
  border-radius: var(--border-radius-lg);
  color: var(--color-text-secondary);
}

.home-categories__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 1.5rem;
}

/* Category Card Glassmorphic */
.category-card {
  position: relative;
  background-color: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  padding: 1.5rem;
  border-radius: var(--border-radius-lg);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  cursor: pointer;
  overflow: hidden;
  transition: var(--transition-smooth);
  text-align: center;
}

.category-card__glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(0.8);
  width: 100%;
  height: 100%;
  background: radial-gradient(circle, rgba(145, 70, 255, 0.15) 0%, transparent 70%);
  opacity: 0;
  transition: var(--transition-smooth);
  z-index: 1;
}

.category-card:hover .category-card__glow {
  opacity: 1;
  transform: translate(-50%, -50%) scale(1.1);
}

.category-card:hover {
  transform: translateY(-5px);
  border-color: var(--color-primary);
  box-shadow: 0 8px 24px rgba(145, 70, 255, 0.15);
}

.category-card__icon {
  background-color: var(--color-bg-tertiary);
  color: var(--color-primary);
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: var(--transition-smooth);
  z-index: 2;
}

.category-card:hover .category-card__icon {
  background-color: var(--color-primary);
  color: #ffffff;
  transform: rotate(15deg) scale(1.1);
}

.category-card__name {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--color-text-primary);
  z-index: 2;
}

/* Discover Section */
.home-discover {
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
  margin-top: 1rem;
}

.home-discover__header {
  border-left: 4px solid var(--color-primary);
  padding-left: 0.75rem;
}

.home-discover__title {
  font-size: 2rem;
  font-weight: 700;
}

.home-discover__subtitle {
  color: var(--color-text-secondary);
  font-size: 0.95rem;
  margin-top: 0.25rem;
}

.home-discover__loading,
.home-discover__error {
  text-align: center;
  padding: 3rem;
  background-color: var(--color-bg-secondary);
  border-radius: var(--border-radius-lg);
  color: var(--color-text-secondary);
}

.home-discover__categories {
  display: flex;
  flex-direction: column;
  gap: 3rem;
}

.home-discover__category {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.home-discover__category-title {
  font-size: 1.5rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #ffffff;
}

.home-discover__category-icon {
  margin-top: 2px;
}

body.theme-light .home-discover__category-title {
  color: var(--color-text-primary);
}

.home-discover__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;
}

.btn--active {
  background-color: var(--color-accent-purple-light);
  border-color: var(--color-primary);
  color: var(--color-primary);
}

/* Custom buttons */
.btn--primary-hover:hover {
  background-color: var(--color-primary) !important;
  color: #ffffff !important;
  border-color: var(--color-primary) !important;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(145, 70, 255, 0.3);
}

@media (max-width: 768px) {
  .home-hero__title {
    font-size: 2.25rem;
  }

  .home-hero__actions {
    flex-direction: column;
    padding: 0 1rem;
  }
}

/* Recommended Section Styles */
.home-recommended {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  background: linear-gradient(135deg, rgba(145, 70, 255, 0.05) 0%, rgba(14, 14, 16, 0) 100%);
  border: 1px solid var(--color-border);
  padding: 2.5rem;
  border-radius: var(--border-radius-lg);
  position: relative;
  overflow: hidden;
}

.home-recommended::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background-color: var(--color-primary);
}

.home-recommended__title {
  font-size: 2rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #ffffff;
}

body.theme-light .home-recommended__title {
  color: var(--color-text-primary);
}

.home-recommended__genre-badge {
  background-color: var(--color-primary);
  color: #ffffff;
  font-size: 0.8rem;
  font-weight: 700;
  padding: 0.25rem 0.75rem;
  border-radius: 50px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.home-recommended__subtitle {
  color: var(--color-text-secondary);
  font-size: 1rem;
  margin-top: -0.5rem;
}

.home-recommended__loading,
.home-recommended__error {
  text-align: center;
  padding: 3rem;
  color: var(--color-text-secondary);
}

.home-recommended__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;
  margin-top: 1rem;
}
</style>
