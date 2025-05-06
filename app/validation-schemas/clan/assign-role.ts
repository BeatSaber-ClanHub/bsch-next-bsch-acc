import { z } from "zod";
const roles = ["Administrator", "Creator", "Moderator"] as const;

const clanRoleSchema = z.object({
  role: z.enum(roles, { message: "Invalid Role" }),
});

export default clanRoleSchema;
