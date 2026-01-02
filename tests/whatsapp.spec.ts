import { expect, test } from "vitest";
import { WhatsAppSDK } from "../src/whatsapp";

const whatsapp = new WhatsAppSDK();

const invalidPayload = {
  hello: "world",
};

const validWebhookPayload = {
  object: "whatsapp_business_account",
  entry: [
    {
      id: "1383715570162494",
      changes: [
        {
          field: "messages",
          value: {
            messaging_product: "whatsapp",
            metadata: {
              display_phone_number: "15551635053",
              phone_number_id: "926657250530422",
            },
            contacts: [
              {
                profile: { name: "Rupesh" },
                wa_id: "9779861976294",
              },
            ],
            messages: [
              {
                from: "9779861976294",
                id: "wamid.HBgNOTc3OTg2MTk3NjI5NBUCABIYAA==",
                timestamp: "1767333327",
                type: "text",
                text: {
                  body: "hello world",
                },
              },
            ],
          },
        },
      ],
    },
  ],
};

test("getWhatsAppMessage: fails for invalid payload", async () => {
  const response = await whatsapp.getWhatsAppMessage(invalidPayload);
  expect(response.success).toBe(false);
});

test("getWhatsAppMessage: succeeds for valid payload", async () => {
  const response = await whatsapp.getWhatsAppMessage(validWebhookPayload);
  expect(response.success).toBe(true);
});
