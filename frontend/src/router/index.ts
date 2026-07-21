import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth.store';
import AppLayout from '../components/AppLayout.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue')
    },
    {
      path: '/',
      component: AppLayout,
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          redirect: '/dashboard'
        },
        {
          path: 'dashboard',
          name: 'dashboard',
          component: () => import('../views/DashboardView.vue') // Placeholder
        },
        {
          path: 'recepcion',
          name: 'recepcion',
          component: () => import('../views/RecepcionView.vue') // Placeholder
        },
        {
          path: 'usuarios',
          name: 'usuarios',
          component: () => import('../views/UsuariosView.vue')
        },
        {
          path: 'distribucion',
          name: 'distribucion',
          component: () => import('../views/DistribucionView.vue')
        },
        {
          path: 'despacho',
          name: 'despacho',
          component: () => import('../views/DespachoView.vue')
        },
        {
          path: 'enrutamiento',
          name: 'enrutamiento',
          component: () => import('../views/EnrutamientoView.vue')
        },
        {
          path: 'archivo',
          name: 'archivo',
          component: () => import('../views/ArchivoView.vue')
        }
        // More routes will be added here
      ]
    }
  ]
});

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login');
  } else if (to.path === '/login' && authStore.isAuthenticated) {
    next('/dashboard');
  } else {
    next();
  }
});

export default router;
