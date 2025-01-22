<template>
  <Card class="p-6 container mx-auto max-w-screen-lg">
    <CardHeader>
      <CardTitle>Create Invoice</CardTitle>
      <CardDescription>Create a new invoice</CardDescription>
    </CardHeader>
    <CardContent>
      <!-- <ClientSelection class="col-span-12 sm:col-span-6" /> -->
      <form @submit="onSubmit" class="grid grid-cols-12 gap-4">
        <FormField v-slot="{ componentField }" name="invoiceNumber">
          <FormItem class="col-span-12 sm:col-start-8 sm:col-end-13">
            <FormLabel>Invoice Number</FormLabel>
            <FormControl>
              <Input type="number" v-bind="componentField" />
            </FormControl>
            <FormDescription> The number of the invoice. </FormDescription>
            <FormMessage />
          </FormItem>
        </FormField>
        <FormField v-slot="{ componentField }" name="invoiceDate">
          <FormItem class="col-span-12 sm:col-start-8 sm:col-end-13">
            <FormLabel>Invoice Date</FormLabel>
            <FormControl>
              <Input type="date" v-bind="componentField" />
            </FormControl>
            <FormDescription> The date the invoice is created. </FormDescription>
            <FormMessage />
          </FormItem>
        </FormField>
        <FormField v-slot="{ componentField }" name="dueDate">
          <FormItem class="col-span-12 sm:col-start-8 sm:col-end-13">
            <FormLabel>Due Date</FormLabel>
            <FormControl>
              <Input type="date" v-bind="componentField" />
            </FormControl>
            <FormDescription> The date the invoice is due. </FormDescription>
            <FormMessage />
          </FormItem>
        </FormField>

        <!-- Line Items Section -->
        <div class="col-span-12">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-medium">Line Items</h3>
            <Button type="button" variant="outline" size="sm" @click="addLineItem">
              <PlusIcon class="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </div>

          <div
            v-for="(item, index) in form.values.lineItems"
            :key="index"
            class="inline-flex items-center justify-center w-full gap-4">
            <FormField :name="`lineItems.${index}.description`" v-slot="{ componentField }">
              <FormItem class="w-[60%] h-[120px]">
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Input v-bind="componentField" placeholder="Item description" />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>

            <FormField :name="`lineItems.${index}.quantity`" v-slot="{ componentField }">
              <FormItem class="w-[15%] h-[120px]">
                <FormLabel>Quantity</FormLabel>
                <FormControl>
                  <Input type="number" v-bind="componentField" min="1" step="1" />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>

            <FormField :name="`lineItems.${index}.price`" v-slot="{ componentField }">
              <FormItem class="w-[15%] h-[120px]">
                <FormLabel>Price</FormLabel>
                <FormControl>
                  <Input type="number" v-bind="componentField" min="0" step="0.01" />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>

            <div class="w-[10%] flex">
              <Button type="button" variant="destructive" size="icon" @click="removeLineItem(index)" class="h-10 w-10">
                <TrashIcon class="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div v-if="!form.values.lineItems?.length" class="text-center p-8 border border-dashed rounded-lg">
            <p class="text-muted-foreground">No items added yet. Click the "Add Item" button to add your first item.</p>
          </div>
        </div>
        <!-- Totals Section -->
        <div class="col-span-12 ml-auto">
          <div class="w-full flex flex-row items-center mt-2 gap-2">
            <span class="font-medium">Subtotal</span>
            <span class="ml-auto">{{ formatCurrency(calculateSubtotal) }}</span>
          </div>

          <div class="w-full flex flex-row items-center mt-2">
            <span class="font-medium">Tax</span>
            <span class="ml-auto">{{ formatCurrency(calculateTax) }}</span>
          </div>
          
          <div class="w-full flex flex-row items-center mt-2">
            <span class="font-medium">Total</span>
            <span class="ml-auto text-lg font-bold">{{ formatCurrency(calculateTotal) }}</span>
          </div>
        </div>

        <div class="flex justify-end w-full">
          <Button type="submit">Next</Button>
        </div>
      </form>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { computed, ref, inject, defineEmits } from "vue";
// import { format } from "date-fns";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../components/ui/card";
import { Input } from "../components/ui/input";
// import { Label } from "../components/ui/label";
import { Button } from "../components/ui/button";
import ClientSelection from "./client_selection.vue";
// import { Popover, PopoverContent, PopoverTrigger } from "../components/ui/popover";
// import { Calendar } from "../components/ui/calendar";
import { PlusIcon, TrashIcon } from "lucide-vue-next";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "../components/ui/form";
import { Client } from "../db/schema";
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";
import { useForm } from "vee-validate";

interface LineItem {
  description: string;
  quantity: number;
  price: number;
}

const clientSchema = z.object({
  id: z.string(),
  accountId: z.string(),
  businessId: z.string(),
  name: z.string(),
  email: z.string(),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
  taxType: z.string().optional(),
  currency: z.string(),
  nextInvoiceNumber: z.number(),
});

const client = ref<Client>({});
const taxRate = ref(10); // Default tax rate, can be made dynamic based on client/settings

const formSchema = toTypedSchema(
  z.object({
    invoiceNumber: z.number().min(1, "Invoice number is required"),
    invoiceDate: z.string(),
    dueDate: z.string(),
    lineItems: z.array(
      z.object({
        description: z.string().min(1, "Description is required"),
        quantity: z.number().min(1, "Quantity must be at least 1"),
        price: z.number().min(0, "Price must be positive"),
      })
    ) as unknown as z.ZodType<LineItem[]>,
  })
);


const totalSchema = z.object({
  subtotal: z.number().min(0.1, "Subtotal is required"),
  tax: z.number().min(0, "Tax is required"),
  total: z.number().min(0.1, "Total is required"),
})

const form = useForm({
  validationSchema: formSchema,
});

form.setFieldValue("lineItems", [{ description: "", quantity: 1, price: 0 }]);


const addLineItem = () => {
  const currentItems = form.values.lineItems || [];
  form.setFieldValue("lineItems", [
    ...currentItems,
    {
      description: "",
      quantity: 1,
      price: 0,
    },
  ]);
};

const removeLineItem = (index: number) => {
  const currentItems = form.values.lineItems || [];
  if (currentItems.length === 1) {
    form.setFieldValue("lineItems", []);
  } else {
    form.setFieldValue(
      "lineItems",
      currentItems.filter((_, i) => i !== index)
    );
  }
};

const calculateSubtotal = computed(() => {
  return form.values.lineItems.reduce((sum, item) => {
    return sum + item.quantity * item.price;
  }, 0);
});

const calculateTax = computed(() => {
  return Number((calculateSubtotal.value * (taxRate.value / 100)).toFixed(2));
});

const calculateTotal = computed(() => {
  return calculateSubtotal.value + calculateTax.value;
});

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
};

const emit = defineEmits(["form-data"]);

const onSubmit = form.handleSubmit((values) => {
  const totalValidation = totalSchema.safeParse({
    subtotal: calculateSubtotal.value,
    tax: calculateTax.value,
    total: calculateTotal.value,
  });

  if (!totalValidation.success) {
    console.error('Total validation failed:', totalValidation.error);
    return;
  }
  
  emit('form-data', {
    ...values,
    subtotal: calculateSubtotal.value,
    tax: calculateTax.value,
    total: calculateTotal.value
  })
});

const goToNextStep = inject('goToNextStep') as () => void;
</script>

<style scoped></style>
