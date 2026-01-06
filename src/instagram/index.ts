import { z } from "zod";
import { InstagramWebhookSchema, SendInstagramMessageSchema } from "./schema";
import { FACEBOOK_GRAPH_URL } from "../facebook-messenger/constants";

interface SendInstagramMessageParams {
  recipientId: string;
  text: string;
  accessToken: string;
}

export class InstagramSDK {
  private readonly pageAccessToken?: string;

  constructor(config: any) {
    if (config.pageAccessToken) {
      this.pageAccessToken = config.pageAccessToken;
    }
  }

  async getInstagramMessage(payload: unknown) {
    const result = InstagramWebhookSchema.safeParse(payload);

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

  async sendInstagramMessage({
    recipientId,
    text,
  }: SendInstagramMessageParams) {
    const payload = {
      recipient: {
        id: recipientId,
      },
      message: {
        text,
      },
    };

    const result = SendInstagramMessageSchema.safeParse(payload);

    if (!result.success) {
      return {
        success: false,
        error: z.prettifyError(result.error),
      };
    }

    console.log("Payload valid:", result.data);

    // Call Meta Graph API

    const url = `${FACEBOOK_GRAPH_URL}/me/messages`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.pageAccessToken}`,
      },
      body: JSON.stringify(result.data),
    });

    const data = await response.json();
    console.log(data);

    if (!response.ok) {
      return {
        success: false,
        error: data,
      };
    }

    return {
      success: true,
      data: data,
    };
  }
}
