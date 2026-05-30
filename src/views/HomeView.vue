<script setup>
import { ref, onMounted } from 'vue'
import { rawgService } from '../services/rawgService'
import GameCard from '../components/GameCard.vue'
import { useFavorites } from '../composables/useFavorites'

const { isFavorite, toggleFavorite } = useFavorites()
const featuredGames = ref([])
const loading = ref(true)
const error = ref(null)

const discoverCategories = ref([])
const discoverLoading = ref(true)
const discoverError = ref(null)

onMounted(async () => {
  // Cargar videojuegos destacados
  try {
    const data = await rawgService.getGames({ page_size: 3 })
    featuredGames.value = data.results
  } catch (err) {
    error.value = 'Error al cargar los videojuegos destacados.'
    console.error(err)
  } finally {
    loading.value = false
  }

  // Cargar sección Descubre (categorías aleatorias con juegos aleatorios)
  try {
    const genres = await rawgService.getGenres()
    if (genres && genres.length > 0) {
      // Barajar y elegir 2 géneros al azar
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
        <h1 class="home-hero__title">Descubre tu próximo juego favorito</h1>
        <p class="home-hero__subtitle">
          Explora miles de títulos, gestiona tu biblioteca y compra de forma segura con la mejor
          experiencia gaming.
        </p>
        <div class="home-hero__actions">
          <RouterLink to="/catalog" class="btn btn--primary"> Explorar Catálogo </RouterLink>
          <RouterLink to="/profile" class="btn btn--secondary"> Mi Perfil </RouterLink>
        </div>
      </div>
    </header>

    <!-- Featured Games Section -->
    <section class="home-featured container">
      <h2 class="home-featured__title">Títulos Destacados</h2>

      <div v-if="loading" class="home-featured__loading">Cargando juegos destacados...</div>

      <div v-else-if="error" class="home-featured__error">
        {{ error }}
      </div>

      <div v-else class="home-featured__grid">
        <GameCard v-for="game in featuredGames" :key="game.id" :game="game">
          <template #actions>
            <RouterLink :to="`/game/${game.id}`" class="btn btn--secondary btn--primary-hover">
              Ver Detalles
            </RouterLink>
            <button
              @click="toggleFavorite(game)"
              class="btn btn--outline"
              :class="{ 'btn--active': isFavorite(game.id) }"
              title="Añadir a favoritos"
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
              Fav
            </button>
          </template>
        </GameCard>
      </div>
    </section>

    <!-- Discover Section (Descubre) -->
    <section class="home-discover container">
      <div class="home-discover__header">
        <h2 class="home-discover__title">Descubre</h2>
        <p class="home-discover__subtitle">
          Explora categorías nuevas y descubre tu próximo titulo favorito.
        </p>
      </div>

      <div v-if="discoverLoading" class="home-discover__loading">
        Cargando categorías recomendadas...
      </div>

      <div v-else-if="discoverError" class="home-discover__error">
        {{ discoverError }}
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
            Categoría: {{ category.name }}
          </h3>

          <div class="home-discover__grid">
            <GameCard v-for="game in category.games" :key="game.id" :game="game">
              <template #actions>
                <RouterLink :to="`/game/${game.id}`" class="btn btn--secondary btn--primary-hover">
                  Ver Detalles
                </RouterLink>
                <button
                  @click="toggleFavorite(game)"
                  class="btn btn--outline"
                  :class="{ 'btn--active': isFavorite(game.id) }"
                  title="Añadir a favoritos"
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
                  Fav
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
  gap: 3rem;
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
</style>
