<template>
      <pre>
    {{ form }}
  </pre>
  <div class="container mx-auto max-w-screen-lg flex flex-col gap-4">
    <Stepper class="flex w-full items-start gap-2" v-model="stepIndex">
      <StepperItem
        v-for="step in steps"
        :key="step.step"
        v-slot="{ state }"
        class="relative flex w-full flex-col items-center justify-center"
        :step="step.step">
        <StepperSeparator
          v-if="step.step !== steps[steps.length - 1].step"
          class="absolute left-[calc(50%+20px)] right-[calc(-50%+10px)] top-5 block h-0.5 shrink-0 rounded-full bg-muted group-data-[state=completed]:bg-primary" />

        <StepperTrigger as-child>
          <Button
            :variant="state === 'completed' || state === 'active' ? 'default' : 'outline'"
            size="icon"
            class="z-10 rounded-full shrink-0 pointer-events-none"
            :class="[state === 'active' && 'ring-2 ring-ring ring-offset-2 ring-offset-background']">
            <CheckIcon v-if="state === 'completed'" class="size-5" />
            <CircleIcon v-if="state === 'active'" />
            <DotIcon v-if="state === 'inactive'" />
          </Button>
        </StepperTrigger>

        <div class="mt-5 flex flex-col items-center text-center">
          <StepperTitle
            :class="[state === 'active' && 'text-primary']"
            class="text-sm font-semibold transition lg:text-base">
            {{ step.title }}
          </StepperTitle>
          <StepperDescription
            :class="[state === 'active' && 'text-primary']"
            class="sr-only text-xs text-muted-foreground transition md:not-sr-only lg:text-sm">
            {{ step.description }}
          </StepperDescription>
        </div>
      </StepperItem>
    </Stepper>
    <template v-if="stepIndex === 1">
        <CreateInvoice @form-data="handleFormPopulate" />
    </template>
    <template v-if="stepIndex === 2">
      <InvoicePreview @schedule-email="handleEmailSchedule" />
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, provide, computed } from "vue";
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

function handleStepChange(index: number) {
  stepIndex.value = index;
}

function goToNextStep() {
  if (stepIndex.value < steps.length) {
    stepIndex.value++;
  }
}

function handleFormPopulate(formValues: any) {
  form.value = formValues;
  goToNextStep();
}

function handleEmailSchedule(scheduleData: any) {
  emailSchedule.value = scheduleData;
  console.log('Email scheduled:', scheduleData);
  // TODO: Implement actual email scheduling logic
}

provide('goToNextStep', goToNextStep);
provide('invoiceForm', form);
</script>

<style scoped></style>
