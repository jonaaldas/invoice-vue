import { pgTable, serial, text, varchar, timestamp, index, integer, uuid, boolean } from "drizzle-orm/pg-core";
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  fullName: text("full_name"),
  phone: varchar("phone", { length: 256 }),
});

const dates = {
  createdAt: timestamp({ mode: "date" }),
  updatedAt: timestamp({ mode: "date" })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
  deletedAt: timestamp({ mode: "date" }),
};

// Define enum types for better type safety
export const AuthType = {
  GOOGLE: "google",
  LOCAL: "local",
} as const;

export type AuthType = (typeof AuthType)[keyof typeof AuthType];

export const PlanType = {
  BASIC: "basic",
  PRO: "pro",
  ENTERPRISE: "enterprise",
} as const;

export type PlanType = (typeof PlanType)[keyof typeof PlanType];

// Users table
export const accounts = pgTable(
  "accounts",
  {
    id: uuid().defaultRandom(),
    email: text("email").notNull().unique(),
    password: text("password"),
    authType: text("auth_type", { enum: ["google", "local"] }).notNull(),
    name: text("name").notNull(),
    avatarUrl: text("avatar_url"),
    ...dates,
  },
  (table) => ({
    emailIdx: index("idx_users_email").on(table.email),
  })
);

// Stripe customers table
export const stripeCustomers = pgTable(
  "stripe_customers",
  {
    id: uuid().defaultRandom(),
    accountId: integer("account_id")
      .notNull()
      .references(() => accounts.id),
    stripeCustomerId: text("stripe_customer_id").notNull().unique(),
    planType: text("plan_type", { enum: ["free", "paid"] }).notNull(),
    planName: text("plan_name"),
    credits: integer("credits"),
    ...dates,
  },
  (table) => ({
    accountIdIdx: index("idx_stripe_customers_account_id").on(table.accountId),
  })
);

// Password reset tokens table
export const passwordResetTokens = pgTable(
  "password_reset_tokens",
  {
    id: uuid().defaultRandom(),
    accountId: integer("account_id")
      .notNull()
      .references(() => accounts.id),
    token: text("token").notNull().unique(),
    expiresAt: timestamp({ mode: "date" }).notNull(),
    ...dates,
  },
  (table) => ({
    tokenIdx: index("idx_password_reset_tokens_token").on(table.token),
  })
);

// Types for type safety when querying
export type Account = typeof accounts.$inferSelect;
export type NewAccount = typeof accounts.$inferInsert;

export type StripeCustomer = typeof stripeCustomers.$inferSelect;
export type NewStripeCustomer = typeof stripeCustomers.$inferInsert;

export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;
export type NewPasswordResetToken = typeof passwordResetTokens.$inferInsert;

