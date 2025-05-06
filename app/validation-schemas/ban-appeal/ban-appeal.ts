import { z } from "zod";

export const reviewStates = [
  "Approved",
  "Denied",
  "In_Review",
  "Submitted",
] as const;

export const appealActionsSchema = z.object({
  comments: z
    .string()
    .max(1000, { message: "Comments must be 1000 or fewer characters." })
    .trim()
    .optional(),
  status: z.enum(reviewStates).optional().default("Submitted"),
  allowAnotherAppeal: z.boolean().optional().default(false),
});
