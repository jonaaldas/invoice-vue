CREATE TABLE "accounts" (
	"id" uuid DEFAULT gen_random_uuid(),
	"email" text NOT NULL,
	"password" text,
	"auth_type" text NOT NULL,
	"name" text NOT NULL,
	"avatar_url" text,
	"createdAt" timestamp,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"deletedAt" timestamp,
	CONSTRAINT "accounts_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "business_profiles" (
	"id" uuid DEFAULT gen_random_uuid(),
	"account_id" integer NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"address" text,
	"tax_number" text,
	"default_currency" text DEFAULT 'USD' NOT NULL,
	"logo_url" text,
	"createdAt" timestamp,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"deletedAt" timestamp
);
--> statement-breakpoint
CREATE TABLE "clients" (
	"id" uuid DEFAULT gen_random_uuid(),
	"account_id" integer NOT NULL,
	"business_id" integer,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"address" text,
	"street_address" text,
	"city" text,
	"state" text,
	"postal_code" text,
	"country" text,
	"tax_type" text DEFAULT 'none' NOT NULL,
	"currency" text DEFAULT 'USD' NOT NULL,
	"next_invoice_number" integer DEFAULT 1 NOT NULL,
	"createdAt" timestamp,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"deletedAt" timestamp
);
--> statement-breakpoint
CREATE TABLE "invoice_items" (
	"id" uuid DEFAULT gen_random_uuid(),
	"account_id" integer NOT NULL,
	"business_id" integer NOT NULL,
	"invoice_id" integer NOT NULL,
	"description" text NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"unit_price" integer NOT NULL,
	"amount" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invoices" (
	"id" uuid DEFAULT gen_random_uuid(),
	"account_id" integer NOT NULL,
	"business_id" integer NOT NULL,
	"client_id" integer NOT NULL,
	"recurring_config_id" integer,
	"invoice_number" integer NOT NULL,
	"scheduledSendDate" timestamp,
	"invoiceDate" timestamp NOT NULL,
	"dueDate" timestamp NOT NULL,
	"subtotal" integer DEFAULT 0 NOT NULL,
	"tax_amount" integer DEFAULT 0,
	"total" integer DEFAULT 0 NOT NULL,
	"status" text DEFAULT 'scheduled' NOT NULL,
	"email_status" text DEFAULT 'pending' NOT NULL,
	"email_error" text,
	"sentAt" timestamp,
	"paidAt" timestamp,
	"createdAt" timestamp,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"deletedAt" timestamp
);
--> statement-breakpoint
CREATE TABLE "password_reset_tokens" (
	"id" uuid DEFAULT gen_random_uuid(),
	"account_id" integer NOT NULL,
	"token" text NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"createdAt" timestamp,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"deletedAt" timestamp,
	CONSTRAINT "password_reset_tokens_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "recurring_configs" (
	"id" uuid DEFAULT gen_random_uuid(),
	"account_id" integer NOT NULL,
	"business_id" integer NOT NULL,
	"client_id" integer NOT NULL,
	"frequency" text,
	"duration" text,
	"nextSendDate" timestamp,
	"lastGeneratedDate" timestamp,
	"status" text DEFAULT 'active' NOT NULL,
	"email_subject" text,
	"email_body" text,
	"email_to" text,
	"createdAt" timestamp,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"deletedAt" timestamp
);
--> statement-breakpoint
CREATE TABLE "stripe_customers" (
	"id" uuid DEFAULT gen_random_uuid(),
	"account_id" integer NOT NULL,
	"stripe_customer_id" text NOT NULL,
	"plan_type" text NOT NULL,
	"plan_name" text,
	"credits" integer,
	"createdAt" timestamp,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"deletedAt" timestamp,
	CONSTRAINT "stripe_customers_stripe_customer_id_unique" UNIQUE("stripe_customer_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"full_name" text,
	"phone" varchar(256)
);
--> statement-breakpoint
ALTER TABLE "business_profiles" ADD CONSTRAINT "business_profiles_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clients" ADD CONSTRAINT "clients_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clients" ADD CONSTRAINT "clients_business_id_business_profiles_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."business_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoice_items" ADD CONSTRAINT "invoice_items_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoice_items" ADD CONSTRAINT "invoice_items_business_id_business_profiles_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."business_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoice_items" ADD CONSTRAINT "invoice_items_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_business_id_business_profiles_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."business_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_recurring_config_id_recurring_configs_id_fk" FOREIGN KEY ("recurring_config_id") REFERENCES "public"."recurring_configs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recurring_configs" ADD CONSTRAINT "recurring_configs_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recurring_configs" ADD CONSTRAINT "recurring_configs_business_id_business_profiles_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."business_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recurring_configs" ADD CONSTRAINT "recurring_configs_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stripe_customers" ADD CONSTRAINT "stripe_customers_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_users_email" ON "accounts" USING btree ("email");--> statement-breakpoint
CREATE INDEX "idx_business_profile_account_id" ON "business_profiles" USING btree ("account_id");--> statement-breakpoint
CREATE INDEX "idx_clients_business_id" ON "clients" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "idx_invoice_items_business" ON "invoice_items" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "idx_invoice_items_invoice" ON "invoice_items" USING btree ("invoice_id");--> statement-breakpoint
CREATE INDEX "idx_invoices_business" ON "invoices" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "idx_invoices_client" ON "invoices" USING btree ("client_id");--> statement-breakpoint
CREATE INDEX "idx_invoices_scheduled" ON "invoices" USING btree ("scheduledSendDate","email_status");--> statement-breakpoint
CREATE INDEX "idx_password_reset_tokens_token" ON "password_reset_tokens" USING btree ("token");--> statement-breakpoint
CREATE INDEX "idx_recurring_business" ON "recurring_configs" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "idx_recurring_client" ON "recurring_configs" USING btree ("client_id");--> statement-breakpoint
CREATE INDEX "idx_recurring_next_send" ON "recurring_configs" USING btree ("nextSendDate","status");--> statement-breakpoint
CREATE INDEX "idx_stripe_customers_account_id" ON "stripe_customers" USING btree ("account_id");