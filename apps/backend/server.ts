import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { createRouter } from "express-file-routing";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import dotenv from "dotenv";
import { authenticateToken } from "./middleware/auth.js";
import { api } from "@invoice/shared";
import { config } from "dotenv";
import { getSupabase } from "./lib/supabase/supabase.js";

const supabase = getSupabase();

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface CustomRequest extends express.Request {
  user?: any;
}

async function startServer() {
  const app = express();

  // Middleware
  app.use(cors());

  // Parse raw body for Stripe webhooks
  app.use(
    "/api/stripe/webhook",
    express.raw({
      type: (req) => {
        if (req.headers["content-type"]?.startsWith("application/json")) return "application/json";
        return false;
      },
    })
  );

  app.use((req, res, next) => {
    if (req.path === "/stripe/webhook") {
      next(); // Skip JSON parsing for webhook
    } else {
      express.json()(req, res, next); // Apply JSON parsing to other routes
    }
  });

  app.use(cookieParser());

  // Auth middleware
  app.use(async (req: CustomRequest, res, next) => {
    const token = req.cookies?.token;
    if (!token) {
      return next();
    }

    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser(token);
      if (error) throw error;
      req.user = user;
    } catch (error) {
      console.error("Auth error:", error);
    }

    next();
  });

  // Apply authentication middleware to API routes except webhook
  app.use("/api", (req, res, next) => {
    if (req.path === "/stripe/webhook") {
      return next();
    }
    return authenticateToken(req, res, next);
  });

  // Serve static frontend files
  const frontendDistPath =
    process.env.NODE_ENV === "production"
      ? join(process.cwd(), "../frontend/dist")
      : join(__dirname, "../frontend/dist");
  app.use(express.static(frontendDistPath));

  // API routes using express-file-routing
  const router = await createRouter({
    directory: join(__dirname, "routes"),
    prefix: "/api",
    options: { caseSensitive: false },
  });
  app.use(router);

  // Catch-all route for SPA
  app.get("*", (req, res) => {
    // Skip API routes
    if (req.path.startsWith("/api")) {
      return res.status(404).json({ error: "API route not found" });
    }

    const indexPath = join(frontendDistPath, "index.html");
    res.sendFile(indexPath, (err) => {
      if (err) {
        console.error("Error serving index.html:", err);
        res.status(500).send("Error loading application");
      }
    });
  });

  const port = process.env.PORT || 4000;
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log(`Serving static files from: ${frontendDistPath}`);
    console.log(`Routes directory: ${join(__dirname, "routes")}`);
  });
}

startServer().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
