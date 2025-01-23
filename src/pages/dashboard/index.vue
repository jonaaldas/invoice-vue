<script setup lang="ts">
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetDescription, SheetClose } from "@/components/ui/sheet";
import { CircleUser, CreditCard, Menu, Package2, Search, Users, X } from "lucide-vue-next";
import { useAuthStore } from "../../stores/auth";

const authStore = useAuthStore();
const toggleSheet = ref(false);

const componentToRender = ref<"invoice" | "pricing" | "profile">(true ? "invoice" : "pricing");

const asyncComponents = {
  invoice: defineAsyncComponent(() => import("./invoice.vue")),
  pricing: defineAsyncComponent(() => import("./pricing.vue")),
  profile: defineAsyncComponent(() => import("./profile.vue")),
};

const currentComponent = computed(() => {
  return asyncComponents[componentToRender.value];
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
</script>

<template>
  <div class="flex min-h-screen w-full flex-col">
    <header class="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      <nav
        class="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6 flex-grow">
        <a href="/" class="flex items-center gap-2 text-lg font-semibold md:text-base">
          <Package2 class="h-6 w-6" />
          <span>Eazy Invoice</span>
        </a>

        <div class="flex flex-row gap-5 flex-grow justify-around max-w-fit">
          <span
            v-for="item in navItems"
            :key="item.tab"
            @click="
              () => {
                componentToRender = item.tab;
              }
            "
            class="cursor-pointer"
            :class="[
              componentToRender === item.tab ? 'text-foreground' : 'text-muted-foreground',
              'transition-colors hover:text-foreground',
            ]">
            <div class="flex items-center gap-2">
              {{ item.name }}
            </div>
          </span>
        </div>
      </nav>
      <Sheet v-model:open="toggleSheet">
        <Button variant="outline" size="icon" class="shrink-0 md:hidden" @click="toggleSheet = !toggleSheet">
          <Menu class="h-5 w-5" />
          <span class="sr-only">Toggle navigation menu</span>
        </Button>
        <SheetContent side="left">
          <div class="flex flex-col gap-1 justify-between mb-4">
            <SheetTitle>
              <a href="#" class="flex items-center gap-2 text-lg font-semibold">
                <Package2 class="h-6 w-6" />
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
                  toggleSheet = false;
                }
              "
              class="cursor-pointer"
              :class="[
                componentToRender === item.tab ? 'text-foreground' : 'text-muted-foreground',
                'transition-colors hover:text-foreground',
              ]">
              <div class="flex items-center gap-2">
                <component :is="item.icon" v-if="item.icon" class="h-4 w-4" />
                {{ item.name }}
              </div>
            </span>
          </nav>
        </SheetContent>
      </Sheet>
      <!-- <div class="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4"></div> -->
    </header>
    <main class="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <Suspense @error="onError">
        <template #default>
          <component v-if="asyncComponents[componentToRender]" :is="currentComponent" />
          <div v-else>Coming Soon...</div>
        </template>
        <template #fallback>
          <div class="flex items-center justify-center p-8">
            <div class="space-y-4 text-center">
              <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <p class="text-muted-foreground">Loading...</p>
            </div>
          </div>
        </template>
      </Suspense>
    </main>
  </div>
</template>
