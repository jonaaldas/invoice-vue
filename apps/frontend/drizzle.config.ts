import { defineConfig } from "drizzle-kit";
console.log(process.env.VITE_DATABASE_URL);
export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./supabase/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.VITE_DATABASE_URL!,
  },
});
