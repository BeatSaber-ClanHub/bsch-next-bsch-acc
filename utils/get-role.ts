import { getStaff } from "@/data-access/staff";
import { Role } from "@/prisma/generated/prisma/client";

interface RoleResponse {
  role: Role | null;
  error?: string;
}

const getRole = async (): Promise<RoleResponse> => {
  try {
    const [staffError, staff] = await getStaff();
    if (staffError) throw staffError;

    if (!staff) {
      return { role: null, error: "No staff member found." };
    }

    return { role: staff.role };
  } catch (error) {
    console.log(error);
    return { role: null, error: "Something went wrong getting role." };
  }
};

export default getRole;
