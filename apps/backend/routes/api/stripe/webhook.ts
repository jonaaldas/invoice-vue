import { getStripe } from "../../../lib/stripe/stripe";
import { Request, Response } from "express";
import Stripe from "stripe";
import { syncStripeDataToRedis } from "../../../lib/stripe/sync_stripe_data_redis";
// Extend the Express Request type to include rawBody
interface StripeRequest extends Request {
  rawBody?: Buffer;
}

const allowedEvents: Stripe.Event.Type[] = [
  "checkout.session.completed",
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
  "customer.subscription.paused",
  "customer.subscription.resumed",
  "customer.subscription.pending_update_applied",
  "customer.subscription.pending_update_expired",
  "customer.subscription.trial_will_end",
  "invoice.paid",
  "invoice.payment_failed",
  "invoice.payment_action_required",
  "invoice.upcoming",
  "invoice.marked_uncollectible",
  "invoice.payment_succeeded",
  "payment_intent.succeeded",
  "payment_intent.payment_failed",
  "payment_intent.canceled",
];

let stripe = getStripe();
let endpointSecret = process.env.STRIPE_WEBHOOK_KEY;

export const post = async (req: StripeRequest, res: Response) => {
  const signature = req.headers["stripe-signature"];
  if (!endpointSecret || !req.body || !signature) {
    console.log("Here");
    return res.status(400).json({ error: "Invalid configuration or missing data" });
  }

  try {
    const event = stripe.webhooks.constructEvent(
      req.body.toString(), // Use raw body as string
      signature,
      endpointSecret
    );

    await processEvent(event);
    return res.json({ received: true });
  } catch (error) {
    console.error("[STRIPE HOOK] Error processing event", error);
    return res.status(400).json({ error: "Webhook Error" });
  }
};

async function processEvent(event: Stripe.Event) {
  if (!allowedEvents.includes(event.type)) return;
  const { customer: customerId } = event?.data?.object as {
    customer: string;
  };

  if (typeof customerId !== "string") {
    throw new Error(`[STRIPE HOOK][CANCER] ID isn't string.\nEvent type: ${event.type}`);
  }

  return await syncStripeDataToRedis(customerId);
}
