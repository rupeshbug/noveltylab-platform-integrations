import { Hono } from "hono";
import { getWhatsAppMessage } from "../src/whatsapp";

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

  const whatsAppPayload = await getWhatsAppMessage(body);

  if (!whatsAppPayload.success) {
    console.error("Invalid WhatsApp payload", whatsAppPayload.error);
    return c.text("Invalid payload", 400);
  }

  const data = whatsAppPayload.data;

  for (const entry of data!.entry ?? []) {
    for (const change of entry.changes ?? []) {
      const messages = change.value?.messages ?? [];

      for (const message of messages) {
        const senderWaId = message.from;
        const messageText = message.text?.body;

        if (!senderWaId || !messageText) continue;

        console.log("📨 WhatsApp message received");
        console.log("From:", senderWaId);
        console.log("Text:", messageText);
      }
    }
  }

  return c.text("EVENT_RECEIVED", 200);
});
