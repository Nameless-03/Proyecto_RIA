<script setup>
import { useGamesStore } from '../stores/games'
import { useAuthStore } from '../stores/auth'
import { useI18n } from '../composables/useI18n'

const gamesStore = useGamesStore()
const authStore = useAuthStore()
const { t } = useI18n()
</script>

<template>
  <div class="favorites-view container fade-in">
    <header class="favorites-header">
      <h1 class="favorites-header__title">{{ t('nav.favorites') }}</h1>
      <p class="favorites-header__subtitle">
        {{ t('favorites.subtitle') }}
      </p>
    </header>

    <main class="favorites-main">
      <div v-if="gamesStore.favoritesCount === 0" class="favorites-main__empty">
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
        <h2 class="favorites-main__empty-title">{{ t('favorites.empty') }}</h2>
        <p class="favorites-main__empty-desc">
          {{
            authStore.preferences.language === 'en'
              ? 'Browse the catalog and mark the games you like.'
              : authStore.preferences.language === 'pt'
                ? 'Navegue pelo catálogo e marque os jogos de seu interesse.'
                : authStore.preferences.language === 'fr'
                  ? 'Parcourez le catalogue et marquez les jeux qui vous intéressent.'
                  : authStore.preferences.language === 'de'
                    ? 'Stöbere im Katalog und markiere die Spiele, die dich interessieren.'
                    : authStore.preferences.language === 'it'
                      ? 'Sfoglia il catalogo e segna i giochi che ti interessano.'
                      : 'Navega por el catálogo y marca los juegos que te interesen.'
          }}
        </p>
        <RouterLink to="/catalog" class="btn btn--primary"> {{ t('home.exploreBtn') }} </RouterLink>
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
              <span class="game-card__price">
                ${{
                  game.price ? game.price.toFixed(2) : (((game.id % 6) + 1) * 10 - 0.01).toFixed(2)
                }}
              </span>
            </div>
            <div class="game-card__actions">
              <RouterLink :to="`/game/${game.id}`" class="btn btn--secondary">
                {{ t('catalog.detailsBtn') }}
              </RouterLink>
              <button
                @click="gamesStore.toggleFavorite(game)"
                class="btn btn--danger btn--icon-only"
                :title="t('favorites.removeBtn')"
              >
                <!-- Trash SVG Outline -->
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
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path
                    d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
                  ></path>
                  <line x1="10" y1="11" x2="10" y2="17"></line>
                  <line x1="14" y1="11" x2="14" y2="17"></line>
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
                <span>{{
                  gamesStore.isInCart(game.id) ? t('catalog.inCartBtn') : t('catalog.buyBtn')
                }}</span>
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
