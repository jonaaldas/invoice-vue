<template>
  <div>
    <EmailScheduleForm v-if="showEmailForm" @schedule-email="handleScheduleEmail" />
    <Card class="p-6">
      <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-6">
        <CardTitle>Invoice Preview</CardTitle>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" class="ml-auto">
              Actions
              <ChevronDownIcon class="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem @click="handleDownload">
              <DownloadIcon class="mr-2 h-4 w-4" />
              <span>Download PDF</span>
            </DropdownMenuItem>
            <DropdownMenuItem @click="handleEmail">
              <MailIcon class="mr-2 h-4 w-4" />
              <span>Send via Email</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent id="invoice-preview-download">
        <div class="grid grid-cols-12 gap-6" >
          <!-- Invoice Details -->
          <div class="col-span-12 flex justify-between">
            <div>
              <h3 class="font-semibold mb-2">Invoice Details</h3>
              <div class="space-y-1 text-sm">
                <p><span class="font-medium">Invoice Number:</span> {{ form?.invoiceNumber }}</p>
                <p><span class="font-medium">Invoice Date:</span> {{ form?.invoiceDate }}</p>
                <p><span class="font-medium">Due Date:</span> {{ form?.dueDate }}</p>
              </div>
            </div>
          </div>

          <!-- Line Items -->
          <div class="col-span-12">
            <h3 class="font-semibold mb-4">Items</h3>
            <div class="space-y-4">
              <!-- Headers -->
              <div class="grid grid-cols-12 gap-4 pb-2 border-b text-sm font-medium">
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
            <div class="ml-auto w-1/3 space-y-2">
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
import { inject, ref, defineEmits } from 'vue';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { ChevronDownIcon, DownloadIcon, MailIcon } from 'lucide-vue-next';
import EmailScheduleForm from './email_schedule_form.vue';
import html2pdf from "html2pdf.js";

const emit = defineEmits(['schedule-email']);
const form = inject('invoiceForm');
const showEmailForm = ref(false);

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
}


function handleEmail() {
  showEmailForm.value = !showEmailForm.value;
}

function handleScheduleEmail(scheduleData: any) {
  emit('schedule-email', scheduleData);
  showEmailForm.value = false;
}

const handleDownload = async () => {
  var element = document.getElementById("invoice-preview-download");
  var opt = {
    margin: 10,
    filename: `Invoice`,
    image: { type: "jpeg", quality: 1 },
    html2canvas: { scale: 3, useCORS: true, scrollY: 0 },
    jsPDF: { unit: "pt", format: "letter", orientation: "portrait", compressPDF: true },
  };
  html2pdf().from(element).set(opt).toPdf().get("pdf").save();
  // redirect to all invoices
};
</script>

<style scoped>

</style>