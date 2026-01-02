import { z } from "zod";
import { WhatsAppWebhookSchema } from "./schema";

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
