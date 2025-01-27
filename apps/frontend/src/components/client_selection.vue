<template>
  <div v-if="!selectedClient" :class="cn('w-full', props.class)">
    <Popover v-model:open="open" class="w-full">
      <PopoverTrigger as-child class="w-full">
        <Button variant="outline" role="combobox" class="justify-between w-full">
          Client Selection
          <ChevronsUpDown class="ml-2 w-4 h-4 opacity-50 shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent class="w-[var(--radix-popover-trigger-width)] p-0">
        <Command class="w-full">
          <CommandInput placeholder="Search customer..." />
          <CommandEmpty>
            <p class="p-2 text-sm text-muted-foreground">No customer found.</p>
            <Button variant="outline" class="justify-start w-full" @click="openClientDialog()">
              <UserPlus class="mr-2 w-4 h-4" />
              Add new customer
            </Button>
          </CommandEmpty>
          <CommandList>
            <CommandGroup>
              <CommandItem
                v-for="client in clients"
                :key="client.id"
                :value="client.name"
                @select="
                  () => {
                    $emit('select', client);
                    selectedClient = client;
                  }
                ">
                <Check :class="cn('mr-2 h-4 w-4', selectedClientId === client.id ? 'opacity-100' : 'opacity-0')" />
                <Check :class="cn('mr-2 h-4 w-4', selectedClientId === client.id ? 'opacity-100' : 'opacity-0')" />
                <div class="flex flex-col">
                  <span>{{ client.name }}</span>
                  <span class="text-sm text-muted-foreground">{{ client.email }}</span>
                  <!-- <span v-if="client.taxType !== 'none'" class="text-xs text-muted-foreground">
                    {{ client.taxType.toUpperCase() }}
                  </span> -->
                </div>
                <div class="flex gap-2 ml-auto">
                  <Button variant="ghost" size="icon" @click.stop="editClient(client)">
                    <Pencil class="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" @click.stop="deleteClient(client.id)">
                    <Trash class="w-4 h-4" />
                  </Button>
                </div>
              </CommandItem>
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup>
              <CommandItem value="add-new">
                <UserPlus class="mr-2 w-4 h-4" />
                <Button variant="ghost" @click="openClientDialog()">Add new customer</Button>
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  </div>
  <div v-if="selectedClient" class="col-span-12 w-full rounded-lg p-:3 sm:col-span-6 sm:p-4 bg-card">
    <div class="flex flex-col gap-3 mb-4 sm:flex-row sm:justify-between sm:items-start sm:gap-0">
      <div class="space-y-1">
        <h3 class="text-base font-semibold sm:text-lg">{{ selectedClient.name }}</h3>
        <p class="text-sm text-muted-foreground">{{ selectedClient.email }}</p>
        <p v-if="selectedClient.phone" class="text-sm text-muted-foreground">{{ selectedClient.phone }}</p>
      </div>
      <Button variant="outline" size="sm" class="w-full sm:w-auto" @click="selectedClient = undefined"
        >Change Client</Button
      >
    </div>

    <div class="grid gap-6 sm:gap-4 sm:grid-cols-2">
      <div class="space-y-3 sm:space-y-2">
        <h4 class="text-sm font-medium">Address</h4>
        <div class="space-y-1 text-sm text-muted-foreground">
          <p>{{ selectedClient.address || "No address provided" }}</p>
          <p v-if="selectedClient.city || selectedClient.state || selectedClient.postal_code">
            {{ [selectedClient.city, selectedClient.state, selectedClient.postal_code].filter(Boolean).join(", ") }}
          </p>
          <p>{{ selectedClient.country || "" }}</p>
        </div>
      </div>

      <div class="space-y-3 sm:space-y-2">
        <h4 class="text-sm font-medium">Billing Information</h4>
        <div class="space-y-1 text-sm text-muted-foreground">
          <p>Tax Type: {{ selectedClient.tax_type?.toUpperCase() || "None" }}</p>
          <p>
            Currency:
            {{ commonCurrencies.find((c) => c.code === selectedClient.currency)?.name || selectedClient.currency }}
          </p>
        </div>
      </div>
    </div>
  </div>
  <!-- dialog -->
  <Dialog v-model:open="clientDialog">
    <DialogContent class="sm:max-h-[90%] overflow-hidden max-w-screen-xl">
      <DialogHeader>
        <DialogTitle>{{ isEditing ? "Edit Client" : "Add New Client" }}</DialogTitle>
        <DialogDescription>{{
          isEditing ? "Update client information" : "Add a new client to your list"
        }}</DialogDescription>
      </DialogHeader>
      <div class="overflow-auto h-[500px]">
        <form id="client-form" @submit.prevent="handleSubmit" class="p-4 mx-auto w-full max-w-6xl">
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

              <FormField v-slot="{ componentField }" name="city">
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <FormControl>
                    <Input v-bind="componentField" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </FormField>
            </div>

            <!-- Second Column -->
            <div class="flex-1 mt-4 space-y-4 md:mt-0">
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

              <FormField v-slot="{ componentField }" name="country">
                <FormItem>
                  <FormLabel>Country</FormLabel>
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
                        <SelectItem value="tax">TAX</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </FormField>

              <FormField v-slot="{ componentField }" name="currency">
                <FormItem>
                  <FormLabel>Currency</FormLabel>
                  <FormControl>
                    <Select v-bind="componentField">
                      <SelectTrigger>
                        <SelectValue placeholder="Select tax type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem v-for="currency in commonCurrencies" :key="currency.code" :value="currency.code">
                          {{ currency.name }}
                        </SelectItem>
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
        <Button type="submit" form="client-form">{{ isEditing ? "Update" : "Create" }}</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../components/ui/dialog";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import type { Tables } from "../../database.types";
