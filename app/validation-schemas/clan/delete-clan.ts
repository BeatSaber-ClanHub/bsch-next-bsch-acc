import { z } from "zod";

const deleteClanSchema = z.object({
  confirmationPhrase: z
    .literal("Delete this clan", {
      message: "You must enter the bolded phrase.",
    })
    .transform((value) => (value === "Delete this clan" ? value : "")),
});

export default deleteClanSchema;
