<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useGamesStore } from '../stores/games'
import { useI18n } from '../composables/useI18n'

const authStore = useAuthStore()
const gamesStore = useGamesStore()
const { t } = useI18n()

const isMobileMenuOpen = ref(false)
const isCartOpen = ref(false)

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

const toggleCart = () => {
  isCartOpen.value = !isCartOpen.value
}

const toggleTheme = () => {
  const nextTheme = authStore.theme === 'dark' ? 'light' : 'dark'
  authStore.setTheme(nextTheme)
}

const checkout = () => {
  alert(`¡Compra simulada con éxito! Total pagado: ${authStore.formatPrice(gamesStore.cartTotal)}`)
  gamesStore.clearCart()
  isCartOpen.value = false
}
</script>

<template>
  <nav class="navbar">
    <div class="navbar__container container">
      <!-- Logo -->
      <RouterLink to="/" class="navbar__brand">
        <!-- Isometric Box SVG Outline -->
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="navbar__logo-svg"
        >
          <path
            d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"
          ></path>
          <polyline points="3.29 7 12 12 20.71 7"></polyline>
          <line x1="12" y1="22" x2="12" y2="12"></line>
        </svg>
        <span class="navbar__logo-text">
          LITTLEBOX<span class="navbar__logo-text--highlight">GAMES</span>
        </span>
      </RouterLink>

      <!-- Hamburger Menu (Mobile) -->
      <button
        @click="toggleMobileMenu"
        class="navbar__toggle"
        :class="{ 'navbar__toggle--open': isMobileMenuOpen }"
        aria-label="Abrir menú"
      >
        <span class="navbar__toggle-bar"></span>
        <span class="navbar__toggle-bar"></span>
        <span class="navbar__toggle-bar"></span>
      </button>

      <!-- Nav Links -->
      <ul class="navbar__menu" :class="{ 'navbar__menu--open': isMobileMenuOpen }">
        <li class="navbar__item">
          <RouterLink
            to="/"
            class="navbar__link"
            active-class="navbar__link--active"
            @click="isMobileMenuOpen = false"
          >
            {{ t('Inicio') }}
          </RouterLink>
        </li>
        <li class="navbar__item">
          <RouterLink
            to="/catalog"
            class="navbar__link"
            active-class="navbar__link--active"
            @click="isMobileMenuOpen = false"
          >
            {{ t('Catálogo') }}
          </RouterLink>
        </li>
        <li class="navbar__item">
          <RouterLink
            to="/favorites"
            class="navbar__link"
            active-class="navbar__link--active"
            @click="isMobileMenuOpen = false"
          >
            {{ t('Favoritos') }}
            <span v-if="gamesStore.favoritesCount > 0" class="navbar__badge navbar__badge--purple">
              {{ gamesStore.favoritesCount }}
            </span>
          </RouterLink>
        </li>
        <li class="navbar__item">
          <RouterLink
            to="/profile"
            class="navbar__link"
            active-class="navbar__link--active"
            @click="isMobileMenuOpen = false"
          >
            {{ t('Perfil') }} ({{ authStore.getUsername }})
          </RouterLink>
        </li>
      </ul>

      <!-- Actions (Cart & Theme) -->
      <div class="navbar__actions">
        <!-- Theme Toggle (Animated SVG) -->
        <button
          @click="toggleTheme"
          class="navbar__action-btn theme-toggle-btn"
          title="Cambiar Tema"
        >
          <!-- Sun Icon SVG Outline -->
          <svg
            v-if="authStore.theme === 'dark'"
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="theme-icon-svg"
          >
            <circle cx="12" cy="12" r="5"></circle>
            <line x1="12" y1="1" x2="12" y2="3"></line>
            <line x1="12" y1="21" x2="12" y2="23"></line>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
            <line x1="1" y1="12" x2="3" y2="12"></line>
            <line x1="21" y1="12" x2="23" y2="12"></line>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
          </svg>
          <!-- Moon Icon SVG Outline -->
          <svg
            v-else
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="theme-icon-svg"
          >
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
          </svg>
        </button>

        <!-- Shopping Cart -->
        <div class="navbar__cart-container">
          <button
            @click="toggleCart"
            class="navbar__action-btn navbar__cart-btn"
            title="Ver Carrito"
          >
            <!-- Shopping Cart SVG Outline -->
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="navbar__cart-svg"
            >
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            <span v-if="gamesStore.cartCount > 0" class="navbar__badge navbar__badge--green">
              {{ gamesStore.cartCount }}
            </span>
          </button>

          <!-- Cart Dropdown -->
          <div v-if="isCartOpen" class="cart-dropdown fade-in">
            <h4 class="cart-dropdown__title">{{ t('Carrito de Compras') }}</h4>

            <div v-if="gamesStore.cartCount === 0" class="cart-dropdown__empty">
              {{ t('El carrito está vacío.') }}
            </div>

            <div v-else class="cart-dropdown__content">
              <ul class="cart-dropdown__list">
                <li v-for="item in gamesStore.cart" :key="item.id" class="cart-item">
                  <img
                    :src="item.background_image"
                    :alt="item.name"
                    class="cart-item__img"
                    loading="lazy"
                  />
                  <div class="cart-item__details">
                    <span class="cart-item__name">{{ item.name }}</span>
                    <span class="cart-item__price">{{ authStore.formatPrice(item.price) }}</span>
                  </div>
                  <button
                    @click="gamesStore.removeFromCart(item.id)"
                    class="cart-item__remove-btn"
                    :title="t('Eliminar')"
                  >
                    <!-- Close SVG Outline -->
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </li>
              </ul>

              <div class="cart-dropdown__total">
                <span>{{ t('Total') }}:</span>
                <span class="cart-dropdown__total-price">
                  {{ authStore.formatPrice(gamesStore.cartTotal) }}
                </span>
              </div>

              <div class="cart-dropdown__actions">
                <button @click="gamesStore.clearCart()" class="btn btn--secondary btn--small">
                  {{ t('Vaciar') }}
                </button>
                <button @click="checkout" class="btn btn--primary btn--small">
                  {{ t('Pagar') }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>
