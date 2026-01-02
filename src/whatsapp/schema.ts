import * as z from "zod";

/**
 * Contact info of the WhatsApp user
 */
const WhatsAppContactSchema = z.object({
  profile: z
    .object({
      name: z.string().optional(),
    })
    .optional(),

  wa_id: z
    .string()
    .describe("WhatsApp ID (phone number) of the user, e.g. '9779861976294'"),
});

/**
 * Text message body
 */
const WhatsAppTextSchema = z.object({
  body: z.string().min(1).describe("Text content sent by the WhatsApp user"),
});

/**
 * Incoming WhatsApp message (text only for now)
 */
const WhatsAppMessageSchema = z.object({
  from: z.string().describe("WhatsApp ID of the sender"),

  id: z.string().describe("Unique WhatsApp message ID"),

  timestamp: z
    .string()
    .describe("Unix timestamp (seconds) when message was sent"),

  type: z.literal("text").describe("Type of message"),

  text: WhatsAppTextSchema,
});

/**
 * Metadata about the business phone number
 */
const WhatsAppMetadataSchema = z.object({
  display_phone_number: z.string(),
  phone_number_id: z.string(),
});

/**
 * Value object inside changes[]
 */
const WhatsAppChangeValueSchema = z.object({
  messaging_product: z.literal("whatsapp"),

  metadata: WhatsAppMetadataSchema,

  contacts: z
    .array(WhatsAppContactSchema)
    .optional()
    .describe("Contact info of the WhatsApp user"),

  messages: z
    .array(WhatsAppMessageSchema)
    .optional()
    .describe("Incoming WhatsApp messages"),
});

/**
 * Change object inside entry[]
 */
const WhatsAppChangeSchema = z.object({
  field: z.literal("messages"),
  value: WhatsAppChangeValueSchema,
});

/**
 * Entry object
 */
const WhatsAppEntrySchema = z.object({
  id: z.string().describe("WhatsApp Business Account ID"),

  changes: z.array(WhatsAppChangeSchema),
});

/**
 * Root WhatsApp webhook payload
 */
export const WhatsAppWebhookSchema = z.object({
  object: z.literal("whatsapp_business_account"),

  entry: z.array(WhatsAppEntrySchema),
});

/**
 * Inferred TypeScript type
 */
export type WhatsAppWebhookPayload = z.infer<typeof WhatsAppWebhookSchema>;

export const SendWhatsAppMessagePayload = z.object({
  to: z.string().min(5, "Recipient WhatsApp ID is required"),
  message: z.string().min(1, "Message text is required"),
});

export type SendWhatsAppMessagePayload = z.infer<
  typeof SendWhatsAppMessagePayload
>;

export const WhatsAppSendMessageSuccessSchema = z.object({
  messaging_product: z.literal("whatsapp"),
  messages: z.array(
    z.object({
      id: z.string(),
    })
  ),
});

export const WhatsAppAccessTokenSchema = z
  .string()
  .min(10, "Invalid WhatsApp access token");

export const WhatsAppPhoneNumberIdSchema = z
  .string()
  .min(5, "Invalid WhatsApp phone number ID");
