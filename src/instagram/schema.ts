import { z } from "zod";

/**
 * Instagram message object
 */
export const InstagramMessageSchema = z.object({
  mid: z.string(),
  text: z.string().optional(),
});

/**
 * Messaging event
 */
export const InstagramMessagingEventSchema = z.object({
  sender: z.object({
    id: z.string(),
  }),
  recipient: z.object({
    id: z.string(),
  }),
  timestamp: z.number(),
  message: InstagramMessageSchema.optional(),
});

/**
 * Entry object
 */
export const InstagramEntrySchema = z.object({
  time: z.number(),
  id: z.string(),
  messaging: z.array(InstagramMessagingEventSchema).optional(),
});

/**
 * Root webhook payload
 */
export const InstagramWebhookSchema = z.object({
  object: z.literal("instagram"),
  entry: z.array(InstagramEntrySchema),
});

export const SendInstagramMessageSchema = z.object({
  recipient: z.object({
    id: z.string().min(1),
  }),
  message: z.object({
    text: z.string().min(1),
  }),
});
