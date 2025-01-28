import { Stripe } from "stripe";
let stripe: Stripe;

export const getStripe = () => {
  if (stripe) {
    return stripe;
  }
  stripe = new Stripe(process.env.STRIPE_TEST_SECRET_KEY!, {
    apiVersion: "2025-01-27.acacia",
  });

  return stripe;
};
