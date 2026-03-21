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
   * Send a text or template message to a WhatsApp user
   */
  async sendWhatsAppMessage(payload: unknown) {
    const result = await SendWhatsAppMessagePayload.safeParseAsync(payload);

    if (!result.success) {
      return {
        success: false as const,
        error: z.prettifyError(result.error),
      };
    }

    const parsed = result.data;
    const url = `${FACEBOOK_GRAPH_URL}/${this.phoneNumberId}/messages`;

    const sendPayload =
      parsed.type === "template"
        ? {
            messaging_product: "whatsapp",
            to: parsed.to,
            type: "template" as const,
            template: parsed.template,
          }
        : {
            messaging_product: "whatsapp",
            to: parsed.to,
            type: "text" as const,
            text: { body: parsed.message },
          };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(sendPayload),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false as const,
          error: `Error ${response.status}: ${JSON.stringify(data)}`,
        };
      }

      const validatedResponse = WhatsAppSendMessageSuccessSchema.safeParse(data);

      if (!validatedResponse.success) {
        return {
          success: false as const,
          error: "WhatsApp response is not in expected shape",
        };
      }

      return {
        success: true as const,
        data: validatedResponse.data,
      };
    } catch (error) {
      return {
        success: false as const,
        error: "Network error: failed to send WhatsApp message",
      };
    }
  }
}
