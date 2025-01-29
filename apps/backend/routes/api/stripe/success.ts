import { syncStripeDataToRedis } from "../../../lib/stripe/sync_stripe_data_redis.js";
import { User } from "../../../lib/supabase/supabase.js";
import { getRedis } from "../../../lib/redis/redis.js";
import { Request, Response } from "express";
import { getSupabase } from "../../../lib/supabase/supabase.js";

const supabase = getSupabase();
const redis = getRedis();

interface CustomRequest extends Request {
  user: User;
}

export async function get(req: any, res: Response) {
  const user = req.user;
  if (!user) {
    return res.json({ success: false });
  }
  const stripeCustomerId = (await redis.get(`stripe:user:${user.id}`)) as string;
  if (!stripeCustomerId) {
    console.log("Failed");
    return res.json({ success: false });
  }

  const subData = await syncStripeDataToRedis(stripeCustomerId);
  if (subData.status === "none") {
    return res.json({ success: false });
  }
  // we update the database here to ensure the latest data is used
  const { data, error } = await supabase.from("profiles").update({ is_paid: true }).eq("id", user.id);
  console.log("🚀 ~ syncStripeDataToRedis ~ error:", error);
  console.log("🚀 ~ syncStripeDataToRedis ~ data:", data);
  return res.json({ success: true });
}
