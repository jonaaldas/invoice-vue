import express from "express";
import path from "path";
import cors from "cors";
import { fileURLToPath } from "url";
import { api } from "@invoice/shared";
import createRouter from "express-file-routing";

const startServer = async () => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  console.log("🚀 ~ startServer ~ __dirname:", __dirname);

  const app = express();
  const PORT = process.env.PORT || 4000;

  app.use(cors());
  app.use(express.json());

  // Set up file-based routing
  await createRouter(app, {
    directory: path.join(__dirname, "routes"),
    prefix: "/api",
  });

  // Determine the correct path to the frontend dist directory
  const frontendDistPath =
    process.env.NODE_ENV === "production"
      ? path.join(process.cwd(), "../frontend/dist")
      : path.join(__dirname, "../frontend/dist");

  // Serve static files from the frontend dist directory
  app.use(express.static(frontendDistPath));

  // Handle SPA routing - return index.html for all non-API routes
  app.get("*", (req, res) => {
    // Skip API routes
    if (req.path.startsWith("/api")) {
      return res.status(404).json({ error: "API route not found" });
    }

    const indexPath = path.join(frontendDistPath, "index.html");
    res.sendFile(indexPath, (err) => {
      if (err) {
        console.error("Error serving index.html:", err);
        res.status(500).send("Error loading application");
      }
    });
  });

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Serving static files from: ${frontendDistPath}`);
    console.log(`Routes directory: ${path.join(__dirname, "routes")}`);
  });

  return app;
};

// Start the server
startServer().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});

export default startServer;
