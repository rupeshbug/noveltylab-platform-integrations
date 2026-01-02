import { z } from "zod";
import {
  SendWhatsAppMessagePayload,
  WhatsAppSendMessageSuccessSchema,
  WhatsAppWebhookSchema,
} from "./schema";
import { FACEBOOK_GRAPH_URL } from "../facebook-messenger/constants";

export const getWhatsAppMessage = async (payload: unknown) => {
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
};

export const sendWhatsAppMessage = async (payload: unknown) => {
  const result = await SendWhatsAppMessagePayload.safeParseAsync(payload);

  if (!result.success) {
    return {
      success: false,
      error: z.prettifyError(result.error),
    };
  }

  console.log(result);
  const { to, message } = result.data;

  return {
    success: true,
    to,
    message,
  };
};

export const replyToWhatsAppMessage = async (to: string, message: string) => {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

  if (!phoneNumberId || !accessToken) {
    throw new Error("WhatsApp credentials are missing");
  }

  const url = `${FACEBOOK_GRAPH_URL}/${phoneNumberId}/messages`;

  const payload = {
    messaging_product: "whatsapp",
    to,
    type: "text",
    text: {
      body: message,
    },
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    const validatedResponse = WhatsAppSendMessageSuccessSchema.safeParse(data);

    if (!validatedResponse.success) {
      throw new Error("WhatsApp response is not in expected shape");
    }

    if (!response.ok) {
      throw new Error(
        `WhatsApp API error ${response.status}: ${JSON.stringify(data)}`
      );
    }

    return validatedResponse.data;
  } catch (error) {
    throw new Error("Failed to send WhatsApp message");
  }
};
