import { z } from "zod";
import { SendWhatsAppMessagePayload, WhatsAppWebhookSchema } from "./schema";

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
