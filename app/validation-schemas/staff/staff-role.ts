import { z } from "zod";

const roleSchema = z.object({
  role: z.enum(["Currator", "Moderator", "Administrator", "Developer"], {
    message: "Invalid role",
  }),
});

export default roleSchema;