export const profiles = pgTable("profiles", {
  id: uuid().defaultRandom(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  isPaid: boolean("is_paid").notNull(),
});

// new invoice schemas
export const businessProfiles = pgTable(
  "business_profiles",
  {
    id: uuid().defaultRandom(),
    accountId: integer("account_id")
      .notNull()
      .references(() => accounts.id),
    name: text("name").notNull(),
    email: text("email").notNull(),
    phone: text("phone"),
    address: text("address"),
    taxNumber: text("tax_number"),
    defaultCurrency: text("default_currency").notNull().default("USD"),
    logoUrl: text("logo_url"),
    ...dates,
  },
  (table) => ({
    accountIdIdx: index("idx_business_profile_account_id").on(table.accountId),
  })
);

export const clients = pgTable(
  "clients",
  {
    id: uuid().defaultRandom(),
    accountId: integer("account_id")
      .notNull()
      .references(() => accounts.id),
    businessId: integer("business_id").references(() => businessProfiles.id),
    name: text("name").notNull(),
    email: text("email").notNull(),
    phone: text("phone"),
    address: text("address"),
    city: text("city"),
    state: text("state"),
    postalCode: text("postal_code"),
    country: text("country"),
    taxType: text("tax_type").notNull().default("none"),
    currency: text("currency").notNull().default("USD"),
    nextInvoiceNumber: integer("next_invoice_number").notNull().default(1),
    ...dates,
  },
  (table) => ({
    businessIdIdx: index("idx_clients_business_id").on(table.businessId),
  })
);

export const recurringConfigs = pgTable(
  "recurring_configs",
  {
    id: uuid().defaultRandom(),
    accountId: integer("account_id")
      .notNull()
      .references(() => accounts.id),
    businessId: integer("business_id")
      .notNull()
      .references(() => businessProfiles.id),
    clientId: integer("client_id")
      .notNull()
      .references(() => clients.id),
    frequency: text("frequency", { enum: ["weekly", "monthly", "quarterly", "yearly", "save", "one-time"] }),
    duration: text("duration", { enum: ["3-months", "6-months", "1-year", "indefinite", "save", "one-time"] }),
    nextSendDate: timestamp({ mode: "date" }),
    lastGeneratedDate: timestamp({ mode: "date" }),
    status: text("status", { enum: ["active", "paused", "completed", "save"] })
      .notNull()
      .default("active"),
    emailSubject: text("email_subject"),
    emailBody: text("email_body"),
    emailTo: text("email_to"),
    ...dates,
  },
  (table) => ({
    businessIdIdx: index("idx_recurring_business").on(table.businessId),
    clientIdIdx: index("idx_recurring_client").on(table.clientId),
    recurringNextSendIdx: index("idx_recurring_next_send").on(table.nextSendDate, table.status),
  })
);

export const invoices = pgTable(
  "invoices",
  {
    id: uuid().defaultRandom(),
    accountId: integer("account_id")
      .notNull()
      .references(() => accounts.id),
    businessId: integer("business_id")
      .notNull()
      .references(() => businessProfiles.id),
    clientId: integer("client_id")
      .notNull()
      .references(() => clients.id),
    recurringConfigId: integer("recurring_config_id").references(() => recurringConfigs.id),
    invoiceNumber: integer("invoice_number").notNull(),
    scheduledSendDate: timestamp({ mode: "date" }),
    invoiceDate: timestamp({ mode: "date" }).notNull(),
    dueDate: timestamp({ mode: "date" }).notNull(),
    subtotal: integer("subtotal").notNull().default(0),
    taxAmount: integer("tax_amount").default(0),
    total: integer("total").notNull().default(0),
    status: text("status", { enum: ["scheduled", "sent", "paid", "overdue", "cancelled", "saved"] })
      .notNull()
      .default("scheduled"),
    emailStatus: text("email_status", { enum: ["pending", "sent", "failed", "saved"] })
      .notNull()
      .default("pending"),
    emailError: text("email_error"),
    sentAt: timestamp({ mode: "date" }),
    paidAt: timestamp({ mode: "date" }),
    ...dates,
  },
  (table) => ({
    businessIdIdx: index("idx_invoices_business").on(table.businessId),
    clientIdIdx: index("idx_invoices_client").on(table.clientId),
    scheduledIdx: index("idx_invoices_scheduled").on(table.scheduledSendDate, table.emailStatus),
  })
);

export const invoiceItems = pgTable(
  "invoice_items",
  {
    id: uuid().defaultRandom(),
    accountId: integer("account_id")
      .notNull()
      .references(() => accounts.id),
    businessId: integer("business_id")
      .notNull()
      .references(() => businessProfiles.id),
    invoiceId: integer("invoice_id")
      .notNull()
      .references(() => invoices.id),
    description: text("description").notNull(),
    quantity: integer("quantity").notNull().default(1),
    unitPrice: integer("unit_price").notNull(),
    amount: integer("amount").notNull(),
  },
  (table) => ({
    businessIndex: index("idx_invoice_items_business").on(table.businessId),
    invoiceIndex: index("idx_invoice_items_invoice").on(table.invoiceId),
  })
);

export type BusinessProfile = typeof businessProfiles.$inferSelect;
export type NewBusinessProfile = typeof businessProfiles.$inferInsert;

export type Client = typeof clients.$inferSelect;
export type NewClient = typeof clients.$inferInsert;

export type RecurringConfig = typeof recurringConfigs.$inferSelect;
export type NewRecurringConfig = typeof recurringConfigs.$inferInsert;

export type Invoice = typeof invoices.$inferSelect;
export type NewInvoice = typeof invoices.$inferInsert;

export type InvoiceItem = typeof invoiceItems.$inferSelect;
export type NewInvoiceItem = typeof invoiceItems.$inferInsert;
