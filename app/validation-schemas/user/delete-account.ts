import { z } from "zod";

const deleteAccountSchema = z.object({
  confirmationPhrase: z
    .literal("Delete my account", {
      message: "You must enter the bolded phrase.",
    })
    .transform((value) => (value === "Delete my account" ? value : "")),
});

export default deleteAccountSchema;
