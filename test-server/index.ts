import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { facebookMessenger } from "./facebook";
import { whatsapp } from "./whatsapp";

const app = new Hono();

app.route("/facebook", facebookMessenger);
app.route("/whatsapp", whatsapp);

serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  }
);
