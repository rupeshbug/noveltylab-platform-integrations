import { Hono } from "hono";

export const whatsapp = new Hono();

whatsapp.get("/webhook", (c) => {
  const token = c.req.query("hub.verify_token");
  const challenge = c.req.query("hub.challenge");

  if (token === process.env.WHATSAPP_VERIFY_TOKEN) {
    console.log("Whatsapp webhook verified");
    return c.text(challenge!, 200);
  }

  return c.text("Forbidden", 403);
});

whatsapp.post("/webhook", async (c) => {
  const body = await c.req.json();

  console.log("📩 RAW WHATSAPP PAYLOAD", JSON.stringify(body, null, 2));

  return c.text("EVENT_RECEIVED", 200);
});
