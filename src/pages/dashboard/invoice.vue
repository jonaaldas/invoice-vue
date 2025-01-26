<template>
  <div class="container flex flex-col gap-4 mx-auto max-w-screen-lg">
    <Stepper class="flex gap-2 items-start w-full" v-model="stepIndex">
      <StepperItem
        v-for="step in steps"
        :key="step.step"
        v-slot="{ state }"
        class="flex relative flex-col justify-center items-center w-full"
        :step="step.step">
        <StepperSeparator
          v-if="step.step !== steps[steps.length - 1].step"
          class="absolute left-[calc(50%+20px)] right-[calc(-50%+10px)] top-5 block h-0.5 shrink-0 rounded-full bg-muted group-data-[state=completed]:bg-primary" />

        <StepperTrigger as-child>
          <Button
            :variant="state === 'completed' || state === 'active' ? 'default' : 'outline'"
            size="icon"
            class="z-10 rounded-full pointer-events-none shrink-0"
            :class="[state === 'active' && 'ring-2 ring-ring ring-offset-2 ring-offset-background']">
            <CheckIcon v-if="state === 'completed'" class="size-5" />
            <CircleIcon v-if="state === 'active'" />
            <DotIcon v-if="state === 'inactive'" />
          </Button>
        </StepperTrigger>

        <div class="flex flex-col items-center mt-5 text-center">
          <StepperTitle
            :class="[state === 'active' && 'text-primary']"
            class="text-sm font-semibold transition lg:text-base">
            {{ step.title }}
          </StepperTitle>
          <StepperDescription
            :class="[state === 'active' && 'text-primary']"
            class="text-xs transition sr-only text-muted-foreground md:not-sr-only lg:text-sm">
            {{ step.description }}
          </StepperDescription>
        </div>
      </StepperItem>
    </Stepper>
    <template v-if="stepIndex === 1">
      <CreateInvoice @form-data="handleFormPopulate" />
    </template>
    <template v-if="stepIndex === 2">
      <InvoicePreview @schedule-email="handleEmailSchedule" @invoice-download-safe="handleInvoiceSafeAfterDownload" />
    </template>
  </div>
</template>

<script setup lang="ts">
import {
  Stepper,
  StepperItem,
  StepperTrigger,
  StepperSeparator,
  StepperTitle,
  StepperDescription,
} from "@/components/ui/stepper";
import { Button } from "@/components/ui/button";
import { CheckIcon, CircleIcon, DotIcon } from "lucide-vue-next";
import CreateInvoice from "@/components/create_invoice.vue";
import InvoicePreview from "@/components/invoice_preview.vue";
import { supabase } from "@/supabase";
import { useAuthStore } from "@/stores/auth";
import html2pdf from "html2pdf.js";

const router = useRouter();
const stepIndex = ref(1);

const steps = [
  {
    step: 1,
    title: "Create Invoice",
    description: "Fill in invoice details",
  },
  {
    step: 2,
    title: "Preview",
    description: "Review your invoice",
  },
];

const form = ref({});
const emailSchedule = ref(null);

function goToNextStep() {
  if (stepIndex.value < steps.length) {
    stepIndex.value++;
  }
}

function handleFormPopulate(formValues: any) {
  form.value = formValues;
  goToNextStep();
}

interface ScheduleData {
  isScheduled: boolean;
  frequency?: string;
  subject: string;
  content: string;
  email: string;
  sendDate?: Date;
}

async function handleEmailSchedule(scheduleData: ScheduleData) {
  try {
    const accountId = (await supabase.auth.getUser()).data.user?.id;
    if (!accountId || !form.value) {
      throw new Error("Missing required data");
    }

    emailSchedule.value = scheduleData;

    const invoiceData = {
      account_id: useAuthStore().user.id,
      business_id: form.value.businessId || "5bde3ae6-dac8-4e0c-82d3-bdff505e470d",
      client_id: form.value.client.id,
      frequency: scheduleData.isScheduled ? scheduleData.frequency : "none",
      email_subject: scheduleData.subject,
      email_body: scheduleData.content,
      email_to: scheduleData.email,
      next_send_date: scheduleData.isScheduled ? scheduleData.sendDate : new Date(),
      due_date: form.value.dueDate,
      invoice_date: form.value.invoiceDate,
      items: form.value.lineItems,
      subtotal: form.value.subtotal,
      tax_amount: form.value.tax,
      total: form.value.total,
    };

    const { error } = await supabase.rpc("create_save_recurring_invoice", invoiceData);

    if (error) {
      window.toaster("Failed", "There was an error saving your invoice", "destructive");
      throw error;
    }

    window.toaster("Success", "Invoice saved");
    window.location.href = `/dashboard?tab=invoice${scheduleData.isScheduled ? "s" : ""}`;
  } catch (error) {
    console.error("Error saving invoice:", error);
    throw error;
  }
}

const handleInvoiceSafeAfterDownload = async (value: boolean) => {
  if (!value) {
    window.toaster("Failed", "There was an error downloading and saving your invoice", "destructive");
    return;
  }

  const clientId = form.value.client.id;

  let { error } = await supabase.rpc("create_save_invoice", {
    account_id: useAuthStore().user.id,
    client_id: clientId, //
    business_id: form.value.businessId || "5bde3ae6-dac8-4e0c-82d3-bdff505e470d", //
    invoice_date: form.value.invoiceDate, //
    due_date: form.value.dueDate, //
    subtotal: form.value.subtotal, //
    tax_amount: form.value.tax, //
    total: form.value.total, //
    items: form.value.lineItems, //
  });

  if (error) {
    window.toaster("Failed", "There was an error saving your invoice", "destructive");
    throw error;
  }

  let element = document.getElementById("invoice-preview-download");
  let opt = {
    margin: 10,
    filename: `Invoice`,
    image: { type: "jpeg", quality: 1 },
    html2canvas: { scale: 3, useCORS: true, scrollY: 0 },
    jsPDF: { unit: "pt", format: "letter", orientation: "portrait", compressPDF: true },
  };
  html2pdf()
    .from(element)
    .set(opt)
    .toPdf()
    .get("pdf")
    .save()
    .then(() => {
      window.toaster("Success", "Invoice saved");
      window.location.href = "/dashboard?tab=invoices";
    });
};

provide("goToNextStep", goToNextStep);
provide("invoiceForm", form);
</script>

<style scoped></style>
