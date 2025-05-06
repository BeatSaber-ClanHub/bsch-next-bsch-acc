import { z } from "zod";

const banFromClanSchema = z.object({
  justification: z
    .string({ message: "Invalid string" })
    .min(10, { message: "Justification is to short" })
    .max(300, { message: "Justification is to long" }),
});

export default banFromClanSchema;
