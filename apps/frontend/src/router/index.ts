import { createRouter, createWebHistory } from "vue-router";
import { routes } from "vue-router/auto-routes";
import { useAuthStore } from '../stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to, from) => {
  const authStore = useAuthStore()
  await authStore.getSession()

  const isAuthPage = ['/login', '/register'].includes(to.path)

  if (!authStore.user && !isAuthPage) {
    return {
      name: '/login'
    }
  }

  if (authStore.user && isAuthPage) {
    return {
      name: '/'
    }
  }
})


export default router;
