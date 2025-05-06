import { z } from "zod";

// Text Node
export const TextNodeSchema = z.object({
  type: z.literal("text"),
  text: z.string(), // The actual text content
  marks: z
    .array(
      z.object({
        type: z.enum([
          "bold",
          "italic",
          "underline",
          "strike",
          "code",
          "textStyle",
          "link",
        ]),
        attrs: z
          .object({
            color: z.string().optional().nullable(),
            href: z
              .string()
              .url()
              .refine((url) => {
                const allowedProtocols = ["http:", "https:"];
                try {
                  const parsedUrl = new URL(url);
                  return allowedProtocols.includes(parsedUrl.protocol);
                } catch {
                  return false;
                }
              }, "Invalid URL protocol"), // Ensure only http and https are allowed
            target: z.enum(["_blank", "_self", "_parent", "_top"]).optional(),
          })
          .optional(),
      })
    )
    .optional(),
});

// Link Node
const LinkNodeSchema = z.object({
  type: z.literal("link"),
  attrs: z.object({
    href: z
      .string()
      .url()
      .refine((url) => {
        const allowedProtocols = ["http:", "https:"];
        try {
          const parsedUrl = new URL(url);
          return allowedProtocols.includes(parsedUrl.protocol);
        } catch {
          return false;
        }
      }, "Invalid URL protocol"), // Ensure only http and https are allowed
    target: z.enum(["_blank", "_self", "_parent", "_top"]).optional(),
  }),
  content: z.array(z.lazy(() => NodeSchema)).optional(),
});

// Paragraph Node
const ParagraphNodeSchema = z.object({
  type: z.literal("paragraph"),
  content: z.array(z.lazy(() => NodeSchema)).optional(), // Paragraphs can contain nested nodes
});

const CodeBlockNodeSchema = z.object({
  type: z.literal("codeBlock"),
  attrs: z.object({
    language: z.string().optional().nullable(),
  }),
  content: z.array(z.lazy(() => NodeSchema)).optional(), // Paragraphs can contain nested nodes
});

export const ImageNodeSchema = z.object({
  type: z.literal("image"),
  attrs: z.object({
    alt: z.string().optional(),
    fileName: z.string().optional().nullable(),
    height: z.number().min(1),
    id: z.string().optional(),
    src: z.string().url(),
    title: z.string().optional(),
    width: z.number().min(1),
  }),
});

const HorizontalRuleNode = z.object({
  type: z.literal("horizontalRule"),
});

// Heading Node
const HeadingNodeSchema = z.object({
  type: z.literal("heading"),
  attrs: z.object({
    level: z.number().min(1).max(6), // Heading levels (1-6)
  }),
  content: z.array(z.lazy(() => NodeSchema)).optional(), // Headings can contain nested content
});

// Heading Node
const ListItemNodeSchema = z.object({
  type: z.literal("listItem"),
  content: z.array(z.lazy(() => NodeSchema)).optional(), // Headings can contain nested content
});

// Block quote Node
const BlockQuoteNodeSchema = z.object({
  type: z.literal("blockquote"),
  content: z.array(z.lazy(() => NodeSchema)).optional(), // Headings can contain nested content
});

// Heading Node
const OrderedListNodeSchema = z.object({
  type: z.literal("orderedList"),
  attrs: z.object({
    start: z.number().min(0),
  }),
  content: z.array(z.lazy(() => NodeSchema)).optional(), // Headings can contain nested content
});

// Heading Node
const BullestListNodeSchema = z.object({
  type: z.literal("bulletList"),
  content: z.array(z.lazy(() => NodeSchema)).optional(), // Headings can contain nested content
});

const NodeSchema: z.ZodTypeAny = z.union([
  TextNodeSchema,
  ParagraphNodeSchema,
  HeadingNodeSchema,
  LinkNodeSchema,
  ListItemNodeSchema,
  OrderedListNodeSchema,
  BullestListNodeSchema,
  CodeBlockNodeSchema,
  ImageNodeSchema,
  HorizontalRuleNode,
  BlockQuoteNodeSchema,
]);
export type NodeType = z.infer<typeof NodeSchema>;

// Root Document Schema
const TiptapSchema = z
  .object({
    type: z.literal("doc"),
    content: z.array(NodeSchema), // The document's content
  })
  .optional()
  .nullable();

export { NodeSchema, TiptapSchema };
