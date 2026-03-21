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
 * Incoming WhatsApp message — type can be text, image, audio, video, document, etc.
 * text field is optional since non-text messages won't have it.
 */
const WhatsAppMessageSchema = z.object({
  from: z.string().describe("WhatsApp ID of the sender"),

  id: z.string().describe("Unique WhatsApp message ID"),

  timestamp: z
    .string()
    .describe("Unix timestamp (seconds) when message was sent"),

  type: z.string().describe("Type of message (text, image, audio, video, document, etc.)"),

  text: WhatsAppTextSchema.optional(),
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

/**
 * Template schema for WhatsApp template messages (OTP, marketing, utility, etc.)
 */
export const WhatsAppTemplateSchema = z.object({
  name: z.string().min(1, "Template name is required"),
  language: z.object({ code: z.string().min(1, "Language code is required") }),
  components: z.array(z.record(z.string(), z.unknown())).optional(),
});

/**
 * Text message send payload
 */
const SendTextPayload = z.object({
  type: z.literal("text").optional().default("text"),
  to: z.string().min(5, "Recipient WhatsApp ID is required"),
  message: z.string().min(1, "Message text is required"),
});

/**
 * Template message send payload
 */
const SendTemplatePayload = z.object({
  type: z.literal("template"),
  to: z.string().min(5, "Recipient WhatsApp ID is required"),
  template: WhatsAppTemplateSchema,
});

/**
 * Union of text and template — template is tried first by Zod
 */
export const SendWhatsAppMessagePayload = z.union([
  SendTemplatePayload,
  SendTextPayload,
]);

export type SendWhatsAppMessagePayload = z.output<
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
