<template>
  <div>
    <EmailScheduleForm v-if="showEmailForm" @schedule-email="handleScheduleEmail" />
    <Card class="p-6">
      <CardHeader class="flex flex-row justify-between items-center pb-6 space-y-0">
        <CardTitle>Invoice Preview</CardTitle>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" class="ml-auto">
              Actions
              <ChevronDownIcon class="ml-2 w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem @click="handleDownload">
              <DownloadIcon class="mr-2 w-4 h-4" />
              <span>Download PDF</span>
            </DropdownMenuItem>
            <DropdownMenuItem @click="handleEmail">
              <MailIcon class="mr-2 w-4 h-4" />
              <span>Send via Email</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent id="invoice-preview-download">
        <div class="grid grid-cols-12 gap-6">
          <!-- Invoice Details -->
          <div class="flex flex-col col-span-6 justify-between">
            <!-- <div>{{ form.client }}</div> -->
            <h3 class="font-bold">{{ form.client.name }}</h3>
            <p>{{ form.client.email }}</p>
            <p>{{ form.client.phone }}</p>
            <p>{{ form.client.address }}</p>
            <div v-if="form.client.address" class="flex gap-2">
              <span>{{ form.client.city }}</span>
              <span>{{ form.client.state }}</span>
              <span>{{ form.client.postal_code }}</span>
            </div>
          </div>
          <div class="flex col-span-6 ml-auto justify-between">
            <div>
              <h3 class="mb-2 font-semibold">Invoice Details</h3>
              <div class="space-y-1 text-sm">
                <p><span class="font-medium">Invoice Number:</span> {{ form?.invoiceNumber }}</p>
                <p><span class="font-medium">Invoice Date:</span> {{ form?.invoiceDate }}</p>
                <p><span class="font-medium">Due Date:</span> {{ form?.dueDate }}</p>
              </div>
            </div>
          </div>

          <!-- Line Items -->
          <div class="col-span-12">
            <h3 class="mb-4 font-semibold">Items</h3>
            <div class="space-y-4">
              <!-- Headers -->
              <div class="grid grid-cols-12 gap-4 pb-2 text-sm font-medium border-b">
                <div class="col-span-6">Description</div>
                <div class="col-span-2 text-right">Quantity</div>
                <div class="col-span-2 text-right">Price</div>
                <div class="col-span-2 text-right">Total</div>
              </div>

              <!-- Items -->
              <div v-for="(item, index) in form?.lineItems" :key="index" class="grid grid-cols-12 gap-4 text-sm">
                <div class="col-span-6">{{ item.description }}</div>
                <div class="col-span-2 text-right">{{ item.quantity }}</div>
                <div class="col-span-2 text-right">{{ formatCurrency(item.price) }}</div>
                <div class="col-span-2 text-right">{{ formatCurrency(item.quantity * item.price) }}</div>
              </div>
            </div>
          </div>

          <!-- Totals -->
          <div class="col-span-12">
            <div class="ml-auto space-y-2 w-1/3">
              <div class="flex justify-between">
                <span class="font-medium">Subtotal:</span>
                <span>{{ formatCurrency(form?.subtotal) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="font-medium">Tax:</span>
                <span>{{ formatCurrency(form?.tax) }}</span>
              </div>
              <div class="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span>{{ formatCurrency(form?.total) }}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
// @ts-ignore
import { inject, ref, defineEmits } from "vue";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { ChevronDownIcon, DownloadIcon, MailIcon } from "lucide-vue-next";
import EmailScheduleForm from "./email_schedule_form.vue";

const emit = defineEmits(["schedule-email"]);
const form = inject("invoiceForm");
const showEmailForm = ref(false);

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

function handleEmail() {
  showEmailForm.value = !showEmailForm.value;
}

function handleScheduleEmail(scheduleData: any) {
  emit("schedule-email", scheduleData);
}

const handleDownload = async () => {
  emit("invoice-download-safe", true);
};
</script>

<style scoped></style>
