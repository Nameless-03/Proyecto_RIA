import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import CatalogoView from '../views/CatalogoView.vue'
import DetallesJuegoView from '../views/DetallesJuegoView.vue'
import FavoritosView from '../views/FavoritosView.vue'
import PerfilView from '../views/PerfilView.vue'

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
      component: CatalogoView,
    },
    {
      path: '/game/:id',
      name: 'game-detail',
      component: DetallesJuegoView,
    },
    {
      path: '/favorites',
      name: 'favorites',
      component: FavoritosView,
    },
    {
      path: '/profile',
      name: 'profile',
      component: PerfilView,
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

