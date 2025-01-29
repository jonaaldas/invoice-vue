<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
      <!-- Loading State -->
      <div v-if="loading" class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p class="mt-4 text-gray-600">Verifying your email...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center">
        <div class="bg-red-50 p-4 rounded-md">
          <p class="text-red-600">{{ error }}</p>
        </div>
        <button
          @click="retryConfirmation"
          class="mt-4 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
          Try Again
        </button>
      </div>

      <!-- Success State -->
      <div v-else class="text-center">
        <div class="bg-green-50 p-4 rounded-md">
          <p class="text-green-600">Email confirmed successfully!</p>
        </div>
        <button
          @click="navigateToLogin"
          class="mt-4 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
          Go to Login
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";
import { supabase } from "@/supabase"; // Adjust this import based on your setup

const route = useRoute();
const router = useRouter();

const loading = ref(true);
const error = ref<string | null>(null);

const confirmEmail = async () => {
  try {
    // Get the token from URL parameters
    const token = route.query.token as string;
    const type = route.query.type as string;

    if (!token || !type) {
      throw new Error("Missing confirmation token or type");
    }

    // Verify the email
    const { error: verificationError } = await supabase.auth.verifyOtp({
      token,
      type: "signup",
      email: route.query.email as string,
    });

    if (verificationError) {
      throw verificationError;
    }

    loading.value = false;
  } catch (err: any) {
    loading.value = false;
    error.value = err.message || "An error occurred during confirmation";
  }
};

const retryConfirmation = () => {
  loading.value = true;
  error.value = null;
  confirmEmail();
};

const navigateToLogin = () => {
  router.push("/login");
};

onMounted(() => {
  confirmEmail();
});
</script>
