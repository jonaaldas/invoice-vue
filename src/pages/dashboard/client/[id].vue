<template>
  <div class="flex flex-col w-full min-h-screen">
    <NavHeader current-tab="client_id" />
    <main class="flex flex-col flex-1 gap-4 p-4 md:gap-8 md:p-8">
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
                    <div class="flex justify-between items-center">
                      <span class="text-sm text-muted-foreground">Total paid invoices</span>
                      <span class="font-medium text-success">{{ stats.paidInvoiceCount }}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <!-- Paid Invoices Card -->
              <Card v-if="stats.paidInvoiceCount > 0">
                <CardHeader>
                  <CardTitle>Recent Paid Invoices</CardTitle>
                </CardHeader>
                <CardContent>
                  <div class="space-y-4">
                    <div
                      v-for="invoice in recentPaidInvoices"
                      :key="invoice.id"
                      class="flex justify-between items-center">
                      <div class="space-y-1">
                        <p class="font-medium">Invoice {{ invoice.invoice_number }}</p>
                        <p class="text-sm text-muted-foreground">Paid {{ formatDate(invoice.paid_at) }}</p>
                      </div>
                      <span class="font-medium">{{ formatCurrency(invoice.total) }}</span>
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
            <div class="space-y-4">
              <div class="flex justify-between items-center">
                <h3 class="text-lg font-medium">Client Invoices</h3>
                <Button variant="outline" @click="createNewInvoice">Create New Invoice</Button>
              </div>

              <div class="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice #</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Recurring</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead class="text-right">Amount</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow v-for="invoice in clientInvoices" :key="invoice.id">
                      <TableCell class="font-medium">{{ invoice.invoice_number }}</TableCell>
                      <TableCell>{{ formatDate(invoice.invoice_date) }}</TableCell>
                      <TableCell>{{ formatDate(invoice.due_date) }}</TableCell>
                      <TableCell>
                        <Badge :variant="getStatusVariant(invoice.status)">
                          {{ invoice.status }}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div v-if="invoice.recurring_config" class="flex items-center gap-2">
                          <Badge variant="outline">
                            {{ formatRecurringInfo(invoice.recurring_config) }}
                          </Badge>
                          <TooltipProvider v-if="invoice.recurring_config.next_send_date">
                            <Tooltip>
                              <TooltipTrigger>
                                <CalendarClock class="w-4 h-4 text-muted-foreground" />
                              </TooltipTrigger>
                              <TooltipContent>
                                Next: {{ formatDate(invoice.recurring_config.next_send_date) }}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div class="flex items-center gap-2">
                          <Badge :variant="invoice.paid_at ? 'success' : 'secondary'">
                            {{ invoice.paid_at ? "Paid" : "Unpaid" }}
                          </Badge>
                          <TooltipProvider v-if="invoice.paid_at">
                            <Tooltip>
                              <TooltipTrigger>
                                <Check class="w-4 h-4 text-success" />
                              </TooltipTrigger>
                              <TooltipContent> Paid on {{ formatDate(invoice.paid_at) }} </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </TableCell>
                      <TableCell class="text-right">{{ formatCurrency(invoice.total) }}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" @click="viewInvoice(invoice.id)">
                          <Eye class="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                    <TableRow v-if="clientInvoices.length === 0">
                      <TableCell colspan="8" class="text-center text-muted-foreground py-4">
                        No invoices found
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="activity" class="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recurring Invoice Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div class="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Config ID</TableHead>
                        <TableHead>Frequency</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Last Generated</TableHead>
                        <TableHead>Next Send Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Email To</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow v-for="config in recurringConfigs" :key="config.id">
                        <TableCell class="font-medium">{{ config.id.slice(0, 8) }}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{{ config.frequency }}</Badge>
                        </TableCell>
                        <TableCell>{{ config.duration }}</TableCell>
                        <TableCell>
                          <div class="flex items-center gap-2">
                            <span v-if="config.last_generated_date">{{ formatDate(config.last_generated_date) }}</span>
                            <span v-else class="text-muted-foreground text-sm">Not generated yet</span>
                            <TooltipProvider v-if="config.last_generated_date">
                              <Tooltip>
                                <TooltipTrigger>
                                  <CheckCircle2 v-if="config.status === 'active'" class="w-4 h-4 text-success" />
                                  <PauseCircle v-else-if="config.status === 'paused'" class="w-4 h-4 text-warning" />
                                  <XCircle v-else class="w-4 h-4 text-destructive" />
                                </TooltipTrigger>
                                <TooltipContent> Last invoice was {{ config.status }} </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div class="flex items-center gap-2">
                            <span v-if="config.next_send_date">{{ formatDate(config.next_send_date) }}</span>
                            <span v-else class="text-muted-foreground text-sm">Not scheduled</span>
                            <CalendarClock v-if="config.next_send_date" class="w-4 h-4 text-muted-foreground" />
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge :variant="getRecurringStatusVariant(config.status)">
                            {{ config.status }}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div class="flex items-center gap-2">
                            <Mail class="w-4 h-4 text-muted-foreground" />
                            {{ config.email_to }}
                          </div>
                        </TableCell>
                      </TableRow>
                      <TableRow v-if="recurringConfigs.length === 0">
                        <TableCell colspan="7" class="text-center text-muted-foreground py-4">
                          No recurring configurations found
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import NavHeader from "@/components/dashboard/nav-header.vue";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { CalendarClock, Check, CheckCircle2, Eye, Mail, MoreHorizontal, PauseCircle, XCircle } from "lucide-vue-next";
import { useRoute } from "vue-router";
import { supabase } from "@/supabase";
import type { Tables } from "../../../../database.types";

