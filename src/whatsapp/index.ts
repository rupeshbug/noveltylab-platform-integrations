import { z } from "zod";
import {
  WhatsAppAccessTokenSchema,
  WhatsAppPhoneNumberIdSchema,
  WhatsAppWebhookSchema,
  SendWhatsAppMessagePayload,
  WhatsAppSendMessageSuccessSchema,
} from "./schema";
import { FACEBOOK_GRAPH_URL } from "../facebook-messenger/constants";

interface WhatsAppSDKConfig {
  accessToken?: string;
  phoneNumberId?: string;
}

export class WhatsAppSDK {
  private readonly accessToken?: string;
  private readonly phoneNumberId?: string;

  constructor(config: WhatsAppSDKConfig = {}) {
    if (config.accessToken) {
      const result = WhatsAppAccessTokenSchema.safeParse(config.accessToken);
      if (!result.success) {
        throw new Error(z.prettifyError(result.error));
      }
      this.accessToken = result.data;
    }

    if (config.phoneNumberId) {
      const result = WhatsAppPhoneNumberIdSchema.safeParse(
        config.phoneNumberId
      );
      if (!result.success) {
        throw new Error(z.prettifyError(result.error));
      }
      this.phoneNumberId = result.data;
    }
  }

  /**
   * Validate and parse incoming WhatsApp webhook payload
   */
  async getWhatsAppMessage(payload: unknown) {
    const result = await WhatsAppWebhookSchema.safeParseAsync(payload);

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
   * Send reply to WhatsApp user (real API call)
   */
  async sendWhatsAppMessage(payload: unknown) {
    const result = await SendWhatsAppMessagePayload.safeParseAsync(payload);

    if (!result.success) {
      return {
        success: false,
        error: z.prettifyError(result.error),
      };
    }

    const url = `${FACEBOOK_GRAPH_URL}/${this.phoneNumberId}/messages`;

    const sendPayload = {
      messaging_product: "whatsapp",
      to: result.data.to,
      type: "text",
      text: {
        body: result.data.message,
      },
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(sendPayload),
    });

    const data = await response.json();

    const validatedResponse = WhatsAppSendMessageSuccessSchema.safeParse(data);

    if (!validatedResponse.success) {
      throw new Error("WhatsApp response is not in expected shape");
    }

    if (!response.ok) {
      throw new Error(`Something went wrong`);
    }

    return validatedResponse.data;
  }
}
