import { expect, test, describe } from "vitest";
import { WhatsAppSDK } from "../src/whatsapp";
import { WhatsAppSDK as WhatsAppSDKFromIndex } from "../src";

const whatsapp = new WhatsAppSDK();

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
                text: { body: "hello world" },
              },
            ],
          },
        },
      ],
    },
  ],
};

const nonTextWebhookPayload = {
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
            messages: [
              {
                from: "9779861976294",
                id: "wamid.imageXXX",
                timestamp: "1767333327",
                type: "image",
                // no text field — image message
              },
            ],
          },
        },
      ],
    },
  ],
};

describe("WhatsAppSDK — exports", () => {
  test("is exported from main index", () => {
    expect(WhatsAppSDKFromIndex).toBeDefined();
  });
});

describe("WhatsAppSDK — getWhatsAppMessage", () => {
  test("returns success: false for invalid payload", async () => {
    const result = await whatsapp.getWhatsAppMessage({ hello: "world" });
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  test("returns success: false for wrong object type", async () => {
    const result = await whatsapp.getWhatsAppMessage({ object: "page", entry: [] });
    expect(result.success).toBe(false);
  });

  test("returns success: true with data for valid text message payload", async () => {
    const result = await whatsapp.getWhatsAppMessage(validWebhookPayload);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.object).toBe("whatsapp_business_account");
      const msg = result.data.entry[0]?.changes[0]?.value.messages?.[0];
      expect(msg?.text?.body).toBe("hello world");
    }
  });

  test("returns success: true for non-text (image) message — schema is flexible", async () => {
    const result = await whatsapp.getWhatsAppMessage(nonTextWebhookPayload);
    expect(result.success).toBe(true);
    if (result.success) {
      const msg = result.data.entry[0]?.changes[0]?.value.messages?.[0];
      expect(msg?.type).toBe("image");
      expect(msg?.text).toBeUndefined();
    }
  });

  test("result has no error field on success", async () => {
    const result = await whatsapp.getWhatsAppMessage(validWebhookPayload);
    expect(result.success).toBe(true);
    expect((result as any).error).toBeUndefined();
  });

  test("result has no data field on failure", async () => {
    const result = await whatsapp.getWhatsAppMessage({});
    expect(result.success).toBe(false);
    expect((result as any).data).toBeUndefined();
  });
});

describe("WhatsAppSDK — sendWhatsAppMessage text (validation layer)", () => {
  test("returns success: false for missing `to` field", async () => {
    const result = await whatsapp.sendWhatsAppMessage({ message: "hello" });
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  test("returns success: false for empty message", async () => {
    const result = await whatsapp.sendWhatsAppMessage({ to: "9779861976294", message: "" });
    expect(result.success).toBe(false);
  });

  test("returns success: false for completely invalid payload", async () => {
    const result = await whatsapp.sendWhatsAppMessage({ hello: "world" });
    expect(result.success).toBe(false);
  });

  test("returns success: false when no token/phoneNumberId set (network will fail)", async () => {
    const result = await whatsapp.sendWhatsAppMessage({ to: "9779861976294", message: "hello" });
    // Will fail at network layer — should return structured error, not throw
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  test("existing text usage works without type field (backward compatible)", async () => {
    // { to, message } without type still works — type defaults to "text"
    const result = await whatsapp.sendWhatsAppMessage({ to: "9779861976294", message: "hello" });
    // fails at network, not at validation
    expect(result.error).not.toContain("Recipient WhatsApp ID");
    expect(result.error).not.toContain("Message text");
  });
});

describe("WhatsAppSDK — sendWhatsAppMessage template (validation layer)", () => {
  const validOtpTemplate = {
    type: "template",
    to: "9779861976294",
    template: {
      name: "otp_code",
      language: { code: "en_US" },
      components: [
        {
          type: "body",
          parameters: [{ type: "text", text: "482910" }],
        },
      ],
    },
  };

  const validMarketingTemplate = {
    type: "template",
    to: "9779861976294",
    template: {
      name: "summer_sale",
      language: { code: "en_US" },
      components: [
        {
          type: "header",
          parameters: [{ type: "text", text: "50% OFF" }],
        },
        {
          type: "body",
          parameters: [{ type: "text", text: "John" }],
        },
      ],
    },
  };

  const validUtilityTemplate = {
    type: "template",
    to: "9779861976294",
    template: {
      name: "order_confirmed",
      language: { code: "en_US" },
      // components is optional — some templates have no variables
    },
  };

  test("validates OTP template payload correctly", async () => {
    const result = await whatsapp.sendWhatsAppMessage(validOtpTemplate);
    // fails at network, not at validation — no token set
    expect(result.success).toBe(false);
    expect(result.error).not.toContain("Template name");
    expect(result.error).not.toContain("Language code");
  });

  test("validates marketing template payload correctly", async () => {
    const result = await whatsapp.sendWhatsAppMessage(validMarketingTemplate);
    expect(result.success).toBe(false);
    expect(result.error).not.toContain("Template name");
  });

  test("validates utility template without components", async () => {
    const result = await whatsapp.sendWhatsAppMessage(validUtilityTemplate);
    expect(result.success).toBe(false);
    expect(result.error).not.toContain("Template name");
  });

  test("returns success: false for template missing `template` field", async () => {
    const result = await whatsapp.sendWhatsAppMessage({ type: "template", to: "9779861976294" });
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  test("returns success: false for template with empty name", async () => {
    const result = await whatsapp.sendWhatsAppMessage({
      type: "template",
      to: "9779861976294",
      template: { name: "", language: { code: "en_US" } },
    });
    expect(result.success).toBe(false);
  });

  test("returns success: false for template missing language", async () => {
    const result = await whatsapp.sendWhatsAppMessage({
      type: "template",
      to: "9779861976294",
      template: { name: "otp_code" },
    });
    expect(result.success).toBe(false);
  });

  test("returns success: false when no token/phoneNumberId set (network will fail)", async () => {
    const result = await whatsapp.sendWhatsAppMessage(validOtpTemplate);
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  test("does not throw — returns structured error even on network failure", async () => {
    await expect(
      whatsapp.sendWhatsAppMessage(validOtpTemplate)
    ).resolves.toHaveProperty("success", false);
  });
});
