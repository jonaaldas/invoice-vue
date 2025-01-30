<script setup lang="ts">
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";
import { useForm } from "vee-validate";
import { FormField, FormItem, FormControl, FormLabel, FormMessage } from "@/components/ui/form";
import { useRouter } from "vue-router";
import { register } from "../utils/supaAuth";

const router = useRouter();

const formSchema = toTypedSchema(
  z.object({
    firstName: z.string().min(2, "First name must be at least 2 characters"),
    lastName: z.string().min(2, "Last name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
  })
);

const form = useForm({
  validationSchema: formSchema,
  initialValues: {
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  },
});

const onSubmit = form.handleSubmit(async (values) => {
  const res = await register(values);
  if (!res) {
    window.toaster("Error", "Something went wrong");
    return;
  }
  window.toaster("Success", "Account created successfully. Check your email for a verification link");
  router.push("/login");
});
</script>

<template>
  <Card class="mx-auto mt-40 max-w-sm">
    <CardHeader>
      <CardTitle class="text-xl">Sign Up</CardTitle>
      <CardDescription>Enter your information to create an account</CardDescription>
    </CardHeader>
    <CardContent>
      <form @submit="onSubmit" class="grid gap-4">
        <div class="grid grid-cols-2 gap-4">
          <FormField v-slot="{ field }" name="firstName">
            <FormItem class="grid gap-2">
              <FormLabel>First name</FormLabel>
              <FormControl>
                <Input v-bind="field" placeholder="Max" />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField v-slot="{ field }" name="lastName">
            <FormItem class="grid gap-2">
              <FormLabel>Last name</FormLabel>
              <FormControl>
                <Input v-bind="field" placeholder="Robinson" />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>
        </div>

        <FormField v-slot="{ field }" name="email">
          <FormItem class="grid gap-2">
            <FormLabel>Email</FormLabel>
            <FormControl>
              <Input v-bind="field" type="email" placeholder="m@example.com" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ field }" name="password">
          <FormItem class="grid gap-2">
            <FormLabel>Password</FormLabel>
            <FormControl>
              <Input v-bind="field" type="password" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <Button type="submit" class="w-full">Create an account</Button>
        <Button variant="outline" class="flex flex-row gap-2 w-full">
          <svg
            class="size-6"
            width="256"
            height="262"
            viewBox="0 0 256 262"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="xMidYMid">
            <path
              d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622 38.755 30.023 2.685.268c24.659-22.774 38.875-56.282 38.875-96.027"
              fill="#4285F4" />
            <path
              d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055-34.523 0-63.824-22.773-74.269-54.25l-1.531.13-40.298 31.187-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1"
              fill="#34A853" />
            <path
              d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82 0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602l42.356-32.782"
              fill="#FBBC05" />
            <path
              d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0 79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251"
              fill="#EB4335" />
          </svg>
          Login with Google
        </Button>
        <div class="mt-4 text-sm text-center">
          Already have an account?
          <a href="/login" class="underline">Log in</a>
        </div>
      </form>
    </CardContent>
  </Card>
</template>
