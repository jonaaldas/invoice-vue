<template>
  <div class="container p-4 mx-auto">
    <Card class="mx-auto w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
        <CardDescription> Your personal information and subscription status </CardDescription>
      </CardHeader>
      <CardContent>
        <div class="space-y-8">
          <!-- Existing profile information -->
          <div class="space-y-4">
            <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div class="space-y-2">
                <p class="text-sm font-medium text-muted-foreground">Full Name</p>
                <p class="text-lg font-medium">{{ fullName }}</p>
              </div>
              <div class="space-y-2">
                <p class="text-sm font-medium text-muted-foreground">Email</p>
                <p class="text-lg font-medium">{{ profile?.email }}</p>
              </div>
            </div>
            <div class="pt-4">
              <p class="text-sm font-medium text-muted-foreground">Subscription Status</p>
              <div class="flex items-center mt-2 space-x-2">
                <div
                  :class="[
                    'px-3 py-1 rounded-full text-sm font-medium',
                    isPaid ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800',
                  ]">
                  {{ isPaid ? "Active Subscription" : "Free Plan" }}
                </div>
              </div>
            </div>
          </div>

          <BusinessProfileForm />

          <!-- Password Change Form -->
          <div class="pt-6 border-t">
            <h3 class="mb-4 text-lg font-medium">Change Password</h3>
            <form @submit.prevent="onSubmit" id="reset-password">
              <div class="space-y-4">
                <FormField name="currentPassword" v-slot="{ componentField }">
                  <FormItem>
                    <FormLabel>Current Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Enter current password" v-bind="componentField" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                </FormField>

                <FormField name="newPassword" v-slot="{ componentField }">
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Enter new password" v-bind="componentField" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                </FormField>

                <FormField name="confirmPassword" v-slot="{ componentField }">
                  <FormItem>
                    <FormLabel>Confirm New Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Confirm new password" v-bind="componentField" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                </FormField>

                <Button type="submit" :disabled="loading">
                  {{ loading ? "Updating..." : "Update Password" }}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth";
import { supabase } from "../../supabase";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import * as z from "zod";
import { useForm } from "vee-validate";
import BusinessProfileForm from "@/components/business_profile_form.vue";
import { toTypedSchema } from "@vee-validate/zod";

const authStore = useAuthStore();

const profile = computed(() => authStore.profile);

const isPaid = computed(() => profile.value?.isPaid || false);

const fullName = computed(() => `${profile.value?.first_name || ""} ${profile.value?.last_name || ""}`);

const loading = ref(false);

const passwordSchema = toTypedSchema(
  z
    .object({
      currentPassword: z.string().min(6, "Current password is required"),
      newPassword: z.string().min(6, "Password must be at least 6 characters"),
      confirmPassword: z.string().min(6, "Please confirm your password"),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: "Passwords don't match",
      path: ["confirmPassword"],
    })
);

const form = useForm({
  validationSchema: passwordSchema,
});

const onSubmit = form.handleSubmit(async (values) => {
  try {
    loading.value = true;
    const { error } = await supabase.auth.updateUser({
      password: values.newPassword,
    });

    if (error) throw error;

    window.toaster("Success", "Password updated successfully");

    form.resetForm();
  } catch (error: any) {
    window.toaster("Error", error.message, "destructive");
  } finally {
    loading.value = false;
  }
});
</script>
