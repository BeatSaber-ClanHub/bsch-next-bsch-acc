import ObjectID from "bson-objectid";
import { z } from "zod";
import { TiptapSchema } from "../tiptap/schema";

// This schema covers both server-side and client-side validation
// This schema is for creating a clan

const clanSchema = z.object({
  clan_name: z
    .string()
    .min(1, { message: "Must be at least 2 characters long" })
    .max(20, { message: "Must be 20 or fewer characters long" })
    .trim(),
  clan_tag: z
    .string()
    .min(2, { message: "Must be at least 2 characters long" })
    .max(6, { message: "Must be 6 or fewer characters long" })
    .trim(),
  clan_specialties: z.array(
    z.enum(["Speed", "Acc", "Challenge", "Ranked", "Everything"])
  ),
  logo_url: z.string().url({ message: "Logo URL is not valid" }).trim(),
  banner_url: z.string().url({ message: "Banner URL is not valid" }).trim(),
  discord_invite_link: z
    .string()
    .url({ message: "Must be a valid URL" })
    .startsWith("https://discord.gg", {
      message: "Must be a valid Discord invite link",
    }),
  description: z
    .string()
    .max(5000, { message: "Must be 5000 or fewer characters long" }),
  clan_owner: z.instanceof(ObjectID, {
    message: "created_by is not a valid ObjectID",
  }),
  application_status: z.enum(["None", "Applied", "In_Review", "Denied"], {
    message: "Invalid application status",
  }),
  visibility: z.enum(["Visible", "Hidden"], { message: "Invalid visibility" }),
  clan_short_description: z
    .string({ message: "Must be a string" })
    .min(1, { message: "Description must be 1 or more characters." })
    .max(150, { message: "Description must be 150 characters or fewer." })
    .trim(),
});

export const editClanSchema = z.object({
  clan_name: z
    .string()
    .min(2, { message: "Must be at least 2 characters long" })
    .max(20, { message: "Must be 20 or fewer characters long" })
    .trim()
    .optional(),
  clan_tag: z
    .string()
    .min(2, { message: "Must be at least 2 characters long" })
    .max(6, { message: "Must be 6 or fewer characters long" })
    .trim()
    .optional(),
  clan_specialties: z
    .array(z.enum(["Speed", "Acc", "Challenge", "Ranked", "Everything"]))
    .optional(),
  discord_invite_link: z
    .string()
    .url({ message: "Must be a valid URL" })
    .startsWith("https://discord.gg", {
      message: "Must be a valid Discord invite link",
    })
    .optional(),
  remove_clan_specialties: z
    .array(z.enum(["Speed", "Acc", "Challenge", "Ranked", "Everything"]))
    .optional(),
  description: TiptapSchema,
  visibility: z
    .enum(["Visible", "Hidden"], { message: "Invalid visibility" })
    .optional(),
  clan_short_description: z
    .string({ message: "Must be a string" })
    .min(1, { message: "Description must be 1 or more characters." })
    .max(150, { message: "Description must be 150 characters or fewer." })
    .trim()
    .optional(),
});

export default clanSchema;
