<template>
  <div class="pt-6 border-t">
    <h3 class="mb-4 text-lg font-medium">Business Profile</h3>
    <form @submit.prevent="onBusinessSubmit">
      <div class="space-y-4">
        <FormField name="name" v-slot="{ componentField }">
          <FormItem>
            <FormLabel>Business Name</FormLabel>
            <FormControl>
              <Input placeholder="Enter business name" v-bind="componentField" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField name="email" v-slot="{ componentField }">
          <FormItem>
            <FormLabel>Business Email</FormLabel>
            <FormControl>
              <Input type="email" placeholder="business@example.com" v-bind="componentField" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField name="phone" v-slot="{ componentField }">
          <FormItem>
            <FormLabel>Business Phone</FormLabel>
            <FormControl>
              <Input type="tel" placeholder="Enter phone number" v-bind="componentField" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField name="address" v-slot="{ componentField }">
          <FormItem>
            <FormLabel>Business Address</FormLabel>
            <FormControl>
              <Input placeholder="Enter business address" v-bind="componentField" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField name="taxNumber" v-slot="{ componentField }">
          <FormItem>
            <FormLabel>Tax Number</FormLabel>
            <FormControl>
              <Input placeholder="Enter tax number" v-bind="componentField" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField name="defaultCurrency" v-slot="{ componentField }">
          <FormItem>
            <FormLabel>Default Currency</FormLabel>
            <FormControl>
              <Input placeholder="USD" v-bind="componentField" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <Button type="submit">
          {{ businessLoading ? "Saving..." : "Save Business Profile" }}
        </Button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { Button } from "./ui/button";
import { supabase } from "@/supabase";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import * as z from "zod";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import { useAuthStore } from "@/stores/auth";

const authStore = useAuthStore();
const businessProfile = computed(() => authStore.business[0]);
const businessLoading = ref(false);

const businessSchema = toTypedSchema(
  z.object({
    name: z.string().min(1, "Business name is required"),
    email: z.string().email("Invalid email address"),
    phone: z.number().min(1, "Phone number is required"),
    address: z.string().min(1, "Address is required"),
    taxNumber: z.string().min(1, "Tax number is required"),
    defaultCurrency: z.string().min(1, "Currency is required").default("USD"),
  })
);

const businessForm = useForm({
  validationSchema: businessSchema,
});

const onBusinessSubmit = businessForm.handleSubmit(async (values) => {
  try {
    businessLoading.value = true;
    const { error } = await supabase
      .from("business_profiles")
      .update({
        profile_id: authStore.user?.id,
        name: values.name,
        email: values.email,
        phone: values.phone,
        address: values.address,
        tax_number: values.taxNumber,
        default_currency: values.defaultCurrency,
      })
      .eq("profile_id", authStore.user.id);

    if (error) throw error;

    window.toaster("Success", "Business profile updated successfully");
  } catch (error: any) {
    window.toaster("Error", error.message, "destructive");
  } finally {
    businessLoading.value = false;
  }
});

onMounted(() => {
  if (businessProfile.value) {
    businessForm.setValues({
      name: businessProfile.value.name,
      email: businessProfile.value.email,
      phone: businessProfile.value.phone,
      address: businessProfile.value.address,
      taxNumber: businessProfile.value.tax_number,
      defaultCurrency: businessProfile.value.default_currency,
    });
  }
});
</script>
