import { APIResponse } from "@/app/api/types/core/api";
import { getClan } from "@/data-access/clan";
import {
  getClanRoleFromUserIdAndClanId,
  unassignRole,
} from "@/data-access/clan-staff";
import { getMember } from "@/data-access/member";
import authenticationCheck, {
  isNextResponse,
} from "@/utils/authentication-check";
import getClanRole from "@/utils/get-clan-role";
import { ClanStaff, ClanStaffRole } from "@/prisma/generated/prisma/client";
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

    // Get role of user making the request
    const { role } = await getClanRole({
      clanId: clanId,
      userId: session!.user.id,
    });

    // If they do not have a role in the clan
    if (!role) {
      return NextResponse.json(
        {
          message: "You do not have permissions to manage roles.",
          error: "INVALID_PERMISSIONS",
        } as APIResponse,
        { status: 403 }
      );
    }
    // Check user is in the clan
    const [clanMemberError, member] = await getMember({
      clanId: clanId,
      userId: userId,
    });
    if (clanMemberError) throw clanMemberError;

    // If they have moderator role. Only Admin and creators can manage roles.
    if (role === "Moderator") {
      return NextResponse.json(
        {
          message: "You do not have permissions to manage roles.",
          error: "INVALID_PERMISSIONS",
        } as APIResponse,
        { status: 403 }
      );
    }

    // Check if the person they are attempting to assign a role to exists in the clan
    if (!member) {
      const resp: APIResponse = {
        message: "This user is not a member of this Clan!",
        error: "NOT_FOUND",
      };

      return NextResponse.json(resp, { status: 404 });
    }

    // Prevent self ban
    if (userId === session!.user.id) {
      const resp: APIResponse = {
        message: "You can't unassign roles from yourself!",
        error: "SELF_BAN_ATTEMPT",
      };
      return NextResponse.json(resp, { status: 400 });
    }

    // Make sure user has permissions to ban user
    /**
     * Can ban if (owner is creator)
     * User is Admin and is banned someone of lower rank
     * User is not trying to ban themselves
     */

    const [roleOfActionableUserError, actionableUserRole] =
      await getClanRoleFromUserIdAndClanId({
        clanId: clanId,
        userId: userId,
      });

    if (roleOfActionableUserError) throw roleOfActionableUserError;

    if (!actionableUserRole?.role) {
      return NextResponse.json(
        {
          message: "This member does not have a role to unassign!",
          error: "MEMBER_DOES_NOT_HAVE_ROLE",
        } as APIResponse,
        { status: 404 }
      );
    }
    let canUnassign = false;

    // If the target user has a role
    if (role === "Creator") {
      // Creator can assign roles to anyone
      canUnassign = true;
    } else if (role === "Administrator") {
      // Admin can assign roles to Moderators, but not other Admins or the Creator
      if (actionableUserRole.role === "Moderator") {
        canUnassign = true;
      } else {
        canUnassign = false;
      }
    } else if (role === "Moderator") {
      // Moderators cannot ban anyone higher or at the same level
      canUnassign = false;
    }

    if (!canUnassign) {
      const resp: APIResponse = {
        message: "You do not have permissions to unassign this role.",
        error: "NO_ASSIGN_PERMISSION",
      };
      return NextResponse.json(resp, { status: 403 });
    }

    const [unassignError, unassigned] = await unassignRole(member.id);

    if (unassignError) throw unassignError;
    return NextResponse.json(
      {
        message: "Role unassigned!",
        data: {
          ...unassigned,
          role: "Member",
        },
      } as APIResponse<ClanStaff & { role: ClanStaffRole | "Member" }>,
      {
        status: 200,
      }
    );
  } catch (error) {
    console.log(error);
    const resp: APIResponse = {
      message: "Something went wrong!",
      error: "CLAN_ROLE_ERR",
    };

    return NextResponse.json(resp, { status: 500 });
  }
};
