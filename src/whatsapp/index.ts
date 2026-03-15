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
        config.phoneNumberId,
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

    const parsed = result.data;
    const url = `${FACEBOOK_GRAPH_URL}/${this.phoneNumberId}/messages`;

    let sendPayload;
    if (parsed.type === "template") {
      sendPayload = {
        messaging_product: "whatsapp",
        to: parsed.to,
        type: "template",
        template: parsed.template,
      };
    } else {
      sendPayload = {
        messaging_product: "whatsapp",
        to: parsed.to,
        type: "text",
        text: { body: parsed.message },
      };
    }

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(sendPayload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `WhatsApp API error: ${response.status} - ${JSON.stringify(errorData)}`,
      );
    }

    const data = await response.json();

    const validatedResponse = WhatsAppSendMessageSuccessSchema.safeParse(data);

    if (!validatedResponse.success) {
      throw new Error("WhatsApp response is not in expected shape");
    }

    return validatedResponse.data;
  }
}
