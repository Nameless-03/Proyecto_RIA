<script setup>
import { useGamesStore } from '../stores/games'

const gamesStore = useGamesStore()
</script>

<template>
  <div class="favorites-view container fade-in">
    <header class="favorites-header">
      <h1 class="favorites-header__title">Mis Favoritos</h1>
      <p class="favorites-header__subtitle">
        Tus videojuegos preferidos guardados para acceder rápidamente.
      </p>
    </header>

    <main class="favorites-main">
      <div v-if="gamesStore.favoritesCount === 0" class="favorites-main__empty">
        <span class="favorites-main__empty-icon">❤️</span>
        <h2 class="favorites-main__empty-title">Aún no tienes favoritos</h2>
        <p class="favorites-main__empty-desc">
          Navega por el catálogo y marca los juegos que te interesen.
        </p>
        <RouterLink to="/catalog" class="btn btn--primary"> Ver Catálogo </RouterLink>
      </div>

      <div v-else class="favorites-main__grid">
        <div v-for="game in gamesStore.favorites" :key="game.id" class="game-card">
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
              <span class="game-card__price"> ${{ ((game.id % 6) + 1) * 10 - 0.01 }} </span>
            </div>
            <div class="game-card__actions">
              <RouterLink :to="`/game/${game.id}`" class="btn btn--secondary">
                Ver Detalles
              </RouterLink>
              <button
                @click="gamesStore.toggleFavorite(game)"
                class="btn btn--danger btn--icon-only"
                title="Eliminar de favoritos"
              >
                🗑️
              </button>
              <button
                @click="gamesStore.addToCart(game)"
                class="btn btn--primary"
                :class="{ 'btn--disabled': gamesStore.isInCart(game.id) }"
              >
                {{ gamesStore.isInCart(game.id) ? 'En Carrito' : 'Comprar' }}
              </button>
            </div>
          </div>
        </div>
      </div>
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

/* Game Card */
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
  flex: 1.5;
  font-size: 0.85rem;
  padding: 0.5rem;
}

.game-card__actions .btn--danger {
  flex: 0.5;
}
</style>
