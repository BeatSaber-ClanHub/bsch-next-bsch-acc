import { z } from "zod";

const deleteAPIKeySchema = z.object({
  confirmationPhrase: z
    .literal("Delete this key", {
      message: "You must enter the bolded phrase.",
    })
    .transform((value) => (value === "Delete this key" ? value : "")),
});

export default deleteAPIKeySchema;
