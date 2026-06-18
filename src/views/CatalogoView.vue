<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { rawgService } from '../services/rawgService'
import { useGamesStore } from '../stores/games'
import GameCard from '../components/GameCard.vue'
import { useFavorites } from '../composables/useFavorites'
import { useFilters } from '../composables/useFilters'
import { useI18n } from '../composables/useI18n'
import { useAuthStore } from '../stores/auth'

const gamesStore = useGamesStore()
const authStore = useAuthStore()
const { isFavorite, toggleFavorite } = useFavorites()
const { searchInput, selectedGenre, selectedOrdering } = useFilters()
const { t } = useI18n()

const games = ref([])
const genresList = ref([])
const loading = ref(true)
const loadingMore = ref(false)
const error = ref(null)

const currentPage = ref(gamesStore.tempFilters.page || 1)
const pageSize = ref(gamesStore.tempFilters.pageSize || 6)
const hasNextPage = ref(false)
const totalGamesCount = ref(0)
const sentinel = ref(null)
let observer = null
const totalPages = computed(() => Math.ceil(totalGamesCount.value / pageSize.value))

// Cargar géneros de videojuegos
const loadGenres = async () => {
  try {
    genresList.value = await rawgService.getGenres()
  } catch (err) {
    console.error('Error loading genres:', err)
  }
}

// Cargar videojuegos del catálogo
const loadGames = async () => {
  if (games.value.length === 0) {
    loading.value = true
  } else {
    loadingMore.value = true
  }
  error.value = null
  try {
    // Restaurar páginas acumuladas secuencialmente si volvemos atrás
    if (currentPage.value > 1 && games.value.length === 0) {
      const targetPage = currentPage.value
      const allResults = []
      for (let p = 1; p <= targetPage; p++) {
        const data = await rawgService.getGames({
          search: searchInput.value,
          genres: selectedGenre.value,
          ordering: selectedOrdering.value,
          page: p,
          page_size: pageSize.value,
        })
        allResults.push(...data.results)
        hasNextPage.value = !!data.next
        totalGamesCount.value = data.count || 0
      }
      games.value = allResults
    } else {
      // Sincronizar página actual con el store de Pinia
      gamesStore.setTempFilters({
        genre: selectedGenre.value,
        ordering: selectedOrdering.value,
        page: currentPage.value,
        pageSize: pageSize.value,
      })

      const data = await rawgService.getGames({
        search: searchInput.value,
        genres: selectedGenre.value,
        ordering: selectedOrdering.value,
        page: currentPage.value,
        page_size: pageSize.value,
      })

      if (currentPage.value === 1) {
        games.value = data.results
      } else {
        games.value = [...games.value, ...data.results]
      }
      hasNextPage.value = !!data.next
      totalGamesCount.value = data.count || 0
    }
  } catch (err) {
    error.value = t('Error al cargar los videojuegos del catálogo.')
    console.error(err)
  } finally {
    loading.value = false
    loadingMore.value = false
  }
}

// Guardar posición de scroll al desplazarse
const guardarPosicionScroll = () => {
  sessionStorage.setItem('catalog_scroll_pos', String(window.scrollY))
}

// Aplicar filtros de búsqueda
const applyFilters = () => {
  currentPage.value = 1
  games.value = []
  sessionStorage.setItem('catalog_scroll_pos', '0')
  if (authStore.isLoggedIn && selectedGenre.value) {
    authStore.updatePreferences({
      preferredGenre: selectedGenre.value,
    })
  }
  loadGames()
}

const changePageSize = () => {
  currentPage.value = 1
  games.value = []
  sessionStorage.setItem('catalog_scroll_pos', '0')
  loadGames()
}

// Iniciar observador de scroll infinito
const iniciarObserver = () => {
  observer = new IntersectionObserver((entries) => {
    const entry = entries[0]
    if (entry.isIntersecting && hasNextPage.value && !loading.value && !loadingMore.value) {
      currentPage.value++
      loadGames()
    }
  }, {
    rootMargin: '150px'
  })

  if (sentinel.value) {
    observer.observe(sentinel.value)
  }
}

// Desmontar observador de scroll
const desmontarObserver = () => {
  if (observer && sentinel.value) {
    observer.unobserve(sentinel.value)
  }
}

onMounted(() => {
  loadGenres()
  loadGames().then(() => {
    iniciarObserver()
    
    // Restaurar posición de scroll
    const scrollGuardado = sessionStorage.getItem('catalog_scroll_pos')
    if (scrollGuardado) {
      setTimeout(() => {
        window.scrollTo(0, parseInt(scrollGuardado, 10))
      }, 100)
    }
    
    // Escuchar evento de scroll
    window.addEventListener('scroll', guardarPosicionScroll)
  })
})

