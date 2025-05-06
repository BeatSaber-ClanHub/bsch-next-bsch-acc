import { APIResponse } from "@/app/api/types/core/api";
import banFromClanSchema from "@/app/validation-schemas/ban/ban-from-clan";
import { getDiscordId } from "@/data-access/account";
import { getStaffMember } from "@/data-access/staff";
import { getUserById } from "@/data-access/user";
import { createUserBan } from "@/data-access/user-ban";
import { UserBan } from "@/prisma/generated/prisma/client";
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

    // Get clan and user ID's
    const userId = (await params).userId;

    // Make sure they are valid Object IDS

    if (!uuidValidate(userId)) {
      const resp: APIResponse = {
        message: "Malformed User ID!",
        error: "MALFORMED_ID",
      };

      return NextResponse.json(resp, { status: 400 });
    }

    // Validate the request body
    const body: z.infer<typeof banFromClanSchema> = await request.json();
    const { error } = banFromClanSchema.safeParse(body);
    if (error) {
      const resp: APIResponse = {
        error: "VALIDATION_ERROR",
        message: "Invalid request body!",
        validationError: error.flatten(),
      };
      return NextResponse.json(resp, {
        status: 400,
        statusText: "Invalid request body",
      });
    }

    const { role } = await getRole();
    // Check if the user making the request has permission to ban
    if (
      !role ||
      (role !== "Moderator" && role !== "Administrator" && role !== "Developer")
    ) {
      const resp: APIResponse = {
        message: "Invalid Permissions!",
        error: "INVALID_PERMISSIONS",
      };

      return NextResponse.json(resp, { status: 403 });
    }

    // Prevent self ban
    if (userId === session!.user.id) {
      const resp: APIResponse = {
        message: "You can't ban yourself!",
        error: "SELF_BAN_ATTEMPT",
      };
      return NextResponse.json(resp, { status: 409 });
    }

    // Get the users account ID (this is because if they delete their account, we can still ban it )
    const [userError, user] = await getUserById(userId);
    if (userError) throw userError;

    if (!user) {
      return NextResponse.json(
        {
          message: "This user does not exist.",
          error: "USER_NOT_FOUND",
        } as APIResponse,
        { status: 404 }
      );
    }

    const [otherStaffErr, otherStaffMember] = await getStaffMember({
      where: { userId: user.id },
    });
    if (otherStaffErr) throw otherStaffErr;

    if (otherStaffMember) {
      const canManageUser = canManage({
        activeUserRole: role,
        otherUserRole: otherStaffMember.role,
      });

      if (!canManageUser) {
        return NextResponse.json(
          {
            message: "You do not have permissions to ban this user.",
            error: "NO_BAN_PERMISSION",
          } as APIResponse,
          { status: 403 }
        );
      }
    }

    if (user.banned) {
      return NextResponse.json(
        {
          error: "BANNED",
          message: "This user is already banned.",
        } as APIResponse,
        { status: 400 }
      );
    }

    const [discordIdErr, discordId] = await getDiscordId(userId);
    if (discordIdErr) throw discordIdErr;

    if (!discordId) {
      return NextResponse.json(
        {
          error: "ACCOUNT_DATA_NOT_FOUND",
          message: "We could not find account data on this user!",
        } as APIResponse,
        { status: 404 }
      );
    }

    // Create the ban
    const [banError, ban] = await createUserBan({
      discordId: discordId,
      justification: body.justification,
      userId: userId,
      type: "From_Platform",
    });
    if (banError) throw banError;

    return NextResponse.json(
      {
        message: "User banned!",
        data: ban,
      } as APIResponse<UserBan>,
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    const resp: APIResponse = {
      message: "Something went wrong!",
      error: "USER_BAN_ERROR",
    };

    return NextResponse.json(resp, { status: 500 });
  }
};
