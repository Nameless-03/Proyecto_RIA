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
