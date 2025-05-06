import { APIResponse } from "@/app/api/types/core/api";
import allowAnotherApplicationSchema from "@/app/validation-schemas/join-request/allow-another-application";
import { getClan } from "@/data-access/clan";
import {
  ClanJoinRequestWithUserData,
  getRequest,
  rejectJoinRequest,
} from "@/data-access/clan-join-request";
import authenticationCheck, {
  isNextResponse,
} from "@/utils/authentication-check";
import getClanRole from "@/utils/get-clan-role";
import { NextRequest, NextResponse } from "next/server";
import { validate as uuidValidate } from "uuid";
import { z } from "zod";

export const POST = async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string; requestId: string }> }
) => {
  try {
    const auth = await authenticationCheck();
    if (isNextResponse(auth)) return auth;

    const { id, requestId } = await params;
    const isValidId = uuidValidate(id);
    if (!isValidId) {
      const resp: APIResponse = {
        error: "MALFORMED_ID",
        message: "This Clan ID is not valid",
      };

      return NextResponse.json(resp, { status: 400 });
    }

    if (!uuidValidate(requestId)) {
      const resp: APIResponse = {
        error: "MALFORMED_ID",
        message: "This Request ID is not valid",
      };

      return NextResponse.json(resp, { status: 400 });
    }

    const body: z.infer<typeof allowAnotherApplicationSchema> =
      await request.json();
    const { error } = allowAnotherApplicationSchema.safeParse(body);
    if (error) {
      const resp: APIResponse = {
        error: "VALIDATION_ERROR",
        message: "Invalid request body!",
        validationError: error.flatten(),
      };
      return NextResponse.json(resp, {
        status: 400,
      });
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

    if (clan.banned) {
      return NextResponse.json(
        {
          message: "This clan is banned. Requests can not be managed.",
          error: "CLAN_BANNED",
        } as APIResponse,
        { status: 403 }
      );
    }

    const [requestError, requestToJoin] = await getRequest(requestId);
    if (requestError) throw requestError;

    if (!requestToJoin) {
      return NextResponse.json(
        {
          message: "This request does not exist.",
          error: "REQUEST_NOT_FOUND",
        } as APIResponse,
        { status: 404 }
      );
    }

    if (requestToJoin.status !== "Submitted") {
      return NextResponse.json(
        {
          message: "This request has already been accepted or rejected.",
          error: "INVALID_REQUEST_STATUS",
        } as APIResponse,
        { status: 409 }
      );
    }

    const { role: clanRole } = await getClanRole({
      clanId: clan.id,
      userId: auth.session!.user.id,
    });
    if (
      clanRole !== "Administrator" &&
      clanRole !== "Creator" &&
      clanRole !== "Moderator"
    ) {
      return NextResponse.json(
        {
          message: "You do not have permissions to manage join requests.",
          error: "INVALID_PERMISSIONS",
        } as APIResponse,
        { status: 403 }
      );
    }

    const [rejectError, rejectedJoinRequest] = await rejectJoinRequest({
      requestId: requestToJoin.id,
      reviewedByUserId: auth.session!.user.id,
      allowAnotherApplication: body.allowAnotherApplication,
    });
    if (rejectError) throw rejectError;

    return NextResponse.json(
      {
        message: "This request has been rejected.",
        data: rejectedJoinRequest,
      } as APIResponse<ClanJoinRequestWithUserData>,
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
