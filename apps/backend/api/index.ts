import { Hono } from "hono";
import { serveStatic } from "@hono/node-server/serve-static";
import { join } from "path";

const app = new Hono();

// Calculate static file directory path
const staticRoot = join(__dirname, "../../frontend/dist");
console.log("Static files being served from:", staticRoot);

// API routes should come BEFORE static file middleware
app.get("/api/health", (c) => c.json({ status: "ok" }));

// Serve static files with more specific paths
app.use("/assets/*", serveStatic({ root: staticRoot }));
app.use("/", serveStatic({ root: staticRoot }));
app.use(
  "/*",
  serveStatic({
    root: staticRoot,
    rewriteRequestPath: (path) => "/index.html", // For SPA fallback
  })
);

export default app;
