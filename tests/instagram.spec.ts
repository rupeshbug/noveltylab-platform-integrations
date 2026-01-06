import { expect, test } from "vitest";
import { InstagramSDK } from "../src/instagram";

const insta = new InstagramSDK({
  pageAccessToken: "random",
});

const invalidPayload = {
  hello: "world",
};

export const validWebhookPayload = {
  object: "instagram",
  entry: [
    {
      time: 1767688031567,
      id: "17841480045769607", // Instagram Business Account ID
      messaging: [
        {
          sender: {
            id: "1774286536595696", // user who sent the message
          },
          recipient: {
            id: "17841480045769607", // your IG business account
          },
          timestamp: 1767688031104,
          message: {
            mid: "aWdfZAG1faXRlbToxOklHTWVzc2FnZAUlEOjE3ODQxNDgwMDQ1NzY5NjA3OjM0MDI4MjM2Njg0MTcxMDMwMTI0NDI1OTk4OTQ3NDE3MzY5Njc3ODozMjYwODA4ODcxMTkzNzk2OTAyNDY5NzQ5NDk5MjMyMjU2MAZDZD",
            text: "hello instagram",
          },
        },
      ],
    },
  ],
};

test("getInstagramMessage: fails for invalid payload", async () => {
  const response = await insta.getInstagramMessage(invalidPayload);
  expect(response.success).toBe(false);
});

test("getInstagramMessage: succeeds for valid payload", async () => {
  const response = await insta.getInstagramMessage(validWebhookPayload);
  expect(response.success).toBe(true);
});
