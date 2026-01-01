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
        success: false,
        error: z.prettifyError(result.error),
      };
    }

    return {
      success: true,
      data: result.data,
    };
  }

  /**
   * Validate send message payload only
   */
  async validateSendFacebookMessage(payload: unknown) {
    return SendFacebookMessagePayload.safeParseAsync(payload);
  }

  /**
   * Validate payload and send a Facebook message
   */
  async sendFacebookMessage(payload: unknown) {
    const result = await this.validateSendFacebookMessage(payload);

    if (!result.success) {
      return {
        success: false,
        error: z.prettifyError(result.error),
      };
    }

    const { recipientId, message } = result.data;

    return {
      recipientId,
      message,
    };
  }

  async validateSendFacebookMessageSuccess(payload: unknown) {
    return FacebookSendMessageSuccessSchema.safeParseAsync(payload);
  }

  async replyToFacebookMessage(recipientId: string, message: string) {
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

      // response from Facebook Graph API for the message we sent
      const data = await response.json();
      const validatedResponse = await this.validateSendFacebookMessageSuccess(
        data
      );

      if (validatedResponse.error) {
        throw new Error(`Facebook response is not in expected shape`);
      }

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${JSON.stringify(data)}`);
      }
      return validatedResponse;
    } catch (error) {
      throw new Error("Something unexepected occured");
    }
  }
}
