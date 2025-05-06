import { APIResponse } from "@/app/api/types/core/api";
import { deleteStaff, getStaffMember } from "@/data-access/staff";
import { getUserById } from "@/data-access/user";
import { Role, Staff } from "@/prisma/generated/prisma/client";
import authenticationCheck, {
  isNextResponse,
} from "@/utils/authentication-check";
import canManage from "@/utils/can-manage";
import getRole from "@/utils/get-role";
import { NextRequest, NextResponse } from "next/server";
import { validate as uuidValidate } from "uuid";

export const POST = async (
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) => {
  try {
    const auth = await authenticationCheck();
    if (isNextResponse(auth)) return auth;
    const { session } = auth;

    const userId = (await params).userId;

    if (!uuidValidate(userId)) {
      const resp: APIResponse = {
        message: "Malformed User ID!",
        error: "MALFORMED_ID",
      };

      return NextResponse.json(resp, { status: 400 });
    }

    if (userId === session!.user.id) {
      const resp: APIResponse = {
        message: "You can't unassign roles from yourself!",
        error: "SELF_UNASSIGN_ATTEMPT",
      };
      return NextResponse.json(resp, { status: 400 });
    }

    // Get role of user making the request
    const { role } = await getRole();
    const staffRolesThatCanManageRoles: Role[] = [
      "Moderator",
      "Administrator",
      "Developer",
    ];
    // If they do not have a role in the clan
    if (!role || !staffRolesThatCanManageRoles.includes(role)) {
      return NextResponse.json(
        {
          message: "You do not have permissions to manage roles.",
          error: "INVALID_PERMISSIONS",
        } as APIResponse,
        { status: 403 }
      );
    }

    // Check user is in the clan
    const [userErr, user] = await getUserById(userId);
    if (userErr) throw userErr;

    if (!user) {
      return Response.json(
        {
          message: "This user does not exist!",
          error: "NOT_FOUND",
        } as APIResponse,
        { status: 404 }
      );
    }

    // Check user is in the clan
    const [staffErr, staffMember] = await getStaffMember({
      where: {
        userId: userId,
      },
    });
    if (staffErr) throw staffErr;

    if (!staffMember) {
      return NextResponse.json(
        {
          message: "This user is not a BSCH staff member.",
          error: "NOT_STAFF",
        } as APIResponse,
        { status: 404 }
      );
    }
    const canManageUser = canManage({
      activeUserRole: role,
      otherUserRole: staffMember.role,
    });

    if (!canManageUser) {
      return NextResponse.json(
        {
          error: "INVALID_PERMISSIONS",
          message: "You do not have permissions to manage roles for this user.",
        } as APIResponse,
        { status: 403 }
      );
    }

    const [assignErr, assignedStaff] = await deleteStaff(userId);

    if (assignErr) throw assignErr;

    // Prevent self ban
    return NextResponse.json(
      {
        message: "Role unassigned!",
        data: {
          ...assignedStaff,
          role: "User",
        },
      } as APIResponse<Staff & { role: Role | "User" }>,
      {
        status: 200,
      }
    );
  } catch (error) {
    console.log(error);
    const resp: APIResponse = {
      message: "Something went wrong!",
      error: "ROLE_ERR",
    };

    return NextResponse.json(resp, { status: 500 });
  }
};
