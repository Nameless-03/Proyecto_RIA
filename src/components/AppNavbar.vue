<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useGamesStore } from '../stores/games'

const authStore = useAuthStore()
const gamesStore = useGamesStore()

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
  alert(`¡Compra simulada con éxito! Total pagado: $${gamesStore.cartTotal.toFixed(2)}`)
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
            Inicio
          </RouterLink>
        </li>
        <li class="navbar__item">
          <RouterLink
            to="/catalog"
            class="navbar__link"
            active-class="navbar__link--active"
            @click="isMobileMenuOpen = false"
          >
            Catálogo
          </RouterLink>
        </li>
        <li class="navbar__item">
          <RouterLink
            to="/favorites"
            class="navbar__link"
            active-class="navbar__link--active"
            @click="isMobileMenuOpen = false"
          >
            Favoritos
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
            Perfil ({{ authStore.getUsername }})
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
            <h4 class="cart-dropdown__title">Carrito de Compras</h4>

            <div v-if="gamesStore.cartCount === 0" class="cart-dropdown__empty">
              El carrito está vacío.
            </div>

            <div v-else class="cart-dropdown__content">
              <ul class="cart-dropdown__list">
                <li v-for="item in gamesStore.cart" :key="item.id" class="cart-item">
                  <img :src="item.background_image" :alt="item.name" class="cart-item__img" />
                  <div class="cart-item__details">
                    <span class="cart-item__name">{{ item.name }}</span>
                    <span class="cart-item__price">${{ item.price.toFixed(2) }}</span>
                  </div>
                  <button
                    @click="gamesStore.removeFromCart(item.id)"
                    class="cart-item__remove-btn"
                    title="Eliminar"
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
                <span>Total:</span>
                <span class="cart-dropdown__total-price"
                  >${{ gamesStore.cartTotal.toFixed(2) }}</span
                >
              </div>

              <div class="cart-dropdown__actions">
                <button @click="gamesStore.clearCart()" class="btn btn--secondary btn--small">
                  Vaciar
                </button>
                <button @click="checkout" class="btn btn--primary btn--small">Pagar</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.navbar {
  background-color: var(--color-bg-secondary);
  border-bottom: 1px solid var(--color-border);
  position: sticky;
  top: 0;
  z-index: 100;
  height: 70px;
  display: flex;
  align-items: center;
  transition: var(--transition-smooth);
}

.navbar__container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.navbar__brand {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  font-size: 1.3rem;
  font-weight: 800;
  letter-spacing: -0.5px;
  color: #ffffff;
}

body.theme-light .navbar__brand {
  color: var(--color-text-primary);
}

.navbar__logo-svg {
  stroke: var(--color-primary);
  transition: transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1);
}

.navbar__brand:hover .navbar__logo-svg {
  transform: rotate(360deg);
}

.navbar__logo-text--highlight {
  color: var(--color-primary);
}

.navbar__menu {
  display: flex;
  gap: 1.5rem;
}

.navbar__item {
  display: flex;
  align-items: center;
}

.navbar__link {
  font-weight: 600;
  color: var(--color-text-secondary);
  position: relative;
  padding: 0.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.navbar__link:hover {
  color: var(--color-text-primary);
}

.navbar__link--active {
  color: var(--color-primary);
}

.navbar__link--active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: var(--color-primary);
}

.navbar__badge {
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.1rem 0.4rem;
  border-radius: 50px;
  color: #ffffff;
}

.navbar__badge--purple {
  background-color: var(--color-primary);
}

.navbar__badge--green {
  background-color: var(--color-accent-green);
}

/* Actions */
.navbar__actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.navbar__action-btn {
  padding: 0.5rem;
  border-radius: var(--border-radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: var(--transition-smooth);
}

.navbar__action-btn:hover {
  background-color: var(--color-bg-tertiary);
}

/* Theme Switch Animations */
.theme-icon-svg {
  transition: transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
  stroke: var(--color-text-primary);
}

.theme-toggle-btn:hover .theme-icon-svg {
  transform: rotate(45deg) scale(1.15);
  stroke: var(--color-primary);
}

.navbar__cart-svg {
  stroke: var(--color-text-primary);
  transition: transform 0.3s ease;
}

.navbar__cart-btn:hover .navbar__cart-svg {
  transform: scale(1.1) translateY(-2px);
  stroke: var(--color-primary);
}

.navbar__cart-container {
  position: relative;
}

.navbar__cart-btn {
  position: relative;
}

.navbar__cart-btn .navbar__badge {
  position: absolute;
  top: -2px;
  right: -2px;
}

/* Cart Dropdown */
.cart-dropdown {
  position: absolute;
  top: 50px;
  right: 0;
  background-color: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-md);
  width: 320px;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.cart-dropdown__title {
  font-size: 1.1rem;
  font-weight: 700;
  border-bottom: 1px solid var(--color-border);
  padding-bottom: 0.5rem;
}

.cart-dropdown__empty {
  color: var(--color-text-secondary);
  text-align: center;
  padding: 1.5rem 0;
}

.cart-dropdown__content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.cart-dropdown__list {
  max-height: 220px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

/* Cart Item */
.cart-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  border-bottom: 1px solid var(--color-border);
  padding-bottom: 0.75rem;
}

.cart-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.cart-item__img {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: var(--border-radius-sm);
}

.cart-item__details {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  overflow: hidden;
}

.cart-item__name {
  font-size: 0.9rem;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cart-item__price {
  font-size: 0.85rem;
  color: var(--color-text-secondary);
  font-weight: 700;
}

.cart-item__remove-btn {
  color: var(--color-text-secondary);
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: var(--transition-smooth);
}

.cart-item__remove-btn:hover {
  background-color: var(--color-bg-tertiary);
  color: var(--color-danger);
}

.cart-dropdown__total {
  display: flex;
  justify-content: space-between;
  font-weight: 700;
  font-size: 1.05rem;
  border-top: 1px solid var(--color-border);
  padding-top: 0.75rem;
}

.cart-dropdown__total-price {
  color: var(--color-accent-green);
}

.cart-dropdown__actions {
  display: flex;
  gap: 0.75rem;
}

.cart-dropdown__actions .btn {
  flex: 1;
  padding: 0.4rem;
  font-size: 0.9rem;
}

/* Responsive Mobile Styles */
.navbar__toggle {
  display: none;
  flex-direction: column;
  gap: 5px;
  width: 30px;
  height: 24px;
}

.navbar__toggle-bar {
  height: 3px;
  width: 100%;
  background-color: var(--color-text-primary);
  border-radius: 9px;
  transition: var(--transition-smooth);
}

@media (max-width: 768px) {
  .navbar__toggle {
    display: flex;
  }

  .navbar__menu {
    position: absolute;
    top: 70px;
    left: 0;
    width: 100%;
    background-color: var(--color-bg-secondary);
    border-bottom: 1px solid var(--color-border);
    flex-direction: column;
    padding: 1.5rem;
    gap: 1rem;
    transform: translateY(-150%);
    opacity: 0;
    transition: var(--transition-smooth);
    pointer-events: none;
  }

  .navbar__menu--open {
    transform: translateY(0);
    opacity: 1;
    pointer-events: all;
  }

  .navbar__toggle--open .navbar__toggle-bar:nth-child(1) {
    transform: translateY(8px) rotate(45deg);
  }

  .navbar__toggle--open .navbar__toggle-bar:nth-child(2) {
    opacity: 0;
  }

  .navbar__toggle--open .navbar__toggle-bar:nth-child(3) {
    transform: translateY(-8px) rotate(-45deg);
  }
}
</style>
