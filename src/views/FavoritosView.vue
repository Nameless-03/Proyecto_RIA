<script setup>
import { useGamesStore } from '../stores/games'
import GameCard from '../components/GameCard.vue'
import { useFavorites } from '../composables/useFavorites'
import { useI18n } from '../composables/useI18n'

const gamesStore = useGamesStore()
const { favorites, favoritesCount, toggleFavorite } = useFavorites()
const { t } = useI18n()
</script>

<template>
  <div class="favorites-view container fade-in">
    <header class="favorites-header">
      <h1 class="favorites-header__title">{{ t('Mis Favoritos') }}</h1>
      <p class="favorites-header__subtitle">
        {{ t('Gestiona y accede rápidamente a tus juegos guardados de forma dinámica.') }}
      </p>
    </header>

    <main class="favorites-main">
      <div v-if="favoritesCount === 0" class="favorites-main__empty">
        <span class="favorites-main__empty-icon">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--color-primary)"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path
              d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
            ></path>
          </svg>
        </span>
        <h2 class="favorites-main__empty-title">{{ t('Aún no tienes favoritos') }}</h2>
        <p class="favorites-main__empty-desc">
          {{ t('Navega por el catálogo y marca los juegos que te interesen.') }}
        </p>
        <RouterLink to="/catalog" class="btn btn--primary">
          {{ t('Explorar Catálogo') }}
        </RouterLink>
      </div>

      <TransitionGroup name="list" tag="div" v-else class="favorites-main__grid">
        <GameCard v-for="game in favorites" :key="game.id" :game="game">
          <template #actions>
            <RouterLink :to="`/game/${game.id}`" class="btn btn--secondary">
              {{ t('Ver Detalles') }}
            </RouterLink>
            <button
              @click="toggleFavorite(game)"
              class="btn btn--outline btn--active"
              :title="t('Eliminar de favoritos')"
            >
              <!-- Heart SVG Filled -->
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="heart-icon heart-icon--filled"
              >
                <path
                  d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                ></path>
              </svg>
            </button>
            <button
              @click="gamesStore.addToCart(game)"
              class="btn btn--primary"
              :class="{ 'btn--disabled': gamesStore.isInCart(game.id) }"
            >
              <!-- Cart SVG Outline -->
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
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
              <span>{{ gamesStore.isInCart(game.id) ? t('En Carrito') : t('Comprar') }}</span>
            </button>
          </template>
        </GameCard>
      </TransitionGroup>
    </main>
  </div>
</template>

<style scoped>
.favorites-view {
  padding-top: 2rem;
  padding-bottom: 4rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.favorites-header {
  border-left: 4px solid var(--color-primary);
  padding-left: 1rem;
}

.favorites-header__title {
  font-size: 2.25rem;
  font-weight: 800;
}

.favorites-header__subtitle {
  color: var(--color-text-secondary);
}

.favorites-main__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 5rem 2rem;
  background-color: var(--color-bg-secondary);
  border-radius: var(--border-radius-lg);
  border: 1px solid var(--color-border);
  text-align: center;
}

.favorites-main__empty-icon {
  font-size: 4rem;
}

.favorites-main__empty-title {
  font-size: 1.75rem;
  font-weight: 700;
}

.favorites-main__empty-desc {
  color: var(--color-text-secondary);
  max-width: 400px;
  margin-bottom: 1rem;
}

.favorites-main__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 2rem;
}

/* Estilos de botones de favoritos activos */
.btn--active {
  background-color: var(--color-accent-purple-light);
  border-color: var(--color-primary);
  color: var(--color-primary);
}

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

/* Efecto hover interactivo premium para el botón de favoritos en la vista de Favoritos */
.favorites-main__grid :deep(button.btn--outline.btn--active):hover {
  background-color: rgba(255, 56, 96, 0.12) !important;
  border-color: var(--color-danger) !important;
  color: var(--color-danger) !important;
}

.favorites-main__grid :deep(button.btn--outline.btn--active):hover .heart-icon {
  fill: var(--color-danger) !important;
  stroke: var(--color-danger) !important;
}

/*
  ==========================================
  Requerimiento extra de Animaciones Complejas con (TransitionGroup)
  ==========================================
*/

.list-enter-active,
.list-leave-active,
.list-move {
  transition: all 0.5s cubic-bezier(0.55, 0, 0.1, 1);
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: scale(0.85) translateY(30px);
}

.list-leave-active {
  position: absolute;
}
</style>
