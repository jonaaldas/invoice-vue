<template>
  <div class="container py-10 mx-auto">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-3xl font-bold tracking-tight">Customers</h2>
      <div class="flex gap-2">
        <Button @click="openClientDialog">Add a customer</Button>
      </div>
    </div>

    <div class="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead class="w-[200px]">Name</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead class="text-right">Total Billed</TableHead>
            <TableHead class="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="client in filteredClients" :key="client.id" 
            class="cursor-pointer hover:bg-muted/50"
            @click="$router.push(`/dashboard/client/${client.id}`)">
            <TableCell class="font-medium">{{ client.name }}</TableCell>
            <TableCell>
              <div class="flex flex-col">
                <span>{{ client.address }}</span>
                <span>{{ client.email }}</span>
                <span class="text-sm text-muted-foreground">{{ client.phone }}</span>
              </div>
            </TableCell>
            <TableCell class="text-right">
              <div class="flex flex-col items-end">
                <span>${{ formatAmount(client.total_balance) }}</span>
                <span v-if="client.overdue_amount > 0" class="text-sm text-destructive">
                  ${{ formatAmount(client.overdue_amount) }} overdue
                </span>
              </div>
            </TableCell>
            <TableCell>
              <Button variant="ghost" size="icon">
                <ChevronDown class="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  </div>

  <!-- Add Client Dialog -->
  <Dialog v-model:open="clientDialog">
    <DialogContent class="sm:max-h-[90%] overflow-hidden">
      <DialogHeader>
        <DialogTitle>Add New Client</DialogTitle>
        <DialogDescription>Add a new client to your list</DialogDescription>
      </DialogHeader>
      <div class="overflow-auto h-[500px]">
        <form id="client-form" @submit.prevent="handleSubmit" class="p-4 mx-auto w-full">
          <div class="flex flex-col md:flex-row md:gap-6">
            <!-- First Column -->
            <div class="flex-1 space-y-4">
              <FormField v-slot="{ componentField }" name="name">
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input v-bind="componentField" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </FormField>

              <FormField v-slot="{ componentField }" name="email">
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" v-bind="componentField" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </FormField>

              <FormField v-slot="{ componentField }" name="phone">
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input type="tel" v-bind="componentField" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </FormField>

              <FormField v-slot="{ componentField }" name="address">
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input v-bind="componentField" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </FormField>
            </div>

            <!-- Second Column -->
            <div class="flex-1 mt-4 space-y-4 md:mt-0">
              <FormField v-slot="{ componentField }" name="city">
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <FormControl>
                    <Input v-bind="componentField" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </FormField>

              <FormField v-slot="{ componentField }" name="state">
                <FormItem>
                  <FormLabel>State</FormLabel>
                  <FormControl>
                    <Input v-bind="componentField" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </FormField>

              <FormField v-slot="{ componentField }" name="postal_code">
                <FormItem>
                  <FormLabel>Postal Code</FormLabel>
                  <FormControl>
                    <Input v-bind="componentField" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </FormField>

              <FormField v-slot="{ componentField }" name="tax_type">
                <FormItem>
                  <FormLabel>Tax Type</FormLabel>
                  <FormControl>
                    <Select v-bind="componentField">
                      <SelectTrigger>
                        <SelectValue placeholder="Select tax type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="vat">VAT</SelectItem>
                        <SelectItem value="gst">GST</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </FormField>
            </div>
          </div>
        </form>
      </div>
      <DialogFooter>
        <Button type="button" variant="secondary" @click="closeClientDialog">Cancel</Button>
        <Button type="submit" form="client-form">Create</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChevronDown } from "lucide-vue-next";
import { supabase } from "../../supabase";
import type { Tables } from "../../../database.types";
import { useAuthStore } from "../../stores/auth";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";

const user = useAuthStore().user;
const business = useAuthStore().business[0];
const clientDialog = ref(false);

const clients = ref<Tables<"clients">[]>([]);
const filteredClients = ref<Tables<"clients">[]>([]);

const formSchema = toTypedSchema(
  z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email address"),
    phone: z.string().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    postal_code: z.string().optional(),
    tax_type: z.string().default("none"),
  })
);

const form = useForm({
  validationSchema: formSchema,
  initialValues: {
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    postal_code: "",
    tax_type: "none",
  },
});

const openClientDialog = () => {
  clientDialog.value = true;
};

const closeClientDialog = () => {
  clientDialog.value = false;
  form.resetForm();
};

const handleSubmit = form.handleSubmit(async (values) => {
  try {
    const { data, error } = await supabase.from("clients").insert({
      ...values,
      id: crypto.randomUUID(),
      account_id: user.id,
      business_id: business.id,
      currency: "USD",
    });

    if (error) throw error;

    await fetchClients();
    closeClientDialog();
    window.toaster("Success", "Client added successfully");
  } catch (error) {
    console.error("Error saving client:", error);
    window.toaster("Error", "Failed to add client");
  }
});

const fetchClients = async () => {
  const { data, error } = await supabase
    .from("clients")
    .select("id,name, address, email, phone, invoices(total)")
    .eq("account_id", user.id);

  if (error) {
    console.error("Error fetching clients:", error);
    return;
  }

  const clientsWithTotals = data.map((client) => ({
    ...client,
    total_balance: client.invoices?.reduce((sum, invoice) => sum + (invoice.total || 0), 0) || 0,
  }));

  clients.value = clientsWithTotals;
  filteredClients.value = clientsWithTotals;
};

const formatAmount = (amount: number | null) => {
  if (!amount) return "0.00";
  return amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

onMounted(() => {
  fetchClients();
});
</script>

<style scoped></style>