const route = useRoute();
const client = ref<Tables<"clients"> | null>(null);
const unpaidInvoices = ref<any[]>([]);
const stats = ref({
  paidAmount: 0,
  unpaidAmount: 0,
  lastInvoiceDate: null,
  paidInvoiceCount: 0,
});
const clientInvoices = ref<any[]>([]);
const recentPaidInvoices = ref<any[]>([]);
const recurringConfigs = ref<any[]>([]);

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
      } else {
        acc.paidInvoiceCount++;
      }
      if (!acc.lastInvoiceDate || invoiceDate > new Date(acc.lastInvoiceDate)) {
        acc.lastInvoiceDate = invoice.created_at;
      }
      return acc;
    },
    { paidAmount: 0, unpaidAmount: 0, lastInvoiceDate: null, paidInvoiceCount: 0 }
  );

  // Get recent paid invoices
  recentPaidInvoices.value = invoices
    .filter((invoice) => invoice.paid_at)
    .sort((a, b) => new Date(b.paid_at).getTime() - new Date(a.paid_at).getTime())
    .slice(0, 3);

  // Get unpaid invoices
  unpaidInvoices.value = invoices.filter((invoice) => !invoice.paid_at);
};

const fetchClientInvoices = async () => {
  const { data: invoices, error } = await supabase
    .from("invoices")
    .select(
      `
      *,
      recurring_config:recurring_config_id (
        frequency,
        duration,
        next_send_date,
        status
      )
    `
    )
    .eq("client_id", route.params.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching invoices:", error);
    return;
  }

  clientInvoices.value = invoices;
};

const fetchRecurringConfigs = async () => {
  const { data: configs, error } = await supabase
    .from("recurring_configs")
    .select("*")
    .eq("client_id", route.params.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching recurring configs:", error);
    return;
  }

  recurringConfigs.value = configs;
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

const formatDate = (date: string | null) => {
  if (!date) return "";

  try {
    const d = new Date(date);
    // Check if date is valid
    if (isNaN(d.getTime())) return "";

    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(d);
  } catch (e) {
    console.error("Error formatting date:", e);
    return "";
  }
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

const getStatusVariant = (status: string) => {
  switch (status) {
    case "paid":
      return "success";
    case "pending":
      return "warning";
    case "overdue":
      return "destructive";
    default:
      return "secondary";
  }
};

const formatRecurringInfo = (config: any) => {
  if (!config) return "";

  const frequency = config.frequency?.toLowerCase();
  const duration = config.duration?.toLowerCase();

  if (config.status === "completed") {
    return "Completed";
  }

  if (frequency && duration) {
    return `${frequency}/${duration}`;
  }

  return frequency || duration || "Scheduled";
};

const getRecurringStatusVariant = (status: string) => {
  switch (status) {
    case "active":
      return "success";
    case "paused":
      return "warning";
    case "completed":
      return "secondary";
    default:
      return "default";
  }
};

const openEditDialog = () => {
  // Will implement edit functionality later
  window.toaster("Error", "Edit functionality not implemented yet", "destructive");
};

const createNewInvoice = () => {
  // Navigate to invoice creation with pre-filled client
  router.push({
    path: "/dashboard",
    query: { tab: "invoice" },
  });
};

const viewInvoice = (invoiceId: string) => {
  // Will implement invoice view later
  window.toaster("Error", "Invoice view not implemented yet", "destructive");
};

onMounted(() => {
  fetchClientData();
  fetchClientStats();
  fetchClientInvoices();
  fetchRecurringConfigs();
});
</script>

<style scoped></style>
