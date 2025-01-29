import express from "express";
import generateCustomerRouter from "./api/stripe/generate-customer.js";
import * as success from "./api/stripe/success.js";
import * as webhook from "./api/stripe/webhook.js";

const router = express.Router();

// Stripe routes
router.use("/stripe/generate-customer", generateCustomerRouter);
router.get("/stripe/success", success.get);
router.post("/stripe/webhook", webhook.post);

export default router;
