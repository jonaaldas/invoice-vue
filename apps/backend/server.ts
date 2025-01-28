import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4000;

// Determine the correct path to the frontend dist directory
const frontendDistPath =
  process.env.NODE_ENV === "production"
    ? path.join(process.cwd(), "../frontend/dist")
    : path.join(__dirname, "../frontend/dist");

// Serve static files from the frontend dist directory
app.use(express.static(frontendDistPath));

// Handle SPA routing - return index.html for all routes
app.get("*", (req, res) => {
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
});

export default app;
