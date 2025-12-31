import { FacebookWebhookSchema } from "./schema";

export const getFacebookMessage = async (payload: unknown) => {
  const result = await FacebookWebhookSchema.safeParseAsync(payload);

  if (!result.success) {
    return { success: false, error: result.error };
  }

  return { success: true, data: result.data };
};
