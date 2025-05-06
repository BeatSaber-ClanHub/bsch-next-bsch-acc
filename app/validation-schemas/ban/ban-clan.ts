import { z } from "zod";

const schema = z.object({
  justification: z
    .string()
    .min(10, { message: "Justification is to short" })
    .max(300, { message: "Justification is to long" }),
  permanent: z.boolean().optional(),
  allowAppealAt: z
    .string()
    .or(z.date())
    .optional()
    .transform((val) => (val ? new Date(val) : undefined)) // Transform to Date object
    .refine(
      (date) => {
        if (!date) return true; // Allow optional date to be undefined or null
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Set time to midnight for comparison
        return date >= today;
      },
      {
        message: "The date cannot be in the past.",
      }
    ),
});

// I know this doesnt really follow DRY but i cant be bothered to refactor this rn
export const banClanSchemaWithClanId = schema
  .extend({ clanId: z.string().uuid({ message: "Invalid clan ID" }) })
  .refine(
    (data) => {
      // Ensure allowAppealAt is required if permanet is false
      if (data.permanent === false && !data.allowAppealAt) {
        return false;
      }
      return true;
    },
    {
      message: "An appeal time is required when ban isn't permanent is false.",
      path: ["allowAppealAt"], // Field that causes the issue
    }
  )
  .refine(
    (data) => {
      // Check if allowAppealAt is in the past
      if (data.allowAppealAt) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return data.allowAppealAt >= today;
      }
      return true; // Skip validation if allowAppealAt is not provided
    },
    {
      message: "The date cannot be in the past.",
      path: ["allowAppealAt"],
    }
  );

export const banClanSchema = schema
  .refine(
    (data) => {
      // Ensure allowAppealAt is required if permanet is false
      if (data.permanent === false && !data.allowAppealAt) {
        return false;
      }
      return true;
    },
    {
      message: "An appeal time is required when ban isn't permanent is false.",
      path: ["allowAppealAt"], // Field that causes the issue
    }
  )
  .refine(
    (data) => {
      // Check if allowAppealAt is in the past
      if (data.allowAppealAt) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return data.allowAppealAt >= today;
      }
      return true; // Skip validation if allowAppealAt is not provided
    },
    {
      message: "The date cannot be in the past.",
      path: ["allowAppealAt"],
    }
  );
