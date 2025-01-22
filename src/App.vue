<script setup lang="ts">
import Toaster from "@/components/ui/toast/Toaster.vue";
import { useAuthStore } from "./stores/auth";

onMounted(() => {
  useAuthStore().trackAuthChanges();
});
</script>

<template>
  <RouterView />
  <Toaster />
</template>
