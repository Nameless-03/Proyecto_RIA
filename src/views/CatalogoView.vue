<script setup>
import { ref, onMounted } from 'vue'
import { rawgService } from '../services/rawgService'
import { useGamesStore } from '../stores/games'
import { useI18n } from '../composables/useI18n'

const gamesStore = useGamesStore()
const { t } = useI18n()

const games = ref([])
const genresList = ref([])
const loading = ref(true)
const error = ref(null)

// Local component state initialized from Pinia store (which restores from sessionStorage)
const searchInput = ref(gamesStore.lastSearch)
const selectedGenre = ref(gamesStore.tempFilters.genre)
const selectedOrdering = ref(gamesStore.tempFilters.ordering)
const currentPage = ref(1)
const hasNextPage = ref(false)

const loadGenres = async () => {
  try {
    genresList.value = await rawgService.getGenres()
  } catch (err) {
    console.error('Error loading genres:', err)
  }
}

const loadGames = async () => {
  loading.value = true
  error.value = null
  try {
    // Save to store (which updates sessionStorage)
    gamesStore.setLastSearch(searchInput.value)
    gamesStore.setTempFilters({
      genre: selectedGenre.value,
      ordering: selectedOrdering.value,
    })

    const data = await rawgService.getGames({
      search: searchInput.value,
      genres: selectedGenre.value,
      ordering: selectedOrdering.value,
      page: currentPage.value,
      page_size: 6,
    })

    games.value = data.results
    hasNextPage.value = !!data.next
  } catch (err) {
    error.value = t('catalog.error')
    console.error(err)
  } finally {
    loading.value = false
  }
}

// Trigger reload on filter or search changes
const applyFilters = () => {
  currentPage.value = 1
  loadGames()
}

const nextPage = () => {
  if (hasNextPage.value) {
    currentPage.value++
    loadGames()
  }
}

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
    loadGames()
  }
}

onMounted(() => {
  loadGenres()
  loadGames()
})
</script>

<template>
  <div class="catalog-view container fade-in">
    <header class="catalog-header">
      <h1 class="catalog-header__title">{{ t('catalog.title') }}</h1>
      <p class="catalog-header__subtitle">
        {{ t('catalog.subtitle') }}
      </p>
    </header>

    <!-- Filters Bar (BEM: catalog-filters) -->
    <section class="catalog-filters">
      <div class="catalog-filters__group">
        <label class="catalog-filters__label" for="search">{{ t('catalog.searchLabel') }}</label>
        <input
          id="search"
          type="text"
          v-model="searchInput"
          @input="applyFilters"
          :placeholder="t('catalog.searchPlaceholder')"
          class="catalog-filters__input"
        />
      </div>

      <div class="catalog-filters__group">
        <label class="catalog-filters__label" for="genre">{{ t('catalog.genreLabel') }}</label>
        <select
          id="genre"
          v-model="selectedGenre"
          @change="applyFilters"
          class="catalog-filters__select"
        >
          <option value="">{{ t('catalog.allGenres') }}</option>
          <option v-for="g in genresList" :key="g.id" :value="g.slug">
            {{ g.name }}
          </option>
        </select>
      </div>

      <div class="catalog-filters__group">
        <label class="catalog-filters__label" for="order">{{ t('catalog.orderLabel') }}</label>
        <select
          id="order"
          v-model="selectedOrdering"
          @change="applyFilters"
          class="catalog-filters__select"
        >
          <option value="">{{ t('catalog.order.relevance') }}</option>
          <option value="name">{{ t('catalog.order.nameAsc') }}</option>
          <option value="-name">{{ t('catalog.order.nameDesc') }}</option>
          <option value="-released">{{ t('catalog.order.releaseNew') }}</option>
          <option value="released">{{ t('catalog.order.releaseOld') }}</option>
          <option value="-rating">{{ t('catalog.order.ratingHigh') }}</option>
          <option value="-metacritic">{{ t('catalog.order.metacriticHigh') }}</option>
        </select>
      </div>
    </section>

    <!-- Games Grid -->
    <main class="catalog-main">
      <div v-if="loading" class="catalog-main__loading">{{ t('catalog.loading') }}</div>

      <div v-else-if="error" class="catalog-main__error">
        {{ error }}
      </div>

      <div v-else-if="games.length === 0" class="catalog-main__empty">
        {{ t('catalog.empty') }}
      </div>

      <div v-else class="catalog-main__grid">
        <div v-for="game in games" :key="game.id" class="game-card">
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
                class="btn btn--outline"
                :class="{ 'btn--active': gamesStore.isFavorite(game.id) }"
                :title="t('nav.favorites')"
              >
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
                  class="heart-icon"
                  :class="{ 'heart-icon--filled': gamesStore.isFavorite(game.id) }"
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
                :title="gamesStore.isInCart(game.id) ? t('catalog.inCartBtn') : t('catalog.buyBtn')"
              >
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

      <!-- Pagination Buttons -->
      <footer v-if="!loading && !error && games.length > 0" class="catalog-pagination">
        <button
          @click="prevPage"
          class="btn btn--secondary"
          :disabled="currentPage === 1"
          :class="{ 'btn--disabled': currentPage === 1 }"
        >
          {{ t('catalog.prev') }}
        </button>
        <span class="catalog-pagination__page">{{ t('catalog.page') }} {{ currentPage }}</span>
        <button
          @click="nextPage"
          class="btn btn--secondary"
          :disabled="!hasNextPage"
          :class="{ 'btn--disabled': !hasNextPage }"
        >
          {{ t('catalog.next') }}
        </button>
      </footer>
    </main>
  </div>
</template>

<style scoped>
.catalog-view {
  padding-top: 2rem;
  padding-bottom: 4rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.catalog-header {
  border-left: 4px solid var(--color-primary);
  padding-left: 1rem;
}

.catalog-header__title {
  font-size: 2.25rem;
  font-weight: 800;
}

.catalog-header__subtitle {
  color: var(--color-text-secondary);
}

/* Filters Bar */
.catalog-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  background-color: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  padding: 1.5rem;
  border-radius: var(--border-radius-lg);
}

.catalog-filters__group {
  flex: 1;
  min-width: 220px;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.catalog-filters__label {
  font-size: 0.85rem;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--color-text-secondary);
  letter-spacing: 0.5px;
}

.catalog-filters__input,
.catalog-filters__select {
  width: 100%;
  padding: 0.6rem 1rem;
  border-radius: var(--border-radius-md);
  border: 2px solid var(--color-border);
  background-color: var(--color-bg-tertiary);
  color: var(--color-text-primary);
  transition: var(--transition-smooth);
}

.catalog-filters__input:focus,
.catalog-filters__select:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(145, 70, 255, 0.15);
}

/* Games Grid */
.catalog-main {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.catalog-main__loading,
.catalog-main__error,
.catalog-main__empty {
  text-align: center;
  padding: 4rem 2rem;
  background-color: var(--color-bg-secondary);
  border-radius: var(--border-radius-lg);
  border: 1px solid var(--color-border);
  color: var(--color-text-secondary);
}

.catalog-main__grid {
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

.game-card__actions button.btn--outline {
  flex: 0.7;
}

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

/* Pagination */
.catalog-pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 2rem;
  margin-top: 1rem;
}

.catalog-pagination__page {
  font-weight: 600;
}

@media (max-width: 768px) {
  .catalog-filters {
    flex-direction: column;
  }
}
</style>
