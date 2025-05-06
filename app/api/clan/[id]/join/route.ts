import { APIResponse } from "@/app/api/types/core/api";
import { getClan } from "@/data-access/clan";
import {
  createRequestToJoinClan,
  getMostRecentRequest,
} from "@/data-access/clan-join-request";
import { getMember } from "@/data-access/member";
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

    // Check if user is a member in the clan
    const [existingMemberError, member] = await getMember({
      clanId: id,
      userId: auth.session!.user.id,
    });
    if (existingMemberError) throw existingMemberError;

    if (member) {
      return NextResponse.json(
        {
          message: "You are already a member of this clan!",
          error: "ALREADY_MEMBER",
        } as APIResponse,
        { status: 409 }
      );
    }

    // Check if the clan is hidden or banned
    if (clan.visibility === "Hidden") {
      return NextResponse.json(
        {
          message: "You do not have permissions to view this clan.",
          error: "INVALID_PERMISSIONS",
        } as APIResponse,
        { status: 403 }
      );
    }

    if (clan.banned) {
      return NextResponse.json(
        {
          message: "This clan is banned. You can not request to join it.",
          error: "CLAN_BANNED",
        } as APIResponse,
        { status: 403 }
      );
    }

    // check if their is an outgoing join request
    const [existingRequestError, existingRequest] = await getMostRecentRequest({
      clanId: id,
      userId: auth.session!.user.id,
    });
    if (existingRequestError) throw existingRequestError;

    // Cant request to join again
    if (
      existingRequest &&
      !existingRequest.allowAnotherApplication &&
      existingRequest.status === "Denied"
    ) {
      return NextResponse.json(
        {
          message: "You are not allowed to request to join this clan again.",
          error: "ANOTHER_APP_NOT_ALLOWED",
        } as APIResponse,
        { status: 403 }
      );
    }
    // Is not approved
    if (existingRequest && existingRequest.status === "Submitted") {
      return NextResponse.json(
        {
          message:
            "You can not request to join this clan again. You have a current pending request.",
          error: "REQUEST_PENDING",
        } as APIResponse,
        { status: 403 }
      );
    }

    const [requestError, requestToJoin] = await createRequestToJoinClan({
      clanId: id,
      userId: auth.session!.user.id,
    });
    if (requestError) throw requestError;

    return NextResponse.json(
      {
        message: "Your request has been submitted!",
        data: requestToJoin,
      } as APIResponse<ClanJoinRequest>,
      { status: 201 }
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
