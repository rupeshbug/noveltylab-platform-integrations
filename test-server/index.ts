import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { facebookMessenger } from "./facebook";

const app = new Hono();
app.route("/facebook", facebookMessenger);

serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  }
);
