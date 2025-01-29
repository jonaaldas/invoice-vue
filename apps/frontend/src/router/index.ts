import { createRouter, createWebHistory } from "vue-router";
import { routes } from "vue-router/auto-routes";
import { useAuthStore } from "../stores/auth";

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to) => {
  const authStore = useAuthStore();
  await authStore.getSession();

  const isAuthPage = ["/login", "/register"].includes(to.path);

  if (!authStore.user && !isAuthPage) {
    return { path: "/login" };
  }

  if (authStore.user && isAuthPage) {
    return { path: "/dashboard" };
  }
});

export default router;
