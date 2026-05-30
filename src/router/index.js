import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/catalog',
      name: 'catalog',
      component: () => import('../views/CatalogoView.vue'),
    },
    {
      path: '/game/:id',
      name: 'game-detail',
      component: () => import('../views/DetallesJuegoView.vue'),
    },
    {
      path: '/favorites',
      name: 'favorites',
      component: () => import('../views/FavoritosView.vue'),
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('../views/PerfilView.vue'),
    },
  ],
  // Desplazar la página al inicio al cambiar de ruta
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  },
})

export default router
