import { BasicUser } from "@/data-access/user";
import { Role } from "@/prisma/generated/prisma/client";
export type ActionsMenuChildrenProps = {
  user: BasicUser;
  activeUserRole: Role;
};
