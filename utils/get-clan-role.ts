import { getStaffMember } from "@/data-access/clan-staff";
import { ClanStaffRole } from "@/prisma/generated/prisma/client";
import { checkAuth } from "./check-auth";

interface RoleResponse {
  role: ClanStaffRole | null;
  error?: string;
}

const getClanRole = async ({
  clanId,
  userId,
}: {
  clanId: string;
  userId: string;
}): Promise<RoleResponse> => {
  try {
    if (!userId) return { role: null, error: "Not Authenticated" };

    const [staffError, staff] = await getStaffMember({
      clanId: clanId,
      userId: userId,
    });
    if (staffError) throw staffError;

    if (!staff) {
      return { role: null, error: "Member not found." };
    }

    return { role: staff.role };
  } catch (error) {
    console.log(error);
    return { role: null, error: "Something went wrong getting role." };
  }
};

export default getClanRole;
