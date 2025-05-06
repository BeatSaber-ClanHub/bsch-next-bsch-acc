import { APIResponse } from "@/app/api/types/core/api";
import clanRoleSchema from "@/app/validation-schemas/clan/assign-role";
import { getClan } from "@/data-access/clan";
import {
  createClanStaffMember,
  getClanRoleFromUserIdAndClanId,
  updateClanMemberRole,
} from "@/data-access/clan-staff";
import { getMember } from "@/data-access/member";
import authenticationCheck, {
  isNextResponse,
} from "@/utils/authentication-check";
import getClanRole from "@/utils/get-clan-role";
import { ClanStaff } from "@/prisma/generated/prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { validate as uuidValidate } from "uuid";
import { z } from "zod";

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

    // Validate the request body
    const body: z.infer<typeof clanRoleSchema> = await request.json();
    const { error } = clanRoleSchema.safeParse(body);
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

    // Prevent self ban
    if (userId === session!.user.id) {
      const resp: APIResponse = {
        message: "You can't reassign roles to yourself!",
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

    let canAssign = false;

    // If the target user has a role
    if (actionableUserRole?.role) {
      if (role === "Creator") {
        // Creator can assign roles to anyone
        canAssign = true;
      } else if (role === "Administrator") {
        // Admin can assign roles to Moderators, but not other Admins or the Creator
        if (actionableUserRole.role === "Moderator") {
          canAssign = true;
        } else {
          canAssign = false;
        }
      } else if (role === "Moderator") {
        // Moderators cannot ban anyone higher or at the same level
        canAssign = false;
      }
    } else {
      canAssign = true;
    }

    if (!canAssign) {
      const resp: APIResponse = {
        message: "You do not have permissions to assign this role.",
        error: "NO_ASSIGN_PERMISSION",
      };
      return NextResponse.json(resp, { status: 403 });
    }

    if (body.role === "Creator") {
      return NextResponse.json(
        {
          message:
            "To assign the 'Creator' role, you will need to transfer ownership.",
          error: "TRANSFER_OWNERSHIP_ACTION_REQUIRED",
        } as APIResponse,
        { status: 405 }
      );
    }

    if (member.banned) {
      return NextResponse.json(
        {
          message:
            "This user has been banned from this clan. Unban them to assign a role.",
          error: "MEMBER_BANNED_FROM_CLAN",
        } as APIResponse,
        { status: 405 }
      );
    }

    // Update user role or create one if their is not an existing staff record
    if (!actionableUserRole) {
      const [error, staffMember] = await createClanStaffMember({
        clanId: clanId,
        role: body.role,
        userId: userId,
        memberId: member.id,
      });

      if (error) throw error;

      return NextResponse.json(
        {
          message: "Role assigned!",
          data: staffMember,
        } as APIResponse<ClanStaff>,
        {
          status: 200,
        }
      );
    }

    const [updateError, staffMember] = await updateClanMemberRole({
      memberId: member.id,
      role: body.role,
    });

    if (updateError) throw updateError;

    return NextResponse.json(
      {
        message: "Role assigned!",
        data: staffMember,
      } as APIResponse<ClanStaff>,
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
