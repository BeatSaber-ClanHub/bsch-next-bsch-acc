import { Role } from "@/prisma/generated/prisma/client";

function canManage({
  activeUserRole,
  otherUserRole,
}: {
  activeUserRole: Role | "User";
  otherUserRole: Role | "User";
}): boolean {
  if (
    activeUserRole === "Moderator" &&
    ["Administrator", "Developer"].includes(otherUserRole)
  )
    return false;

  if (
    activeUserRole === "Administrator" &&
    ["Developer"].includes(otherUserRole)
  )
    return false;

  if (activeUserRole === otherUserRole) return false;

  return true;
}

export default canManage;
