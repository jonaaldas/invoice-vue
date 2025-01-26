<script setup lang="ts">
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { CircleUser, Menu, Package2, Search, Users } from "lucide-vue-next";
import { useRoute } from "vue-router";
const route = useRoute();

type AsyncComponents = {
  invoice: any;
  pricing: any;
  profile: any;
  clients: any;
};
type AsyncComponentKey = keyof AsyncComponents;
const toggleSheet = ref(false);
const componentToRender = ref<AsyncComponentKey>("invoice");

const asyncComponents: AsyncComponents = {
  invoice: defineAsyncComponent(() => import("./invoice.vue")),
  pricing: defineAsyncComponent(() => import("./pricing.vue")),
  profile: defineAsyncComponent(() => import("./profile.vue")),
  clients: defineAsyncComponent(() => import("./clients.vue")),
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
  // return authStore.profile?.isPaid ? paidNavItems : unpaidNavItems;
  return true ? paidNavItems : unpaidNavItems;
});

// Error handling for Suspense
const onError = (error: any) => {
  console.error("Error loading component:", error);
};

watch(
  () => route.query.tab,
  (newTab: string) => {
    console.log("🚀 ~ watch ~ newTab:", newTab);
    if (!newTab) return;
    componentToRender.value = newTab as AsyncComponentKey;
  }
);

onMounted(() => {
  if (route.query.tab) {
    componentToRender.value = route.query.tab as AsyncComponentKey;
  }
});
</script>

<template>
  <div class="flex flex-col w-full min-h-screen">
    <header class="flex sticky top-0 gap-4 items-center px-4 h-16 border-b bg-background md:px-6">
      <nav
        class="hidden flex-col flex-grow gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
        <a href="/" class="flex gap-2 items-center text-lg font-semibold md:text-base">
          <Package2 class="w-6 h-6" />
          <span>Eazy Invoice</span>
        </a>

        <div class="flex flex-row flex-grow gap-5 justify-around max-w-fit">
          <span
            v-for="item in navItems"
            :key="item.tab"
            @click="
              () => {
                componentToRender = item.tab;
                $router.push({ tab: item.tab });
              }
            "
            class="cursor-pointer"
            :class="[
              componentToRender === item.tab ? 'text-foreground' : 'text-muted-foreground',
              'transition-colors hover:text-foreground',
            ]">
            <div class="flex gap-2 items-center">
              {{ item.name }}
            </div>
          </span>
        </div>
      </nav>
      <Sheet v-model:open="toggleSheet">
        <Button variant="outline" size="icon" class="shrink-0 md:hidden" @click="toggleSheet = !toggleSheet">
          <Menu class="w-5 h-5" />
          <span class="sr-only">Toggle navigation menu</span>
        </Button>
        <SheetContent side="left">
          <div class="flex flex-col gap-1 justify-between mb-4">
            <SheetTitle>
              <a href="#" class="flex gap-2 items-center text-lg font-semibold">
                <Package2 class="w-6 h-6" />
                <span>Eazy Invoice</span>
              </a>
            </SheetTitle>
            <SheetDescription>Choose a component to render</SheetDescription>
          </div>
          <nav class="grid gap-6 text-lg font-medium">
            <span
              v-for="item in navItems"
              :key="item.tab"
              @click="
                () => {
                  componentToRender = item.tab;
                  $router.push({ tab: item.tab });
                  toggleSheet = false;
                }
              "
              class="cursor-pointer"
              :class="[
                componentToRender === item.tab ? 'text-foreground' : 'text-muted-foreground',
                'transition-colors hover:text-foreground',
              ]">
              <div class="flex gap-2 items-center">
                <component :is="item.icon" v-if="item.icon" class="w-4 h-4" />
                {{ item.name }}
              </div>
            </span>
          </nav>
        </SheetContent>
      </Sheet>
      <!-- <div class="flex gap-4 items-center w-full md:ml-auto md:gap-2 lg:gap-4"></div> -->
    </header>
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
