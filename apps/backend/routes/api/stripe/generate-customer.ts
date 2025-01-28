import { Request, Response } from "express";

export const post = async (req: Request, res: Response) => {
  try {
    // Your Stripe customer generation logic will go here
    return res.json({ message: "Customer generation endpoint 123123" });
  } catch (error) {
    console.error("Error generating customer:", error);
    return res.status(500).json({ error: "Failed to generate customer" });
  }
};