import { Check, UserPlus, Pencil, Trash, ChevronsUpDown } from "lucide-vue-next";
import { cn } from "@/lib/utils";
import { supabase } from "../supabase";
import { useAuthStore } from "../stores/auth";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "../components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "../components/ui/popover";
import { HTMLAttributes } from "vue";
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";
import { useForm } from "vee-validate";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "../components/ui/form";

const clients = ref<Tables<"clients">[]>([]);
const selectedClient = ref<Tables<"clients">>();

const commonCurrencies = [
  { code: "USD", name: "United States Dollar" },
  { code: "EUR", name: "Euro" },
  { code: "JPY", name: "Japanese Yen" },
  { code: "GBP", name: "British Pound Sterling" },
  { code: "AUD", name: "Australian Dollar" },
  { code: "CAD", name: "Canadian Dollar" },
  { code: "CHF", name: "Swiss Franc" },
  { code: "CNY", name: "Chinese Yuan" },
  { code: "SEK", name: "Swedish Krona" },
  { code: "NZD", name: "New Zealand Dollar" },
  { code: "KRW", name: "South Korean Won" },
  { code: "SGD", name: "Singapore Dollar" },
  { code: "NOK", name: "Norwegian Krone" },
  { code: "MXN", name: "Mexican Peso" },
  { code: "INR", name: "Indian Rupee" },
  { code: "RUB", name: "Russian Ruble" },
  { code: "ZAR", name: "South African Rand" },
  { code: "HKD", name: "Hong Kong Dollar" },
  { code: "BRL", name: "Brazilian Real" },
  { code: "TRY", name: "Turkish Lira" },
  { code: "TWD", name: "New Taiwan Dollar" },
  { code: "DKK", name: "Danish Krone" },
  { code: "PLN", name: "Polish Złoty" },
  { code: "THB", name: "Thai Baht" },
  { code: "IDR", name: "Indonesian Rupiah" },
  { code: "HUF", name: "Hungarian Forint" },
  { code: "CZK", name: "Czech Koruna" },
  { code: "ILS", name: "Israeli New Shekel" },
  { code: "AED", name: "United Arab Emirates Dirham" },
  { code: "SAR", name: "Saudi Riyal" },
  { code: "MYR", name: "Malaysian Ringgit" },
  { code: "PHP", name: "Philippine Peso" },
  { code: "CLP", name: "Chilean Peso" },
  { code: "ARS", name: "Argentine Peso" },
  { code: "COP", name: "Colombian Peso" },
  { code: "EGP", name: "Egyptian Pound" },
  { code: "NGN", name: "Nigerian Naira" },
  { code: "PKR", name: "Pakistani Rupee" },
  { code: "BDT", name: "Bangladeshi Taka" },
  { code: "VND", name: "Vietnamese Đồng" },
  { code: "KWD", name: "Kuwaiti Dinar" },
  { code: "QAR", name: "Qatari Riyal" },
  { code: "OMR", name: "Omani Rial" },
  { code: "BHD", name: "Bahraini Dinar" },
];

