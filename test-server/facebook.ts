import { Hono } from "hono";
import { FacebookMessengerSDK } from "../src/facebook-messenger";
import "dotenv/config";

export const facebookMessenger = new Hono().basePath("/facebook-messenger");

const fb = new FacebookMessengerSDK({
  pageAccessToken: process.env.FACEBOOK_PAGE_ACCESS_TOKEN,
});

facebookMessenger.post("/send-message", async (c) => {
  const body = await c.req.json();
  const response = await fb.sendFacebookMessage(body);
  return c.json({ body: response });
});
