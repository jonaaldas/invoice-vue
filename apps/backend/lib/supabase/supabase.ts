import { createClient, type User } from "@supabase/supabase-js";
import { config } from "dotenv";
config();

let supabase: any;
const getSupabase = () => {
  if (supabase) {
    return supabase;
  }

  supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);

  return supabase;
};

export { getSupabase, User };
