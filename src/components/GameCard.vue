<script setup>
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()

defineProps({
  game: {
    type: Object,
    required: true,
  },
})

const getBasePrice = (game) => {
  return game.price || ((game.id % 6) + 1) * 10 - 0.01
}
</script>

<template>
  <div class="game-card">
    <div class="game-card__image-container">
      <img :src="game.background_image" :alt="game.name" class="game-card__image" loading="lazy" />
      <span v-if="game.metacritic" class="game-card__metacritic">
        {{ game.metacritic }}
      </span>
    </div>
    <div class="game-card__content">
      <h3 class="game-card__title" :title="game.name">{{ game.name }}</h3>
      <div class="game-card__meta">
        <span class="game-card__genre" :title="game.genres?.map((g) => g.name).join(', ')">
          {{
            game.genres
              ?.slice(0, 2)
              .map((g) => g.name)
              .join(', ') || 'Videojuego'
          }}
        </span>
        <span class="game-card__price">
          {{ authStore.formatPrice(getBasePrice(game)) }}
        </span>
      </div>
      <div class="game-card__actions">
        <slot name="actions"></slot>
      </div>
    </div>
  </div>
</template>
