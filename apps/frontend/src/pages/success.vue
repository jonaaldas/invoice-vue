<template>
  <main class="container flex items-center justify-center min-h-screen py-10">
    <Card class="w-full max-w-md">
      <CardHeader>
        <div class="flex justify-center mb-4">
          <Loader2 v-if="isLoading" class="w-16 h-16 text-primary animate-spin" />
          <CheckCircle v-else-if="isSuccess" class="w-16 h-16 text-green-500" />
          <XCircle v-else class="w-16 h-16 text-red-500" />
        </div>
        <CardTitle class="text-2xl text-center">{{ title }}</CardTitle>
        <CardDescription class="text-center">{{ description }}</CardDescription>
      </CardHeader>
      <CardContent v-if="!isLoading && isSuccess" class="flex justify-center">
        <Button @click="goToDashboard" class="w-full max-w-xs bg-primary hover:bg-primary/90"> Go to Dashboard </Button>
      </CardContent>
    </Card>
  </main>
</template>

<script setup lang="ts">
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "vue-router";
import { CheckCircle, XCircle, Loader2 } from "lucide-vue-next";
import axios from "../lib/axios";

const router = useRouter();
const isLoading = ref(true);
const isSuccess = ref(false);

const title = computed(() => (isSuccess.value ? "Payment Successful!" : "Payment Failed"));
const description = computed(() => (isSuccess.value ? "Thank you for your purchase" : "There was an error processing your payment"));

const goToDashboard = () => {
  router.push("/dashboard");
};

onMounted(async () => {
  try {
    await axios.get("/api/stripe/success");
    isSuccess.value = true;
    // Redirect to dashboard after showing success message briefly
    setTimeout(() => {
      router.push("/dashboard");
    }, 1500);
  } catch (error) {
    isSuccess.value = false;
    // Redirect to dashboard after showing error briefly
    setTimeout(() => {
      router.push("/dashboard");
    }, 1500);
  } finally {
    isLoading.value = false;
  }
});
</script>

<style scoped>
/* Add any scoped styles here if needed */
</style>
