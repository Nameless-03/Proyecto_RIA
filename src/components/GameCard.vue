<script setup>
defineProps({
  game: {
    type: Object,
    required: true,
  },
})
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
          ${{ game.price ? game.price.toFixed(2) : (((game.id % 6) + 1) * 10 - 0.01).toFixed(2) }}
        </span>
      </div>
      <div class="game-card__actions">
        <slot name="actions"></slot>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Game Card - Metodología BEM */
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

/* Permitir que los botones del slot tengan estilos adecuados */
:deep(.btn) {
  flex: 1.5;
  font-size: 0.85rem;
  padding: 0.5rem;
}

:deep(button.btn--outline) {
  flex: 0.7;
}

:deep(.btn--danger) {
  flex: 0.5;
}
</style>