const props = withDefaults(
  defineProps<{
    selectedClientId?: string;
    class?: HTMLAttributes["class"];
  }>(),
  {
    open: true,
    modelValue: "",
  }
);

const emit = defineEmits<{
  (e: "select", client: Tables<"clients">): void;
  (e: "add-customer"): void;
}>();

const authStore = useAuthStore();
const clientDialog = ref(false);
const isEditing = ref(false);
const clientSchema = toTypedSchema(
  z.object({
    name: z
      .string({
        required_error: "Name is required",
        invalid_type_error: "Name is invalid",
      })
      .min(1, "Name is required"),
    email: z.string().email("Invalid email address").min(1, "Email is required"),
    phone: z.string().nullable().optional(),
    address: z.string().nullable().optional(),
    city: z.string().nullable().optional(),
    state: z.string().nullable().optional(),
    postal_code: z.string().nullable().optional(),
    country: z.string().nullable().optional(),
    tax_type: z.enum(["none", "vat", "tax"]),
    currency: z.enum(commonCurrencies.map((currency) => currency.code)),
  })
);

const form = useForm({
  validationSchema: clientSchema,
});

const resetForm = () => {
  isEditing.value = false;
};

const openClientDialog = () => {
  resetForm();
  clientDialog.value = true;
};

const closeClientDialog = () => {
  clientDialog.value = false;
  resetForm();
};

const editClient = (client: Tables<"clients">) => {
  isEditing.value = true;
  clientDialog.value = true;
};

const handleSubmit = form.handleSubmit(async (values) => {
  console.log("🚀 ~ handleSubmit ~ values:", values);
  try {
    if (!authStore.user) throw new Error("User not authenticated");

    const clientData = {
      ...values,
      account_id: authStore.user.id,
    };
    console.log(clientData);

    if (isEditing.value && values.value.id) {
      const { error } = await supabase.from("clients").update(clientData).eq("id", values.id);

      if (error) throw error;
    } else {
      const { error } = await supabase
        .from("clients")
        .insert([{ ...clientData, id: crypto.randomUUID(), business_id: "afc3deae-d561-4268-8a26-f38d0347196a" }]);

      if (error) throw error;
    }

    closeClientDialog();
    // Emit event to refresh client list
    emit("add-customer", clientData);
  } catch (error) {
    console.error("Error saving client:", error);
  }
});

const deleteClient = async (clientId: string) => {
  try {
    const { error } = await supabase.from("clients").delete().eq("id", clientId);

    if (error) throw error;
    // Emit event to refresh client list
    emit("add-customer");
  } catch (error) {
    console.error("Error deleting client:", error);
  }
};

const getAllClientData = async (account_id: string) => {
  const { data, error } = await supabase.from("clients").select("*").eq("account_id", account_id);
  if (error) throw error;
  return data;
};

onMounted(async () => {
  const clientData = await getAllClientData(authStore.user.id);
  if (clientData) {
    clients.value = clientData;
  }
});
</script>

<style scoped></style>