onUnmounted(() => {
  desmontarObserver()
  window.removeEventListener('scroll', guardarPosicionScroll)
})
</script>

<template>
  <div class="catalog-view container fade-in">
    <header class="catalog-header">
      <h1 class="catalog-header__title">{{ t('Catálogo de Juegos') }}</h1>
      <p class="catalog-header__subtitle">
        {{ t('Explora miles de títulos de todas las categorías y plataformas.') }}
      </p>
    </header>

    <!-- Filters Bar (BEM: catalog-filters) -->
    <section class="catalog-filters">
      <div class="catalog-filters__group">
        <label class="catalog-filters__label" for="search">{{ t('Búsqueda') }}</label>
        <input
          id="search"
          type="text"
          v-model="searchInput"
          @input="applyFilters"
          :placeholder="t('Escribe para buscar...')"
          class="catalog-filters__input"
        />
      </div>

      <div class="catalog-filters__group">
        <label class="catalog-filters__label" for="genre">{{ t('Género') }}</label>
        <select
          id="genre"
          v-model="selectedGenre"
          @change="applyFilters"
          class="catalog-filters__select"
        >
          <option value="">{{ t('Todos los Géneros') }}</option>
          <option v-for="g in genresList" :key="g.id" :value="g.slug">
            {{ g.name }}
          </option>
        </select>
      </div>

      <div class="catalog-filters__group">
        <label class="catalog-filters__label" for="order">{{ t('Ordenar por') }}</label>
        <select
          id="order"
          v-model="selectedOrdering"
          @change="applyFilters"
          class="catalog-filters__select"
        >
          <option value="">{{ t('Relevancia') }}</option>
          <option value="name">{{ t('Nombre (A-Z)') }}</option>
          <option value="-name">{{ t('Nombre (Z-A)') }}</option>
          <option value="-released">{{ t('Fecha (Más nuevo)') }}</option>
          <option value="released">{{ t('Fecha (Más antiguo)') }}</option>
          <option value="-rating">{{ t('Valoración (Más alta)') }}</option>
          <option value="-metacritic">{{ t('Metacritic (Más alto)') }}</option>
        </select>
      </div>

      <div class="catalog-filters__group">
        <label class="catalog-filters__label" for="pageSize">{{ t('Mostrar') }}</label>
        <select
          id="pageSize"
          v-model="pageSize"
          @change="changePageSize"
          class="catalog-filters__select"
        >
          <option :value="6">6 {{ t('juegos') }}</option>
          <option :value="9">9 {{ t('juegos') }}</option>
          <option :value="12">12 {{ t('juegos') }}</option>
          <option :value="24">24 {{ t('juegos') }}</option>
        </select>
      </div>
    </section>

    <!-- Games Grid -->
    <main class="catalog-main">
      <div v-if="loading" class="catalog-main__loading">{{ t('Cargando juegos...') }}</div>

      <div v-else-if="error" class="catalog-main__error">
        {{ error }}
      </div>

      <div v-else-if="games.length === 0" class="catalog-main__empty">
        {{ t('No se encontraron juegos.') }}
      </div>

      <div v-else class="catalog-main__grid">
        <GameCard v-for="game in games" :key="game.id" :game="game">
          <template #actions>
            <RouterLink :to="`/game/${game.id}`" class="btn btn--secondary">
              {{ t('Ver Detalles') }}
            </RouterLink>
            <button
              @click="toggleFavorite(game)"
              class="btn btn--outline"
              :class="{ 'btn--active': isFavorite(game.id) }"
              :title="t('Añadir a favoritos')"
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
                :class="{ 'heart-icon--filled': isFavorite(game.id) }"
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
              :title="gamesStore.isInCart(game.id) ? t('En Carrito') : t('Agregar al carrito')"
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
              <span>{{ gamesStore.isInCart(game.id) ? t('En Carrito') : t('Comprar') }}</span>
            </button>
          </template>
        </GameCard>
      </div>

      <!-- Centinela para scroll infinito -->
      <div ref="sentinel" class="catalog-sentinel">
        <div v-if="loadingMore" class="catalog-main__loading-more">
          {{ t('Cargando más juegos...') }}
        </div>
      </div>
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

/* Scroll Infinito */
.catalog-sentinel {
  min-height: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem;
  margin-top: 1rem;
}

.catalog-main__loading-more {
  color: var(--color-text-secondary);
  font-weight: 600;
  text-align: center;
}

@media (max-width: 768px) {
  .catalog-filters {
    flex-direction: column;
  }
}
</style>
