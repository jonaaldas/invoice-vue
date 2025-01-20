import { createMemoryHistory, createRouter } from "vue-router";

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    {
      path: "/home",
      name: "Home",
      component: () => import("../App.vue"),
    },
  ],
});

export default router;
