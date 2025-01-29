import { Request, Response } from "express";
import { User } from "../../../lib/supabase/supabase.js";
import { getStripe } from "../../../lib/stripe/stripe.js";
import { getRedis } from "../../../lib/redis/redis.js";
import Stripe from "stripe";

const stripe = getStripe();
const redis = getRedis();

// Define custom interface extending Express Request
interface CustomRequest extends Request {
  token?: string;
  user: User;
}

export async function post(req: CustomRequest, res: Response) {
  try {
    const user = req.user;
    // const userData = {
    //   name: `${user.user_metadata.first_name} ${user.user_metadata.last_name}`,
    //   email: user.email,
    // };

    let stripeCustomerId = await redis.get(`stripe:user:${user.id}`);
    if (!stripeCustomerId) {
      const newCustomer = await stripe.customers.create({
        email: user.email,
        metadata: {
          userId: user.id,
        },
      });

      await redis.set(`stripe:user:${user.id}`, newCustomer.id);
      stripeCustomerId = newCustomer.id;
    }
    const checkout = await stripe.checkout.sessions.create({
      customer: stripeCustomerId as string,
      mode: "subscription",
      line_items: [
        {
          price: "price_1QmCSJII4osGGYGeZ7Hizd3g",
          quantity: 1,
        },
      ],
      success_url: `${process.env.CLIENT_URL}/success`,
      cancel_url: `${process.env.CLIENT_URL}/cancel`,
    } as Stripe.Checkout.SessionCreateParams);

    return res.json({ success: true, checkoutUrl: checkout.url });
  } catch (error) {
    console.error("Error generating customer:", error);
    return res.status(500).json({ error: "Failed to generate customer" });
  }
};
