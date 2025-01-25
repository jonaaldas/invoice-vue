<template>
  <Card class="container p-6 mx-auto max-w-screen-lg">
    <CardHeader>
      <CardTitle>Create Invoice</CardTitle>
      <CardDescription>Create a new invoice</CardDescription>
    </CardHeader>
    <CardContent>
      <form id="invoiceForm" @submit.prevent="onSubmit" class="grid grid-cols-12 gap-4">
        <div class="flex flex-col col-span-12 gap-4 sm:col-start-1 sm:col-end-5">
          <ClientSelection class="col-span-12 sm:col-start-1 sm:col-end-5" @select="handleClientSelection" />
          <div v-if="Object.keys(client).length == 0" class="text-small text-red">Please select a client</div>
        </div>
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
          <div class="flex justify-between items-center">
            <h3 class="text-lg font-medium">Line Items</h3>
            <Button type="button" variant="outline" size="sm" @click="addLineItem">
              <PlusIcon class="mr-2 w-4 h-4" />
              Add Item
            </Button>
          </div>

          <div
            v-for="(_, index) in form.values.lineItems"
            :key="index"
            class="inline-flex gap-4 justify-center items-center w-full">
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
              <Button type="button" variant="destructive" size="icon" @click="removeLineItem(index)" class="w-10 h-10">
                <TrashIcon class="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div v-if="!form.values.lineItems?.length" class="p-8 text-center rounded-lg border border-dashed">
            <p class="text-muted-foreground">No items added yet. Click the "Add Item" button to add your first item.</p>
          </div>
        </div>
        <!-- Totals Section -->
        <div class="col-span-12 ml-auto">
          <div class="flex flex-row gap-2 items-center mt-2 w-full">
            <span class="font-medium">Subtotal</span>
            <span class="ml-auto">{{ formatCurrency(calculateSubtotal) }}</span>
          </div>

          <div class="flex flex-row items-center mt-2 w-full">
            <span class="font-medium">Tax</span>
            <span class="ml-auto">{{ formatCurrency(calculateTax) }}</span>
          </div>

          <div class="flex flex-row items-center mt-2 w-full">
            <span class="font-medium">Total</span>
            <span class="ml-auto text-lg font-bold">{{ formatCurrency(calculateTotal) }}</span>
          </div>
        </div>
      </form>
    </CardContent>
  </Card>

  <div class="flex justify-end w-full">
    <Button type="submit" form="invoiceForm">Next</Button>
  </div>
</template>

<script setup lang="ts">
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import ClientSelection from "./client_selection.vue";
// import { Popover, PopoverContent, PopoverTrigger } from "../components/ui/popover";
// import { Calendar } from "../components/ui/calendar";
import { PlusIcon, TrashIcon } from "lucide-vue-next";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "../components/ui/form";
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";
import { useForm } from "vee-validate";
import type { Tables } from "../../database.types";

interface LineItem {
  description: string;
  quantity: number;
  price: number;
}

const clientSchema: z.ZodType<Tables<"clients">> = z.object({
  account_id: z.string(),
  business_id: z.string().nullable(),
  name: z.string(),
  email: z.string(),
  currency: z.string(),
  next_invoice_number: z.number(),
  phone: z.string().nullable(),
  address: z.string().nullable(),
  street_address: z.string().nullable(),
  city: z.string().nullable(),
  state: z.string().nullable(),
  postal_code: z.string().nullable(),
  country: z.string().nullable(),
  tax_type: z.string(),
});

const client = ref<Tables<"clients">>({});
const taxRate = ref(10);

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
});

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
      currentItems.filter((_: LineItem, i: number) => i !== index)
    );
  }
};

const calculateSubtotal = computed(() => {
  return form.values.lineItems.reduce((sum: number, item: LineItem) => {
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
  console.log("Hey");
  const totalValidation = totalSchema.safeParse({
    subtotal: calculateSubtotal.value,
    tax: calculateTax.value,
    total: calculateTotal.value,
  });
  // check for client validation
  const validation = clientSchema.safeParse(client.value);

  if (!totalValidation.success || !validation.success) {
    console.error("Total or client validation failed:", totalValidation.error, validation.error);
    return;
  }

  emit("form-data", {
    ...values,
    subtotal: calculateSubtotal.value,
    tax: calculateTax.value,
    total: calculateTotal.value,
    client: client.value,
  });
});

const handleClientSelection = (value: Tables<"clients">) => {
  client.value = value;
};

watch(client, () => {
  if (client.value) {
    console.log("Client changed:", client.value);
    form.setFieldValue("invoiceNumber", client.value.next_invoice_number);
  }
});
</script>

<style scoped></style>
