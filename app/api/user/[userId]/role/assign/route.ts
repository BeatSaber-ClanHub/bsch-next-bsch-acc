import { APIResponse } from "@/app/api/types/core/api";
import roleSchema from "@/app/validation-schemas/staff/staff-role";
import { assignStaff, getStaffMember } from "@/data-access/staff";
import { getUserById } from "@/data-access/user";
import { Role, Staff } from "@/prisma/generated/prisma/client";
import authenticationCheck, {
  isNextResponse,
} from "@/utils/authentication-check";
import canManage from "@/utils/can-manage";
import getRole from "@/utils/get-role";
import { NextRequest, NextResponse } from "next/server";
import { validate as uuidValidate } from "uuid";
import { z } from "zod";

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

    // Extract body
    const body: z.infer<typeof roleSchema> = await request.json();

    // Validate
    const { error } = roleSchema.safeParse(body);
    if (error) {
      const resp: APIResponse = {
        error: "VALIDATION_ERROR",
        message: "Invalid request body!",
        validationError: error.flatten(),
      };
      return NextResponse.json(resp, {
        status: 400,
      });
    }

    if (userId === session!.user.id) {
      const resp: APIResponse = {
        message: "You can't reassign roles to yourself!",
        error: "SELF_ASSIGN_ATTEMPT",
      };
      return NextResponse.json(resp, { status: 409 });
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

    if (user.banned) {
      return NextResponse.json(
        {
          message: "This user is banned!",
          error: "USER_BANNED",
        } as APIResponse,
        { status: 409 }
      );
    }

    // Check user is in the clan
    const [staffErr, staffMember] = await getStaffMember({
      where: {
        userId: userId,
      },
    });
    if (staffErr) throw staffErr;

    if (staffMember) {
      const canManageUser = canManage({
        activeUserRole: role,
        otherUserRole: staffMember.role,
      });

      if (!canManageUser) {
        return NextResponse.json(
          {
            error: "INVALID_PERMISSIONS",
            message:
              "You do not have permissions to manage roles for this user.",
          } as APIResponse,
          { status: 403 }
        );
      }
    }

    const [assignErr, assignedStaff] = await assignStaff({
      role: body.role,
      userId: userId,
    });

    if (assignErr) throw assignErr;

    // Prevent self ban
    return NextResponse.json(
      {
        message: "Role assigned!",
        data: assignedStaff,
      } as APIResponse<Staff>,
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
