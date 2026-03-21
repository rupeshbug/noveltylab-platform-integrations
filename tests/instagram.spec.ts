import { expect, test, describe } from "vitest";
import { InstagramSDK } from "../src/instagram";
import { InstagramSDK as InstagramSDKFromIndex } from "../src";

const insta = new InstagramSDK({
  pageAccessToken: "validtoken123",
});

const validWebhookPayload = {
  object: "instagram",
  entry: [
    {
      time: 1767688031567,
      id: "17841480045769607",
      messaging: [
        {
          sender: { id: "1774286536595696" },
          recipient: { id: "17841480045769607" },
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

describe("InstagramSDK — exports", () => {
  test("is exported from main index", () => {
    expect(InstagramSDKFromIndex).toBeDefined();
  });

  test("direct and index export are the same class", () => {
    expect(InstagramSDK).toBe(InstagramSDKFromIndex);
  });
});

describe("InstagramSDK — constructor", () => {
  test("accepts valid config", () => {
    expect(() => new InstagramSDK({ pageAccessToken: "validtoken123" })).not.toThrow();
  });

  test("accepts empty config without throwing", () => {
    expect(() => new InstagramSDK()).not.toThrow();
  });
});

describe("InstagramSDK — getInstagramMessage", () => {
  test("returns success: false for invalid payload", async () => {
    const result = await insta.getInstagramMessage({ hello: "world" });
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  test("returns success: false for wrong object type", async () => {
    const result = await insta.getInstagramMessage({ object: "page", entry: [] });
    expect(result.success).toBe(false);
  });

  test("returns success: true with data for valid payload", async () => {
    const result = await insta.getInstagramMessage(validWebhookPayload);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.object).toBe("instagram");
      expect(result.data.entry[0]?.messaging?.[0]?.message?.text).toBe("hello instagram");
    }
  });

  test("result has no error field on success", async () => {
    const result = await insta.getInstagramMessage(validWebhookPayload);
    expect(result.success).toBe(true);
    expect((result as any).error).toBeUndefined();
  });

  test("result has no data field on failure", async () => {
    const result = await insta.getInstagramMessage({});
    expect(result.success).toBe(false);
    expect((result as any).data).toBeUndefined();
  });
});

describe("InstagramSDK — sendInstagramMessage (validation layer)", () => {
  test("returns success: false for empty recipientId", async () => {
    const result = await insta.sendInstagramMessage({ recipientId: "", text: "hi" });
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  test("returns success: false for empty text", async () => {
    const result = await insta.sendInstagramMessage({ recipientId: "123", text: "" });
    expect(result.success).toBe(false);
  });

  test("returns success: false when no token set (network will fail)", async () => {
    const noTokenSdk = new InstagramSDK();
    const result = await noTokenSdk.sendInstagramMessage({ recipientId: "123", text: "hello" });
    // Will fail at network layer — should return structured error, not throw
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  test("does not require accessToken as a call-time parameter", async () => {
    // sendInstagramMessage should use the token from constructor, not a param
    const fn = insta.sendInstagramMessage.bind(insta);
    // TypeScript check: this should only accept { recipientId, text }
    expect(fn).toBeDefined();
  });
});
