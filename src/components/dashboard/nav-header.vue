<template>
  <header class="flex sticky top-0 gap-4 items-center px-4 h-16 border-b bg-background md:px-6">
    <nav class="hidden flex-col flex-grow gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
      <a href="/" class="flex gap-2 items-center text-lg font-semibold md:text-base">
        <Package2 class="w-6 h-6" />
        <span>Eazy Invoice</span>
      </a>

      <div class="flex flex-row flex-grow gap-5 justify-around max-w-fit">
        <span
          v-for="item in navItems"
          :key="item.tab"
          v-show="item.name"
          @click="
            () => {
              $router.push({ path: '/dashboard', query: { tab: item.tab } });
            }
          "
          class="cursor-pointer"
          :class="[
            currentTab === item.tab ? 'text-foreground' : 'text-muted-foreground',
            'transition-colors hover:text-foreground',
          ]">
          <div class="flex gap-2 items-center">
            <component :is="item.icon" v-if="item.icon" class="w-4 h-4" />
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
            v-show="item.name"
            @click="
              () => {
                $router.push({ path: '/dashboard', query: { tab: item.tab } });
                toggleSheet = false;
              }
            "
            class="cursor-pointer"
            :class="[
              currentTab === item.tab ? 'text-foreground' : 'text-muted-foreground',
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
  </header>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { CircleUser, Menu, Package2, Search, Users } from "lucide-vue-next";

const toggleSheet = ref(false);

const props = defineProps<{
  currentTab?: string;
}>();

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

const navItems = computed(() => {
  return paidNavItems;
});
</script>
