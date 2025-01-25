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

async function handleEmailSchedule(scheduleData: any) {
  try {
    const accountId = (await supabase.auth.getUser()).data.user?.id;

    if (!accountId || !form.value) {
      throw new Error("Missing required data");
    }

    const clientId = form.value.client.id;
    emailSchedule.value = scheduleData;
    let { error } = await supabase.rpc("create_save_recurring_invoice", {
      account_id: useAuthStore().user.id,
      // make sure to get business id from client and save it in the store
      business_id: form.value.businessId || "afc3deae-d561-4268-8a26-f38d0347196a",
      client_id: clientId,
      frequency: scheduleData.frequency,
      email_subject: scheduleData.subject,
      email_body: scheduleData.content,
      email_to: scheduleData.email,
      next_send_date: scheduleData.sendDate,
      due_date: form.value.dueDate,
      invoice_date: form.value.invoiceDate,
      items: form.value.lineItems,
      subtotal: form.value.subtotal,
      tax_amount: form.value.tax,
      total: form.value.total,
    });
    if (error) throw error;
    window.toaster("Success", "Invoice saved");
    router.push("/dashboard?tab=invoice");
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
    client_id: clientId, // ✅ Matches 2nd SQL param
    business_id: form.value.businessId || "afc3deae-d561-4268-8a26-f38d0347196a", // ✅ 3rd SQL param
    invoice_date: form.value.invoiceDate, // ✅ 4th SQL param (now before due_date)
    due_date: form.value.dueDate, // ✅ 5th SQL param
    subtotal: form.value.subtotal, // ✅ 6th SQL param
    tax_amount: form.value.tax, // ✅ 7th SQL param
    total: form.value.total, // ✅ 8th SQL param
    items: form.value.lineItems, // ✅ 9th SQL param (moved to last)
  });

  if (error) throw error;

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
    .then(() => {});

  window.toaster("Success", "Invoice saved");
  router.push("/dashboard?tab=invoice");
};

provide("goToNextStep", goToNextStep);
provide("invoiceForm", form);
</script>

<style scoped></style>
