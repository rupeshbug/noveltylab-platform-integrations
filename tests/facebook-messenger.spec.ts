import { expect, test, describe } from "vitest";
import { FacebookMessengerSDK } from "../src/facebook-messenger";
import { FacebookMessengerSDK as FacebookMessengerSDKFromIndex } from "../src";

const fb = new FacebookMessengerSDK({
  pageAccessToken: "validtoken123",
});

const validWebhookPayload = {
  object: "page",
  entry: [
    {
      time: 1766502836038,
      id: "436899702836492",
      messaging: [
        {
          sender: { id: "25253244094345190" },
          recipient: { id: "436899702836492" },
          timestamp: 1766502835295,
          message: {
            mid: "m_NxsI9usMBgX9Q7-vCGTVwR0rJynMTjNQoFFj79sadlNUbSbin0ExrRnk0EIRJlW1WMB8NOShQsPBYRcL1pjTCQ",
            text: "hello",
          },
        },
      ],
    },
  ],
};

describe("FacebookMessengerSDK — exports", () => {
  test("is exported from main index", () => {
    expect(FacebookMessengerSDKFromIndex).toBeDefined();
  });
});

describe("FacebookMessengerSDK — constructor", () => {
  test("accepts valid config", () => {
    expect(() => new FacebookMessengerSDK({ pageAccessToken: "validtoken123" })).not.toThrow();
  });

  test("accepts token with pipe character (real Meta token format)", () => {
    expect(() => new FacebookMessengerSDK({ pageAccessToken: "EAAxxxxxx|yyy" })).not.toThrow();
  });

  test("throws for token with whitespace", () => {
    expect(() => new FacebookMessengerSDK({ pageAccessToken: "bad token here" })).toThrow();
  });

  test("accepts empty config without throwing", () => {
    expect(() => new FacebookMessengerSDK()).not.toThrow();
  });
});

describe("FacebookMessengerSDK — getFacebookMessage", () => {
  test("returns success: false for invalid payload", async () => {
    const result = await fb.getFacebookMessage({ name: "dsasda" });
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  test("returns success: false for wrong object type", async () => {
    const result = await fb.getFacebookMessage({ object: "whatsapp_business_account", entry: [] });
    expect(result.success).toBe(false);
  });

  test("returns success: true with data for valid payload", async () => {
    const result = await fb.getFacebookMessage(validWebhookPayload);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.object).toBe("page");
      expect(result.data.entry).toHaveLength(1);
      expect(result.data.entry[0]?.messaging?.[0]?.message?.text).toBe("hello");
    }
  });

  test("result has no error field on success", async () => {
    const result = await fb.getFacebookMessage(validWebhookPayload);
    expect(result.success).toBe(true);
    expect((result as any).error).toBeUndefined();
  });

  test("result has no data field on failure", async () => {
    const result = await fb.getFacebookMessage({});
    expect(result.success).toBe(false);
    expect((result as any).data).toBeUndefined();
  });
});

describe("FacebookMessengerSDK — sendFacebookMessage (validation layer)", () => {
  test("returns success: false for missing recipientId", async () => {
    const result = await fb.sendFacebookMessage({ message: "hi" });
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  test("returns success: false for empty message", async () => {
    const result = await fb.sendFacebookMessage({ recipientId: "123", message: "" });
    expect(result.success).toBe(false);
  });

  test("returns success: false for completely invalid payload", async () => {
    const result = await fb.sendFacebookMessage({ name: "dsasda" });
    expect(result.success).toBe(false);
  });

  test("returns success: false when no token is set (network will fail)", async () => {
    const noTokenSdk = new FacebookMessengerSDK();
    const result = await noTokenSdk.sendFacebookMessage({ recipientId: "123", message: "hello" });
    // Will fail at network layer — should still return structured error, not throw
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});
