import { expect, test } from "vitest";
import { WhatsAppSDK } from "../src/whatsapp";
import { SendWhatsAppMessagePayload } from "../src/whatsapp/schema";

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

test("schema: accepts valid text payload and defaults type to text", () => {
  const result = SendWhatsAppMessagePayload.safeParse({
    to: "9779861976294",
    message: "Hello!",
  });
  expect(result.success).toBe(true);
  if (result.success) {
    expect(result.data.type).toBe("text");
  }
});

test("schema: rejects text payload with empty message", () => {
  const result = SendWhatsAppMessagePayload.safeParse({
    to: "9779861976294",
    message: "",
  });
  expect(result.success).toBe(false);
});

test("schema: rejects text payload with short recipient", () => {
  const result = SendWhatsAppMessagePayload.safeParse({
    to: "123",
    message: "Hello!",
  });
  expect(result.success).toBe(false);
});

test("schema: accepts valid template payload", () => {
  const result = SendWhatsAppMessagePayload.safeParse({
    type: "template",
    to: "9779861976294",
    template: {
      name: "otp",
      language: { code: "en" },
      components: [
        {
          type: "body",
          parameters: [{ type: "text", text: "582914" }],
        },
        {
          type: "button",
          sub_type: "url",
          index: "0",
          parameters: [{ type: "text", text: "582914" }],
        },
      ],
    },
  });
  expect(result.success).toBe(true);
  if (result.success) {
    expect(result.data.type).toBe("template");
  }
});

test("schema: accepts template without components", () => {
  const result = SendWhatsAppMessagePayload.safeParse({
    type: "template",
    to: "9779861976294",
    template: {
      name: "hello_world",
      language: { code: "en" },
    },
  });
  expect(result.success).toBe(true);
});

test("schema: rejects template without template field", () => {
  const result = SendWhatsAppMessagePayload.safeParse({
    type: "template",
    to: "9779861976294",
  });
  expect(result.success).toBe(false);
});

test("schema: rejects template with empty name", () => {
  const result = SendWhatsAppMessagePayload.safeParse({
    type: "template",
    to: "9779861976294",
    template: {
      name: "",
      language: { code: "en" },
    },
  });
  expect(result.success).toBe(false);
});

test("schema: rejects template without language", () => {
  const result = SendWhatsAppMessagePayload.safeParse({
    type: "template",
    to: "9779861976294",
    template: {
      name: "otp",
    },
  });
  expect(result.success).toBe(false);
});
