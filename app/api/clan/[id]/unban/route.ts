import {
  ClanWithClanOwnerInfoAndBasicData,
  getClan,
  unbanClan,
} from "@/data-access/clan";
import authenticationCheck, {
  isNextResponse,
} from "@/utils/authentication-check";
import { NextRequest, NextResponse } from "next/server";
import { validate as uuidValidate } from "uuid";
import { APIResponse } from "../../../types/core/api";

export const POST = async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const auth = await authenticationCheck();
    if (isNextResponse(auth)) return auth;
    const { role } = auth;
    // Get clan ID
    const { id } = await params;

    if (
      role !== "Administrator" &&
      role !== "Developer" &&
      role !== "Moderator"
    ) {
      return NextResponse.json(
        {
          message: "You do not have permissions to unban clans!",
          error: "INVALID_PERMISSIONS",
        } as APIResponse,
        { status: 403 }
      );
    }

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

    const [unbanError, unbannedClan] = await unbanClan(id);
    if (unbanError) throw unbanError;

    return NextResponse.json(
      {
        message: "This clan has been unbanned!",
        data: unbannedClan,
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
