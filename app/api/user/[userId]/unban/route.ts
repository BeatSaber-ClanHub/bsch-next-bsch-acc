import { APIResponse } from "@/app/api/types/core/api";
import { getDiscordId } from "@/data-access/account";
import { getUserById } from "@/data-access/user";
import { deleteUserPlatformBan } from "@/data-access/user-ban";
import { UserBan } from "@/prisma/generated/prisma/client";
import authenticationCheck, {
  isNextResponse,
} from "@/utils/authentication-check";
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
        message: "You can't unban yourself!",
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

    if (!user.banned) {
      return NextResponse.json(
        {
          error: "UNBANNED",
          message: "This user is already unbanned.",
        } as APIResponse,
        { status: 409 }
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
    const [banError, ban] = await deleteUserPlatformBan(user.id);
    if (banError) throw banError;

    return NextResponse.json(
      {
        message: "User unbanned!",
        data: ban,
      } as APIResponse<UserBan>,
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    const resp: APIResponse = {
      message: "Something went wrong!",
      error: "USER_UNBAN_ERROR",
    };

    return NextResponse.json(resp, { status: 500 });
  }
};
