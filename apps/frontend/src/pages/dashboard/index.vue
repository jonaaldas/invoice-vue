<script setup lang="ts">
import { useRoute } from "vue-router";
import NavHeader from "@/components/dashboard/nav-header.vue";
import { CircleUser, Package2, Search, Users } from "lucide-vue-next";
import { useAuthStore } from "@/stores/auth";

const route = useRoute();
const authStore = useAuthStore();

type AsyncComponents = {
  invoice: any;
  pricing: any;
  profile: any;
  clients: any;
  client_id: any;
};
type AsyncComponentKey = keyof AsyncComponents;
const componentToRender = ref<AsyncComponentKey>(authStore.profile?.is_paid ? "invoice" : "pricing");

const asyncComponents: AsyncComponents = {
  invoice: defineAsyncComponent(() => import("./invoice.vue")),
  pricing: defineAsyncComponent(() => import("./pricing.vue")),
  profile: defineAsyncComponent(() => import("./profile.vue")),
  clients: defineAsyncComponent(() => import("./clients.vue")),
  client_id: defineAsyncComponent(() => import("./client/[id].vue")),
};

const currentComponent = computed(() => {
  const key = componentToRender.value as AsyncComponentKey;
  return asyncComponents[key];
});

const paidNavItems = [
  {
    name: "New Invoice",
    icon: Package2,
    tab: "invoice",
  },
  {
    name: "Clients",
    icon: Users,
    tab: "clients",
  },
  {
    name: "All Invoices",
    icon: Search,
    tab: "invoices",
  },
  {
    name: "Billing",
    icon: Package2,
    tab: "billing",
  },
  {
    name: "Profile",
    icon: CircleUser,
    tab: "profile",
  },
  {
    tab: "client_id",
  },
];

const unpaidNavItems = [
  {
    name: "Pricing",
    tab: "pricing",
  },
  {
    name: "Profile",
    tab: "profile",
  },
];

const navItems = computed(() => {
  return authStore.profile?.is_paid ? paidNavItems : unpaidNavItems;
  // return paidNavItems;
});

// Error handling for Suspense
const onError = (error: any) => {
  console.error("Error loading component:", error);
};

onMounted(() => {
  if (route.query.tab) {
    if (!authStore.profile?.is_paid) {
      componentToRender.value = "pricing";
      return;
    }
    componentToRender.value = route.query.tab as AsyncComponentKey;
  }
});
</script>

<template>
  <div class="flex flex-col w-full min-h-screen">
    <NavHeader
      :current-tab="componentToRender"
      :nav-items="navItems"
      @update:current-tab="(tab: any) => (componentToRender = tab)" />
    <main class="flex flex-col flex-1 gap-4 p-4 md:gap-8 md:p-8">
      <Suspense @error="onError">
        <template #default>
          <component v-if="asyncComponents[componentToRender]" :is="currentComponent" />
          <div v-else>Coming Soon...</div>
        </template>
        <template #fallback>
          <div class="flex justify-center items-center p-8">
            <div class="space-y-4 text-center">
              <div class="w-12 h-12 rounded-full border-b-2 animate-spin border-primary"></div>
              <p class="text-muted-foreground">Loading...</p>
            </div>
          </div>
        </template>
      </Suspense>
    </main>
  </div>
</template>
