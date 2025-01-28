import { Request, Response } from "express";
import { User } from "../../../lib/supabase/supabase";
import { getStripe } from "../../../lib/stripe/stripe";
const stripe = getStripe();

// Define custom interface extending Express Request
interface CustomRequest extends Request {
  token?: string;
  user: User;
}

export const post = async (req: CustomRequest, res: Response) => {
  try {
    const userData = {
      name: `${req.user.user_metadata.first_name} ${req.user.user_metadata.last_name}`,
      email: req.user.email,
    };

    res.json(userData);
    // const customer = await stripe.customers.create({ ...userData });
    // return res.json({ customer });
  } catch (error) {
    console.error("Error generating customer:", error);
    return res.status(500).json({ error: "Failed to generate customer" });
  }
};
