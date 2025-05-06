import { APIResponse } from "@/app/api/types/core/api";
import { getClan } from "@/data-access/clan";
import { getClanRoleFromUserIdAndClanId } from "@/data-access/clan-staff";
import { getMember } from "@/data-access/member";
import { getUserById } from "@/data-access/user";
import { deleteUserBan } from "@/data-access/user-ban";
import authenticationCheck, {
  isNextResponse,
} from "@/utils/authentication-check";
import getClanRole from "@/utils/get-clan-role";
import { NextRequest, NextResponse } from "next/server";
import { validate as uuidValidate } from "uuid";

export const POST = async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string; userId: string }> }
) => {
  try {
    const auth = await authenticationCheck();
    if (isNextResponse(auth)) return auth;

    // Get clan and user ID's
    const clanId = (await params).id;
    const userId = (await params).userId;

    // Make sure they are valid Object IDS
    if (!uuidValidate(clanId)) {
      const resp: APIResponse = {
        message: "Malformed Clan ID!",
        error: "MALFORMED_ID",
      };

      return NextResponse.json(resp, { status: 400 });
    }
    if (!uuidValidate(userId)) {
      const resp: APIResponse = {
        message: "Malformed User ID!",
        error: "MALFORMED_ID",
      };

      return NextResponse.json(resp, { status: 400 });
    }

    // Make sure the request body is valid

    // Check clanId exists
    const [clanError, clan] = await getClan(clanId);
    if (clanError) throw clanError;

    if (!clan) {
      const resp: APIResponse = {
        error: "NOT_FOUND",
        message: "This Clan doesn't exist!",
      };

      return NextResponse.json(resp, { status: 404 });
    }

    // Check user is in the clan
    const [clanMemberError, member] = await getMember({
      clanId: clanId,
      userId: userId,
    });
    if (clanMemberError) throw clanMemberError;

    if (!member) {
      const resp: APIResponse = {
        message: "This user is not a member of this Clan!",
        error: "NOT_FOUND",
      };

      return NextResponse.json(resp, { status: 404 });
    }

    // Make sure user has permissions to ban user
    /**
     * Can ban if (owner is creator)
     * User is Admin and is banned someone of lower rank
     * User is not trying to ban themselves
     */

    const { role } = await getClanRole({
      clanId: clanId,
      userId: auth.session!.user.id,
    });
    const [roleOfActionableUserError, actionableUserRole] =
      await getClanRoleFromUserIdAndClanId({
        clanId: clanId,
        userId: userId,
      });

    if (roleOfActionableUserError) throw roleOfActionableUserError;

    // Check if the user making the request has permission to ban
    if (
      !role ||
      (role !== "Moderator" && role !== "Administrator" && role !== "Creator")
    ) {
      const resp: APIResponse = {
        message: "Invalid Permissions!",
        error: "INVAL_PERM_USR_UNBAN_FRM_CLN",
      };

      return NextResponse.json(resp, { status: 403 });
    }

    let canBan = false;
    // If the target user has a role
    if (actionableUserRole?.role !== undefined) {
      if (role === "Creator") {
        // Creator can ban anyone
        canBan = true;
      } else if (role === "Administrator") {
        // Admin can ban Moderators, but not other Admins or the Creator
        if (actionableUserRole.role === "Moderator") {
          canBan = true;
        } else {
          canBan = false;
        }
      } else if (role === "Moderator") {
        // Moderators cannot ban anyone higher or at the same level
        canBan = false;
      }
    } else {
      // If the target user has no role, allow banning unless the requester is a Moderator
      canBan = role !== "Moderator"; // Moderators can't ban users, others (Admins, Creators) can
    }

    if (!canBan) {
      const resp: APIResponse = {
        message: "You do not have permissions to ban this user.",
        error: "NO_BAN_PERMISSION",
      };
      return NextResponse.json(resp, { status: 403 });
    }

    // Get the users account ID (this is because if they delete their account, we can still ban it )
    const [userError, user] = await getUserById(userId);
    if (userError) throw userError;

    if (!user) throw Error("User not found!");

    // Create the ban
    const [banError, ban] = await deleteUserBan(member.id);
    if (banError) throw banError;

    const resp: APIResponse = {
      message: "User unbanned!",
      data: ban,
    };

    return NextResponse.json(resp, { status: 200 });
  } catch (error) {
    console.log(error);
    const resp: APIResponse = {
      message: "Something went wrong!",
      error: "CLAN_MEMBER_BAN_ERROR",
    };

    return NextResponse.json(resp, { status: 500 });
  }
};
