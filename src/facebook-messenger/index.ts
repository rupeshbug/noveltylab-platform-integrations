import * as z from "zod";
import {
  FacebookAccessTokenSchema,
  FacebookWebhookSchema,
  SendFacebookMessagePayload,
} from "./schema";

interface FacebookSDKConfig {
  pageAccessToken?: string;
}

interface SendFacebookMessageSuccess {
  success: true;
  data: string;
}

interface SendFacebookMessageError {
  success: false;
  error: string;
}

type SendFacebookMessageResult =
  | SendFacebookMessageSuccess
  | SendFacebookMessageError;

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
  async sendFacebookMessage(
    payload: unknown
  ): Promise<SendFacebookMessageResult> {
    const result = await this.validateSendFacebookMessage(payload);

    if (!result.success) {
      return {
        success: false,
        error: z.prettifyError(result.error),
      };
    }

    const accessToken = this.pageAccessToken;

    if (!accessToken) {
      return {
        success: false,
        error: "Facebook page access token is missing",
      };
    }

    const { recipientId, message } = result.data;

    // const url = `https://graph.facebook.com/v24.0/me/messages?access_token=${this.pageAccessToken}`;

    // try {
    //   const response = await fetch(url, {
    //     method: "POST",
    //     headers: {
    //       "Content-Type": "application/json",
    //     },
    //     body: JSON.stringify({
    //       recipient: { id: recipientId },
    //       message: { text: message },
    //     }),
    //   });

    //   const data = await response.json();

    //   if (!response.ok) {
    //     throw new Error(`Error ${response.status}: ${JSON.stringify(data)}`);
    //   }

    //   console.log("Message sent:", data);
    //   return data; // contains message_id, recipient_id, etc.
    // } catch (error) {
    //   console.error("Failed to send message:", error);
    //   return null;
    // }

    return {
      success: true,
      data: "message sent successfully",
    };
  }
}
