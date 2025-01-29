import { syncStripeDataToRedis } from "../../../lib/stripe/sync_stripe_data_redis.js";
import { User } from "../../../lib/supabase/supabase.js";
import { getRedis } from "../../../lib/redis/redis.js";
import { Request, Response } from "express";

const redis = getRedis();

interface CustomRequest extends Request {
  user: User;
}

export async function get(req: any, res: Response) {
  const user = req.user;
  const stripeCustomerId = (await redis.get(`stripe:user:${user.id}`)) as string;
  if (!stripeCustomerId) {
    console.log("Failed");
    return res.json({ success: false });
  }

  await syncStripeDataToRedis(stripeCustomerId);
  console.log("success");
  return res.json({ success: true });
}
