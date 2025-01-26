<template>
  <div class="container py-10 mx-auto">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-3xl font-bold tracking-tight">{{ client?.name }}</h2>
      <div class="flex gap-2">
        <Button variant="outline" @click="openEditDialog">Edit customer</Button>
        <Button variant="ghost" size="icon">
          <MoreHorizontal class="w-4 h-4" />
        </Button>
      </div>
    </div>

    <Tabs default-value="overview" class="w-full">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="invoices">Invoices</TabsTrigger>
        <TabsTrigger value="activity">Activity</TabsTrigger>
      </TabsList>
      <TabsContent value="overview" class="space-y-8">
        <div class="grid gap-8 md:grid-cols-2">
          <!-- Contact Info Card -->
          <Card>
            <CardHeader>
              <CardTitle>Primary Contact</CardTitle>
            </CardHeader>
            <CardContent>
              <div class="space-y-4">
                <div class="flex flex-col">
                  <span class="text-sm text-muted-foreground">Email</span>
                  <span>{{ client?.email }}</span>
                </div>
                <div class="flex flex-col">
                  <span class="text-sm text-muted-foreground">Phone</span>
                  <span>{{ client?.phone || "Not provided" }}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <!-- Billing Address Card -->
          <Card>
            <CardHeader>
              <CardTitle>Billing Address</CardTitle>
            </CardHeader>
            <CardContent>
              <div class="space-y-2">
                <p>{{ client?.address || "No address provided" }}</p>
                <p v-if="client?.city || client?.state || client?.postal_code">
                  {{ [client?.city, client?.state, client?.postal_code].filter(Boolean).join(", ") }}
                </p>
              </div>
            </CardContent>
          </Card>

          <!-- Billing Overview Card -->
          <Card>
            <CardHeader>
              <CardTitle>Billing Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div class="grid gap-4">
                <div class="flex justify-between items-center">
                  <span class="text-sm text-muted-foreground">Paid last 12 months</span>
                  <span class="font-medium">{{ formatCurrency(stats.paidAmount) }}</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-sm text-muted-foreground">Total unpaid</span>
                  <span class="font-medium text-destructive">{{ formatCurrency(stats.unpaidAmount) }}</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-sm text-muted-foreground">Last invoice</span>
                  <span>{{ stats.lastInvoiceDate ? formatDate(stats.lastInvoiceDate) : "No invoices" }}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <!-- Unpaid Invoices Card -->
          <Card v-if="stats.unpaidAmount > 0">
            <CardHeader>
              <CardTitle>Unpaid Invoices</CardTitle>
            </CardHeader>
            <CardContent>
              <div class="space-y-4">
                <div v-for="invoice in unpaidInvoices" :key="invoice.id" class="flex justify-between items-center">
                  <div class="space-y-1">
                    <p class="font-medium">Invoice {{ invoice.number }}</p>
                    <p class="text-sm text-destructive">Due {{ formatDueDate(invoice.due_date) }}</p>
                  </div>
                  <span class="font-medium">{{ formatCurrency(invoice.total) }}</span>
                </div>
              </div>
              <Button class="mt-4 w-full" variant="secondary">Send Reminder</Button>
            </CardContent>
          </Card>
        </div>
      </TabsContent>
      <TabsContent value="invoices">
        <!-- Invoices tab content will go here -->
      </TabsContent>
      <TabsContent value="activity">
        <!-- Activity tab content will go here -->
      </TabsContent>
    </Tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MoreHorizontal } from "lucide-vue-next";
import { supabase } from "@/supabase";
import type { Tables } from "@/types/supabase";

const route = useRoute();
const client = ref<Tables<"clients"> | null>(null);
const unpaidInvoices = ref<any[]>([]);
const stats = ref({
  paidAmount: 0,
  unpaidAmount: 0,
  lastInvoiceDate: null,
});

const fetchClientData = async () => {
  const { data, error } = await supabase.from("clients").select("*").eq("id", route.params.id).single();

  if (error) {
    console.error("Error fetching client:", error);
    return;
  }

  client.value = data;
};

const fetchClientStats = async () => {
  const { data: invoices, error } = await supabase
    .from("invoices")
    .select("*")
    .eq("client_id", route.params.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching invoices:", error);
    return;
  }

  // Calculate stats
  const now = new Date();
  const twelveMonthsAgo = new Date(now.setMonth(now.getMonth() - 12));

  stats.value = invoices.reduce(
    (acc, invoice) => {
      const invoiceDate = new Date(invoice.created_at);
      if (invoiceDate >= twelveMonthsAgo) {
        acc.paidAmount += invoice.paid_amount || 0;
      }
      if (!invoice.paid_at) {
        acc.unpaidAmount += invoice.total;
      }
      if (!acc.lastInvoiceDate || invoiceDate > new Date(acc.lastInvoiceDate)) {
        acc.lastInvoiceDate = invoice.created_at;
      }
      return acc;
    },
    { paidAmount: 0, unpaidAmount: 0, lastInvoiceDate: null }
  );

  // Get unpaid invoices
  unpaidInvoices.value = invoices.filter((invoice) => !invoice.paid_at);
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const formatDueDate = (date: string) => {
  const dueDate = new Date(date);
  const now = new Date();
  const diffTime = dueDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return `${Math.abs(diffDays)} days ago`;
  } else if (diffDays === 0) {
    return "Today";
  } else {
    return `in ${diffDays} days`;
  }
};

const openEditDialog = () => {
  // Will implement edit functionality later
  window.toaster("Error", "Edit functionality not implemented yet", "destructive");
};

onMounted(() => {
  fetchClientData();
  fetchClientStats();
});
</script>

<style scoped></style>
