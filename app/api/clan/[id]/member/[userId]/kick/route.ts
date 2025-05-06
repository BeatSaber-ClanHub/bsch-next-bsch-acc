import { APIResponse } from "@/app/api/types/core/api";
import { getClan } from "@/data-access/clan";
import { getClanRoleFromUserIdAndClanId } from "@/data-access/clan-staff";
import {
  EnrichedClanMember,
  getMember,
  kickMember,
} from "@/data-access/member";
import { getUserById } from "@/data-access/user";
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
    const { session } = auth;

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
      clanId: clan.id,
      userId: session!.user.id,
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
        error: "INVAL_PERM_USR_KICK_FRM_CLN",
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

    if (member.banned) {
      return NextResponse.json(
        {
          error: "USER_BANNED",
          message: "You can not kick a banned user.",
        } as APIResponse,
        { status: 409 }
      );
    }
    if (!canBan) {
      const resp: APIResponse = {
        message: "You do not have permissions to kick this user.",
        error: "NO_KICK_PERMISSION",
      };
      return NextResponse.json(resp, { status: 403 });
    }

    // Prevent self ban
    if (userId === session!.user.id) {
      const resp: APIResponse = {
        message: "You can't kick yourself!",
        error: "SELF_KICK_ATTEMPT",
      };
      return NextResponse.json(resp, { status: 400 });
    }

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

    const [kickError, kickedMember] = await kickMember(member.id);
    if (kickError) throw kickError;

    const resp: APIResponse<EnrichedClanMember> = {
      message: "User kicked!",
      data: kickedMember!,
    };

    return NextResponse.json(resp, { status: 200 });
  } catch (error) {
    console.log(error);
    const resp: APIResponse = {
      message: "Something went wrong!",
      error: "CLAN_MEMBER_KICK_ERROR",
    };

    return NextResponse.json(resp, { status: 500 });
  }
};
