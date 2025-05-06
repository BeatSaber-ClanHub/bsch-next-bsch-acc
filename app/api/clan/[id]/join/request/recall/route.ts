import { APIResponse } from "@/app/api/types/core/api";
import { getClan } from "@/data-access/clan";
import {
  deleteJoinRequest,
  getMostRecentRequest,
} from "@/data-access/clan-join-request";
import authenticationCheck, {
  isNextResponse,
} from "@/utils/authentication-check";
import { ClanJoinRequest } from "@/prisma/generated/prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { validate as uuidValidate } from "uuid";

export const POST = async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const auth = await authenticationCheck();
    if (isNextResponse(auth)) return auth;

    const { id } = await params;
    const isValidId = uuidValidate(id);
    if (!isValidId) {
      const resp: APIResponse = {
        error: "MALFORMED_ID",
        message: "This Clan ID is not valid",
      };

      return NextResponse.json(resp, { status: 400 });
    }

    // Get the clan
    const [clanError, clan] = await getClan(id);
    if (clanError) throw clanError;

    if (!clan) {
      const resp: APIResponse = {
        message: "Clan not found!",
        error: "NOT_FOUND",
      };

      return NextResponse.json(resp, { status: 404 });
    }

    const [requestError, requestToJoin] = await getMostRecentRequest({
      clanId: clan.id,
      userId: auth.session!.user.id,
    });
    if (requestError) throw requestError;

    if (!requestToJoin || requestToJoin.status !== "Submitted") {
      return NextResponse.json(
        {
          message: "You do not have a pending request to join for this clan.",
          error: "REQUEST_NOT_FOUND",
        } as APIResponse,
        { status: 404 }
      );
    }

    const [deleteError, deletedJoinRequest] = await deleteJoinRequest(
      requestToJoin.id
    );
    if (deleteError) throw deleteError;

    return NextResponse.json(
      {
        message: "Your request has been recalled.",
        data: deletedJoinRequest,
      } as APIResponse<ClanJoinRequest>,
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      {
        message: "There was an issue submitting your request.",
        error: "INTERNAL_ERROR",
      } as APIResponse,
      { status: 500 }
    );
  }
};
