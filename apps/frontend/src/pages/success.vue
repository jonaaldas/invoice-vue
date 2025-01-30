<template>
  <main class="container flex items-center justify-center min-h-screen py-10">
    <Card class="w-full max-w-md">
      <CardHeader>
        <div class="flex justify-center mb-4">
          <component :is="statusContent.icon" :class="statusContent.iconClass" />
        </div>
        <CardTitle class="text-2xl text-center">{{ statusContent.title }}</CardTitle>
        <CardDescription class="text-center">{{ statusContent.description }}</CardDescription>
      </CardHeader>
      <CardContent v-if="status === 'success'" class="flex justify-center">
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
import { supabase } from "../supabase/index";
const router = useRouter();
const status = ref("loading"); // loading, success, error

const statusContent = computed(() => {
  switch (status.value) {
    case "loading":
      return {
        icon: Loader2,
        iconClass: "w-16 h-16 text-primary animate-spin",
        title: "Processing Payment...",
        description: "Please wait while we confirm your payment",
      };
    case "success":
      return {
        icon: CheckCircle,
        iconClass: "w-16 h-16 text-green-500",
        title: "Payment Successful!",
        description: "Thank you for your purchase",
      };
    case "error":
      return {
        icon: XCircle,
        iconClass: "w-16 h-16 text-red-500",
        title: "Payment Failed",
        description: "There was an error processing your payment",
      };
    default:
      return {
        icon: Loader2,
        iconClass: "w-16 h-16 text-primary animate-spin",
        title: "Processing Payment...",
        description: "Please wait while we confirm your payment",
      };
  }
});

const goToDashboard = () => {
  window.location.href = "/dashboard";
};

onMounted(async () => {
  try {
    await axios.get("/api/stripe/success");
    status.value = "success";
    setTimeout(() => {
      // here we need to update the session

      supabase.auth.getSession().then(() => {
        window.location.href = "/dashboard";
      });
    }, 1500);
  } catch (error) {
    status.value = "error";
    setTimeout(() => {
      window.location.href = "/dashboard";
    }, 1500);
  }
});
</script>
