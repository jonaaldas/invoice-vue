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
import { v4 as uuidv4 } from "uuid";

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

async function handleEmailSchedule(scheduleData: any) {
  try {
    const invoiceId = uuidv4();
    const accountId = (await supabase.auth.getUser()).data.user?.id;

    if (!accountId || !form.value) {
      throw new Error("Missing required data");
    }

    // Create invoice record
    const invoiceData = {
      id: invoiceId,
      account_id: accountId,
      business_id: form.value.businessId,
      client_id: form.value.clientId,
      invoice_date: form.value.invoiceDate,
      due_date: form.value.dueDate,
      invoice_number: form.value.invoiceNumber,
      subtotal: form.value.subtotal,
      tax_amount: form.value.taxAmount,
      total: form.value.total,
      status: "scheduled",
      email_status: "pending",
      scheduled_send_date: scheduleData.sendDate,
    };

    const { error: invoiceError } = await supabase.from("invoices").insert(invoiceData);

    if (invoiceError) throw invoiceError;

    // Create invoice items
    const invoiceItems = form.value.items.map((item: any) => ({
      id: uuidv4(),
      invoice_id: invoiceId,
      account_id: accountId,
      business_id: form.value.businessId,
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      amount: item.amount,
    }));

    const { error: itemsError } = await supabase.from("invoice_items").insert(invoiceItems);

    if (itemsError) throw itemsError;

    // If recurring is enabled, create recurring configuration
    if (scheduleData.recurring) {
      const recurringConfig = {
        id: uuidv4(),
        account_id: accountId,
        business_id: form.value.businessId,
        client_id: form.value.clientId,
        frequency: scheduleData.frequency,
        duration: scheduleData.duration,
        email_subject: scheduleData.emailSubject,
        email_body: scheduleData.emailBody,
        email_to: scheduleData.emailTo,
        status: "active",
        next_send_date: scheduleData.sendDate,
      };

      const { error: recurringError } = await supabase.from("recurring_configs").insert(recurringConfig);

      if (recurringError) throw recurringError;
    }

    emailSchedule.value = scheduleData;
  } catch (error) {
    console.error("Error saving invoice:", error);
    throw error;
  }
}

const handleInvoiceSafeAfterDownload = (value: boolean) => {
  if (!value) {
    window.toaster("Failed", "There was an error downloading and saving your invoice", "destructive");
    return;
  }
  // save invoice
  window.toaster("Success", "Invoice saved");
  // redirect to invoices page
  const router = useRouter();
  router.push("/dashboard/invoices");
};

provide("goToNextStep", goToNextStep);
provide("invoiceForm", form);
</script>

<style scoped></style>
