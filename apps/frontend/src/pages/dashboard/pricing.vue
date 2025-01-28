<script setup lang="ts">
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-vue-next";
import axios from "../../lib/axios";

const handlePlanSelection = async () => {
  try {
    const { data } = await axios.post<{ success: boolean; checkoutUrl: string }>("/api/stripe/generate-customer");
    if (!data.success) {
      window.toaster("Error", "There was an error please try again.", "destructive");
      throw new Error("Failed to generate customer");
    }
    window.location.href = data.checkoutUrl;
  } catch (error) {
    console.error("Error generating customer:", error);
    window.toaster("Error", "There was an error please try again", "destructive");
  }
};
</script>

<template>
  <!-- Pricing -->
  <div id="pricing" class="container">
    <div class="max-w-2xl mx-auto text-center mb-10 md:mb-20">
      <h2 class="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight transition-colors first:mt-0">
        Pricing
      </h2>
    </div>
    <div class="flex flex-col items-center justify-center sm:grid gap-4 mt-10">
      <Card class="border-primary relative w-full sm:w-[500px]">
        <span class="absolute -top-12 left-1/2 -translate-x-1/2 animate-bounce hidden sm:block w-full">
          <span class="flex items-center">
            <svg
              class="w-14 h-8 -me-6"
              width="45"
              height="25"
              viewBox="0 0 45 25"
              fill="none"
              xmlns="http://www.w3.org/2000/svg">
              <path
                d="M43.2951 3.47877C43.8357 3.59191 44.3656 3.24541 44.4788 2.70484C44.5919 2.16427 44.2454 1.63433 43.7049 1.52119L43.2951 3.47877ZM4.63031 24.4936C4.90293 24.9739 5.51329 25.1423 5.99361 24.8697L13.8208 20.4272C14.3011 20.1546 14.4695 19.5443 14.1969 19.0639C13.9242 18.5836 13.3139 18.4152 12.8336 18.6879L5.87608 22.6367L1.92723 15.6792C1.65462 15.1989 1.04426 15.0305 0.563943 15.3031C0.0836291 15.5757 -0.0847477 16.1861 0.187863 16.6664L4.63031 24.4936ZM43.7049 1.52119C32.7389 -0.77401 23.9595 0.99522 17.3905 5.28788C10.8356 9.57127 6.58742 16.2977 4.53601 23.7341L6.46399 24.2659C8.41258 17.2023 12.4144 10.9287 18.4845 6.96211C24.5405 3.00476 32.7611 1.27399 43.2951 3.47877L43.7049 1.52119Z"
                fill="currentColor"
                class="text-muted-foreground" />
            </svg>
            <Badge class="mt-3 uppercase bg-primary">Eazy</Badge>
          </span>
        </span>
        <CardHeader class="text-center pb-2">
          <Badge class="uppercase w-max self-center mb-3 bg-primary">Cheapest in the market</Badge>
          <CardTitle class="!mb-7">Yearly subscription</CardTitle>
          <div>
            <span class="font-bold text-5xl">49.99</span>
            <span class="font-thin text-sm">/year</span>
          </div>
        </CardHeader>
        <CardDescription class="text-center w-11/12 mx-auto">
          Everything you need to start sending recurring invoices.
        </CardDescription>
        <CardContent>
          <ul class="mt-7 space-y-2.5 text-sm">
            <li class="flex space-x-2">
              <Check class="flex-shrink-0 mt-0.5 h-4 w-4" />
              <span class="text-muted-foreground">Create unlimited invoices</span>
            </li>
            <li class="flex space-x-2">
              <Check class="flex-shrink-0 mt-0.5 h-4 w-4" />
              <span class="text-muted-foreground">Create as many clients as you want</span>
            </li>
            <li class="flex space-x-2">
              <Check class="flex-shrink-0 mt-0.5 h-4 w-4" />
              <span class="text-muted-foreground">Send unlimited emails with recurring invoices </span>
            </li>
          </ul>
        </CardContent>
        <CardFooter>
          <Button @click="handlePlanSelection()" class="w-full bg-primary hover:bg-primary/90">Pay now</Button>
        </CardFooter>
      </Card>
    </div>
  </div>
</template>
