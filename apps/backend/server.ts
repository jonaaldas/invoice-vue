import { serve } from "@hono/node-server";
import app from "./api";

const port = process.env.PORT || 4000;

console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port: Number(port),
});
