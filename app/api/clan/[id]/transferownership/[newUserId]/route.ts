import { APIResponse } from "@/app/api/types/core/api";
import {
  ClanWithClanOwnerInfoAndBasicData,
  getClan,
  transferClanOwnership,
} from "@/data-access/clan";
import { getMember } from "@/data-access/member";
import { getUserById } from "@/data-access/user";
import authenticationCheck, {
  isNextResponse,
} from "@/utils/authentication-check";
import { NextRequest, NextResponse } from "next/server";
import { validate as uuidValidate } from "uuid";

export const POST = async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string; newUserId: string }> }
) => {
  try {
    const auth = await authenticationCheck();
    if (isNextResponse(auth)) return auth;
    // Get clan ID
    const { id, newUserId } = await params;

    const isValidId = uuidValidate(id);
    if (!isValidId) {
      const resp: APIResponse = {
        error: "MALFORMED_ID",
        message: "This Clan ID is not valid",
      };

      return NextResponse.json(resp, { status: 400 });
    }

    const [clanError, clan] = await getClan(id);
    if (clanError) throw clanError;

    if (!clan) {
      const resp: APIResponse = {
        message: "Clan not found!",
        error: "NOT_FOUND",
      };

      return NextResponse.json(resp, { status: 404 });
    }

    if (clan.clan_owner !== auth.session!.user.id) {
      return NextResponse.json(
        {
          message: "Only the clan owner can transfer ownership.",
          error: "USER_NOT_CLAN_OWNER",
        } as APIResponse,
        { status: 403 }
      );
    }

    const [oldOwnerError, oldOwnerMember] = await getMember({
      clanId: id,
      userId: auth.session!.user.id,
    });
    if (oldOwnerError) throw oldOwnerError;
    const oldOwnerMemberId = oldOwnerMember!.id;

    const [newOwnerUserError, newOwnerUser] = await getUserById(newUserId);
    if (newOwnerUserError) throw newOwnerUserError;

    if (!newOwnerUser) {
      return NextResponse.json(
        {
          message: "This user does not exist.",
          error: "USER_DNE",
        } as APIResponse,
        { status: 404 }
      );
    }

    if (newOwnerUser.banned) {
      return NextResponse.json(
        {
          message:
            "This user has been banned from BSCH. You can not make then an owner.",
          error: "USER_BANNED",
        } as APIResponse,
        { status: 405 }
      );
    }

    const [newOwnerError, newOwnerMember] = await getMember({
      clanId: id,
      userId: newUserId,
    });
    if (newOwnerError) throw newOwnerError;
    if (!newOwnerMember) {
      return NextResponse.json(
        {
          message: "This user is not a member of this clan.",
          error: "USER_NOT_MEMBER",
        } as APIResponse,
        { status: 404 }
      );
    }

    if (newOwnerMember.banned) {
      return NextResponse.json(
        {
          message:
            "This member is banned from your clan. Please unban them first.",
          error: "MEMBER_BANNED",
        } as APIResponse,
        { status: 405 }
      );
    }

    const newOwnerMemberId = newOwnerMember.id;

    const [transferError, transferedClan] = await transferClanOwnership({
      clanId: id,
      newOwnerUserId: newUserId,
      newOwnerMemberId: newOwnerMemberId,
      oldOwnerMemberId: oldOwnerMemberId,
    });
    if (transferError) throw transferError;

    return NextResponse.json(
      {
        message: "This clan has been unbanned!",
        data: transferedClan,
      } as APIResponse<ClanWithClanOwnerInfoAndBasicData>,
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    const resp: APIResponse = {
      error: "UNBAN_FAILED",
      message: "There was an issue unbanning this clan!",
    };

    return NextResponse.json(resp, { status: 500 });
  }
};
