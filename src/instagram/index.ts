import { z } from "zod";
import { InstagramWebhookSchema, SendInstagramMessageSchema } from "./schema";
import { FACEBOOK_GRAPH_URL } from "../facebook-messenger/constants";

interface InstagramSDKConfig {
  pageAccessToken?: string;
}

export class InstagramSDK {
  private readonly pageAccessToken?: string;

  constructor(config: InstagramSDKConfig = {}) {
    if (config.pageAccessToken) {
      this.pageAccessToken = config.pageAccessToken;
    }
  }

  /**
   * Validate and parse incoming Instagram webhook payload
   */
  async getInstagramMessage(payload: unknown) {
    const result = InstagramWebhookSchema.safeParse(payload);

    if (!result.success) {
      return {
        success: false as const,
        error: z.prettifyError(result.error),
      };
    }

    return {
      success: true as const,
      data: result.data,
    };
  }

  /**
   * Send a text message to an Instagram user
   */
  async sendInstagramMessage({
    recipientId,
    text,
  }: {
    recipientId: string;
    text: string;
  }) {
    const payload = {
      recipient: { id: recipientId },
      message: { text },
    };

    const result = SendInstagramMessageSchema.safeParse(payload);

    if (!result.success) {
      return {
        success: false as const,
        error: z.prettifyError(result.error),
      };
    }

    const url = `${FACEBOOK_GRAPH_URL}/me/messages`;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.pageAccessToken}`,
        },
        body: JSON.stringify(result.data),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false as const,
          error: `Error ${response.status}: ${JSON.stringify(data)}`,
        };
      }

      return {
        success: true as const,
        data,
      };
    } catch (error) {
      return {
        success: false as const,
        error: "Network error: failed to send Instagram message",
      };
    }
  }
}
