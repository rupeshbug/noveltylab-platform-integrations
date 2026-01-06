import { Hono } from "hono";
import { InstagramSDK } from "../src/instagram";

const insta = new InstagramSDK({
  pageAccessToken: process.env.INSTAGRAM_ACCESS_TOKEN,
});

export const instagram = new Hono();

instagram.get("/webhook", (c) => {
  const token = c.req.query("hub.verify_token");
  const challenge = c.req.query("hub.challenge");

  if (token === process.env.INSTAGRAM_VERIFY_TOKEN) {
    console.log("Instagram webhook verified");
    return c.text(challenge!, 200);
  }

  return c.text("Forbidden", 403);
});

instagram.post("/webhook", async (c) => {
  const body = await c.req.json();

  const result = await insta.getInstagramMessage(body);

  if (!result.success) {
    console.error("Invalid Instagram payload");
    console.log(result.error);
    return c.text("Invalid payload", 400);
  }

  const data = result.data;

  for (const entry of data!.entry) {
    const pageId = entry.id;
    for (const event of entry.messaging ?? []) {
      const senderId = event.sender.id;
      const text = event.message?.text;

      if (senderId === pageId) {
        continue;
      }

      if (!text) continue;

      console.log("📩 Instagram message received");
      console.log("From:", senderId);
      console.log("Text:", text);

      try {
        await insta.sendInstagramMessage({
          recipientId: senderId,
          text: "Hello back👋",
          accessToken: process.env.INSTAGRAM_ACCESS_TOKEN!,
        });
      } catch (err) {
        console.error("Failed to reply to Instagram message", err);
      }
    }
  }

  return c.text("EVENT_RECEIVED", 200);
});
