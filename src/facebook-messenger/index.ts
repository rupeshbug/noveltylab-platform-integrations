import * as z from "zod";
import {
  FacebookAccessTokenSchema,
  FacebookSendMessageSuccessSchema,
  FacebookWebhookSchema,
  SendFacebookMessagePayload,
} from "./schema";
import { FACEBOOK_GRAPH_URL } from "./constants";

interface FacebookSDKConfig {
  pageAccessToken?: string;
}

export class FacebookMessengerSDK {
  private readonly pageAccessToken?: string;

  constructor(config: FacebookSDKConfig = {}) {
    if (config.pageAccessToken) {
      const result = FacebookAccessTokenSchema.safeParse(
        config.pageAccessToken
      );

      if (!result.success) {
        throw new Error(z.prettifyError(result.error));
      }

      this.pageAccessToken = result.data;
    }
  }

  /**
   * Validate and parse incoming Facebook webhook payload
   */
  async getFacebookMessage(payload: unknown) {
    const result = await FacebookWebhookSchema.safeParseAsync(payload);

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
   * Validate send message payload only
   */
  async validateSendFacebookMessage(payload: unknown) {
    return SendFacebookMessagePayload.safeParseAsync(payload);
  }

  async validateSendFacebookMessageSuccess(payload: unknown) {
    return FacebookSendMessageSuccessSchema.safeParseAsync(payload);
  }

  async sendFacebookMessage(payload: unknown) {
    const result = await this.validateSendFacebookMessage(payload);

    if (!result.success) {
      return {
        success: false as const,
        error: z.prettifyError(result.error),
      };
    }

    const { recipientId, message } = result.data;
    const url = `${FACEBOOK_GRAPH_URL}/me/messages?access_token=${this.pageAccessToken}`;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipient: { id: recipientId },
          message: { text: message },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false as const,
          error: `Error ${response.status}: ${JSON.stringify(data)}`,
        };
      }

      const validatedResponse =
        await this.validateSendFacebookMessageSuccess(data);

      if (!validatedResponse.success) {
        return {
          success: false as const,
          error: "Facebook response is not in expected shape",
        };
      }

      return {
        success: true as const,
        data: validatedResponse.data,
      };
    } catch (error) {
      return {
        success: false as const,
        error: "Network error: failed to send Facebook message",
      };
    }
  }
}
