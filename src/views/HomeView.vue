<script setup>
import { ref, onMounted } from 'vue'
import { rawgService } from '../services/rawgService'
import { useGamesStore } from '../stores/games'

const gamesStore = useGamesStore()
const featuredGames = ref([])
const loading = ref(true)
const error = ref(null)

onMounted(async () => {
  try {
    const data = await rawgService.getGames({ page_size: 3 })
    featuredGames.value = data.results
  } catch (err) {
    error.value = 'Error al cargar los videojuegos destacados.'
    console.error(err)
  } finally {
    loading.value = false
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
        <div v-for="game in featuredGames" :key="game.id" class="game-card">
          <div class="game-card__image-container">
            <img :src="game.background_image" :alt="game.name" class="game-card__image" />
            <span v-if="game.metacritic" class="game-card__metacritic">
              {{ game.metacritic }}
            </span>
          </div>
          <div class="game-card__content">
            <h3 class="game-card__title">{{ game.name }}</h3>
            <div class="game-card__meta">
              <span class="game-card__genre">
                {{ game.genres?.[0]?.name || 'Videojuego' }}
              </span>
              <span class="game-card__price">
                ${{
                  game.price ? game.price.toFixed(2) : (((game.id % 6) + 1) * 10 - 0.01).toFixed(2)
                }}
              </span>
            </div>
            <div class="game-card__actions">
              <RouterLink :to="`/game/${game.id}`" class="btn btn--secondary btn--primary-hover">
                Ver Detalles
              </RouterLink>
              <button
                @click="gamesStore.toggleFavorite(game)"
                class="btn btn--outline"
                :class="{ 'btn--active': gamesStore.isFavorite(game.id) }"
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
                  :class="{ 'heart-icon--filled': gamesStore.isFavorite(game.id) }"
                >
                  <path
                    d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                  ></path>
                </svg>
                Fav
              </button>
            </div>
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

/* Game Card (BEM) */
.game-card {
  background-color: var(--color-bg-secondary);
  border-radius: var(--border-radius-lg);
  border: 1px solid var(--color-border);
  overflow: hidden;
  transition: var(--transition-smooth);
  display: flex;
  flex-direction: column;
}

.game-card:hover {
  transform: translateY(-5px);
  border-color: var(--color-primary);
  box-shadow: var(--shadow-md);
}

.game-card__image-container {
  position: relative;
  height: 180px;
  overflow: hidden;
}

.game-card__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: var(--transition-smooth);
}

.game-card:hover .game-card__image {
  transform: scale(1.05);
}

.game-card__metacritic {
  position: absolute;
  top: 12px;
  right: 12px;
  background-color: rgba(0, 0, 0, 0.85);
  color: var(--color-accent-green);
  border: 1px solid var(--color-accent-green);
  font-size: 0.85rem;
  font-weight: 700;
  padding: 0.2rem 0.5rem;
  border-radius: var(--border-radius-sm);
}

.game-card__content {
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  flex-grow: 1;
}

.game-card__title {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.game-card__meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.game-card__genre {
  font-size: 0.85rem;
  color: var(--color-text-secondary);
  background-color: var(--color-bg-tertiary);
  padding: 0.2rem 0.6rem;
  border-radius: var(--border-radius-sm);
}

.game-card__price {
  font-weight: 700;
  color: #ffffff;
}

body.theme-light .game-card__price {
  color: var(--color-text-primary);
}

.game-card__actions {
  display: flex;
  gap: 0.5rem;
  margin-top: auto;
}

.game-card__actions .btn {
  flex: 1;
  font-size: 0.9rem;
  padding: 0.5rem;
}

.btn--active {
  background-color: var(--color-accent-purple-light);
  border-color: var(--color-primary);
  color: var(--color-primary);
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
