import { Hono } from "hono";
import { WhatsAppSDK } from "../src/whatsapp";

export const whatsapp = new Hono();

const whatsappSDK = new WhatsAppSDK({
  accessToken: process.env.WHATSAPP_ACCESS_TOKEN,
  phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
});

whatsapp.post("/send-message", async (c) => {
  const body = await c.req.json();
  console.log("body", body);
  const response = await whatsappSDK.sendWhatsAppMessage(body);
  return c.json({ body: response });
});

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

  const whatsAppPayload = await whatsappSDK.getWhatsAppMessage(body);

  if (!whatsAppPayload.success) {
    console.error("Invalid WhatsApp payload", whatsAppPayload.error);
    return c.text("Invalid payload", 400);
  }

  const data = whatsAppPayload.data;

  for (const entry of data!.entry ?? []) {
    for (const change of entry.changes ?? []) {
      const messages = change.value?.messages ?? [];

      for (const message of messages) {
        const senderId = message.from;
        const messageText = message.text?.body;

        if (!senderId || !messageText) continue;

        console.log("📨 WhatsApp message received");
        console.log("From:", senderId);
        console.log("Text:", messageText);

        try {
          await whatsappSDK.sendWhatsAppMessage({
            to: senderId,
            message: "testing from whatsapp",
          });
        } catch (err) {
          console.error("Failed to reply to WhatsApp message", err);
        }
      }
    }
  }

  return c.text("EVENT_RECEIVED", 200);
});
