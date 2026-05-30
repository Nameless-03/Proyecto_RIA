<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { rawgService } from '../services/rawgService'
import { useGamesStore } from '../stores/games'

const route = useRoute()
const router = useRouter()
const gamesStore = useGamesStore()

const game = ref(null)
const loading = ref(true)
const error = ref(null)

onMounted(async () => {
  try {
    const gameId = route.params.id
    game.value = await rawgService.getGameDetail(gameId)
  } catch (err) {
    error.value = 'No se pudo cargar la información del videojuego.'
    console.error(err)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="game-detail container fade-in">
    <!-- Back Button -->
    <button @click="router.back()" class="btn btn--secondary game-detail__back-btn">
      ← Volver atrás
    </button>

    <div v-if="loading" class="game-detail__loading">Cargando detalles del juego...</div>

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
            <span class="game-detail__tag" v-for="g in game.genres" :key="g.id">{{ g.name }}</span>
          </div>
          <h1 class="game-detail__title">{{ game.name }}</h1>
          <p class="game-detail__release">Publicado: {{ game.released || 'No especificado' }}</p>
        </div>
      </header>

      <!-- Main Info grid -->
      <div class="game-detail__grid">
        <!-- Details Column -->
        <main class="game-detail__main">
          <section class="game-detail__section">
            <h2 class="game-detail__section-title">Sobre el Juego</h2>
            <div
              class="game-detail__description"
              v-html="game.description || game.description_raw || 'No hay descripción disponible.'"
            ></div>
          </section>

          <!-- Screenshots Carousel / Grid -->
          <section
            v-if="game.short_screenshots && game.short_screenshots.length > 0"
            class="game-detail__section"
          >
            <h2 class="game-detail__section-title">Capturas de Pantalla</h2>
            <div class="game-detail__screenshots">
              <img
                v-for="ss in game.short_screenshots.filter((s) => s.id !== -1)"
                :key="ss.id"
                :src="ss.image"
                :alt="`Screenshot of ${game.name}`"
                class="game-detail__screenshot-img"
              />
            </div>
          </section>
        </main>

        <!-- Sidebar / Purchase Block -->
        <aside class="game-detail__sidebar">
          <div class="purchase-box">
            <div class="purchase-box__price-row">
              <span class="purchase-box__label">Precio Estimado</span>
              <span class="purchase-box__price">${{ ((game.id % 6) + 1) * 10 - 0.01 }}</span>
            </div>

            <div class="purchase-box__actions">
              <button
                @click="gamesStore.addToCart(game)"
                class="btn btn--primary purchase-box__btn"
                :class="{ 'btn--disabled': gamesStore.isInCart(game.id) }"
              >
                {{ gamesStore.isInCart(game.id) ? '🛒 En el Carrito' : '🛒 Agregar al Carrito' }}
              </button>

              <button
                @click="gamesStore.toggleFavorite(game)"
                class="btn btn--secondary purchase-box__btn"
                :class="{ 'btn--active': gamesStore.isFavorite(game.id) }"
              >
                {{ gamesStore.isFavorite(game.id) ? '❤️ En Favoritos' : '🤍 Añadir a Favoritos' }}
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
              <span>⭐ {{ game.rating }} / 5 ({{ game.ratings_count }} votos)</span>
            </div>

            <div v-if="game.playtime" class="specs-box__row">
              <span class="specs-box__label">Tiempo de juego:</span>
              <span>{{ game.playtime }} horas</span>
            </div>

            <div v-if="game.platforms" class="specs-box__row specs-box__row--vertical">
              <span class="specs-box__label">Plataformas:</span>
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
              <span class="specs-box__label">Desarrollador:</span>
              <span>{{ game.developers.map((d) => d.name).join(', ') }}</span>
            </div>

            <div v-if="game.publishers && game.publishers.length > 0" class="specs-box__row">
              <span class="specs-box__label">Distribuidor:</span>
              <span>{{ game.publishers.map((p) => p.name).join(', ') }}</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  </div>
</template>

<style scoped>
.game-detail {
  padding-top: 2rem;
  padding-bottom: 4rem;
}

.game-detail__back-btn {
  margin-bottom: 1.5rem;
}

.game-detail__loading,
.game-detail__error {
  text-align: center;
  padding: 4rem;
  background-color: var(--color-bg-secondary);
  border-radius: var(--border-radius-lg);
  border: 1px solid var(--color-border);
  color: var(--color-text-secondary);
}

.game-detail__layout {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* Hero Header */
.game-detail__hero {
  height: 350px;
  background-position: center;
  background-size: cover;
  border-radius: var(--border-radius-lg);
  overflow: hidden;
  display: flex;
  align-items: flex-end;
  padding: 2.5rem;
  border: 1px solid var(--color-border);
}

.game-detail__hero-content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.game-detail__headline {
  display: flex;
  gap: 0.5rem;
}

.game-detail__tag {
  background-color: var(--color-primary);
  color: #ffffff;
  font-size: 0.8rem;
  font-weight: 700;
  padding: 0.25rem 0.75rem;
  border-radius: 50px;
}

.game-detail__title {
  font-size: 2.75rem;
  font-weight: 800;
  color: #ffffff;
  line-height: 1.1;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
}

.game-detail__release {
  font-size: 0.95rem;
  color: var(--color-text-secondary);
}

/* Main Grid */
.game-detail__grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
}

.game-detail__main {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.game-detail__section {
  background-color: var(--color-bg-secondary);
  border-radius: var(--border-radius-lg);
  border: 1px solid var(--color-border);
  padding: 2rem;
}

.game-detail__section-title {
  font-size: 1.5rem;
  font-weight: 700;
  border-left: 4px solid var(--color-primary);
  padding-left: 0.75rem;
  margin-bottom: 1.5rem;
}

.game-detail__description {
  line-height: 1.8;
  color: var(--color-text-secondary);
}

.game-detail__description :deep(p) {
  margin-bottom: 1rem;
}

.game-detail__screenshots {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
}

.game-detail__screenshot-img {
  width: 100%;
  height: 120px;
  object-fit: cover;
  border-radius: var(--border-radius-md);
  border: 1px solid var(--color-border);
  transition: var(--transition-smooth);
}

.game-detail__screenshot-img:hover {
  transform: scale(1.05);
  border-color: var(--color-primary);
}

/* Sidebar and Boxes */
.game-detail__sidebar {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.purchase-box,
.specs-box {
  background-color: var(--color-bg-secondary);
  border-radius: var(--border-radius-lg);
  border: 1px solid var(--color-border);
  padding: 1.5rem;
}

.purchase-box {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.purchase-box__price-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.purchase-box__label {
  color: var(--color-text-secondary);
  font-weight: 500;
}

.purchase-box__price {
  font-size: 2rem;
  font-weight: 800;
  color: #ffffff;
}

body.theme-light .purchase-box__price {
  color: var(--color-text-primary);
}

.purchase-box__actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.purchase-box__btn {
  width: 100%;
  padding: 0.8rem;
}

.btn--active {
  background-color: var(--color-accent-purple-light);
  border-color: var(--color-primary);
  color: var(--color-primary);
}

/* Specs Box */
.specs-box {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.specs-box__row {
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid var(--color-border);
  padding-bottom: 0.75rem;
  font-size: 0.95rem;
}

.specs-box__row:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.specs-box__row--vertical {
  flex-direction: column;
  gap: 0.5rem;
}

.specs-box__label {
  font-weight: 700;
  color: var(--color-text-secondary);
}

.specs-box__score {
  font-weight: 800;
  padding: 0.1rem 0.4rem;
  border-radius: var(--border-radius-sm);
}

.specs-box__score--high {
  background-color: rgba(0, 245, 212, 0.1);
  color: var(--color-accent-green);
  border: 1px solid var(--color-accent-green);
}

.specs-box__score--medium {
  background-color: rgba(255, 193, 7, 0.1);
  color: #ffc107;
  border: 1px solid #ffc107;
}

.specs-box__score--low {
  background-color: rgba(255, 56, 96, 0.1);
  color: var(--color-danger);
  border: 1px solid var(--color-danger);
}

.specs-box__platforms {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.specs-box__platform-tag {
  background-color: var(--color-bg-tertiary);
  font-size: 0.8rem;
  padding: 0.15rem 0.5rem;
  border-radius: var(--border-radius-sm);
}

@media (max-width: 992px) {
  .game-detail__grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .game-detail__hero {
    height: 250px;
    padding: 1.5rem;
  }

  .game-detail__title {
    font-size: 2rem;
  }
}
</style>
