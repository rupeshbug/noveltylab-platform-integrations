import { Hono } from "hono";
import { FacebookMessengerSDK } from "../src/facebook-messenger";
import "dotenv/config";

export const facebookMessenger = new Hono().basePath("/messenger");

const fb = new FacebookMessengerSDK({
  pageAccessToken: process.env.FACEBOOK_PAGE_ACCESS_TOKEN,
});

facebookMessenger.post("/send-message", async (c) => {
  const body = await c.req.json();
  const response = await fb.sendFacebookMessage(body);
  return c.json({ body: response });
});

facebookMessenger.get("webhook", (c) => {
  const VERIFY_TOKEN = process.env.FACEBOOK_VERIFY_TOKEN!;
  const mode = c.req.query("hub.mode");
  const token = c.req.query("hub.verify_token");
  const challenge = c.req.query("hub.challenge");

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("✅ Facebook webhook verified");
    return c.text(challenge!, 200);
  } else {
    return c.text("Forbidden", 403);
  }
});

facebookMessenger.post("webhook", async (c) => {
  const body = await c.req.json();
  const facebookPayload = await fb.getFacebookMessage(body);

  if (!facebookPayload.success) {
    console.log("Something nasty happened", facebookPayload.error);
    return c.text("Invalid payload", 400);
  }

  if (facebookPayload.data!.object !== "page") {
    return c.text("Not a page event", 404);
  }

  for (const entry of facebookPayload.data!.entry ?? []) {
    for (const event of entry.messaging ?? []) {
      const senderId = event.sender?.id;
      const messageText = event.message?.text;

      if (!senderId || !messageText) continue;

      await fb.replyToFacebookMessage(senderId, "hello testing");
    }
  }

  return c.text("EVENT_RECEIVED", 200);
});
