import { z } from "zod";

export const reportClanSchema = z.object({
  reason: z
    .string({ message: "Must be a string" })
    .min(1, { message: "Must be more than 1 character" })
    .max(300, { message: "Must be 300 characters of fewer" }),
});
