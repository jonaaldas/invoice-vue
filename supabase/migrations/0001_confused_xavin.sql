CREATE TABLE "profiles" (
	"id" uuid DEFAULT gen_random_uuid(),
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"is_paid" boolean NOT NULL
);
