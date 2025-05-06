import { APIResponse } from "@/app/api/types/core/api";
import {
  ClanWithClanOwnerInfoAndBasicData,
  getClan,
  updateApplicationStatus,
} from "@/data-access/clan";
import {
  getMostRecentApplicationWithAnyStatus,
  removeClanVerification,
} from "@/data-access/clan-verification-application";
import authenticationCheck, {
  isNextResponse,
} from "@/utils/authentication-check";
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
    if (!uuidValidate(id)) {
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

    if (
      auth.role !== "Administrator" &&
      auth.role !== "Developer" &&
      auth.role !== "Moderator" &&
      auth.role !== "Currator"
    ) {
      return NextResponse.json(
        {
          message: "You do not have permissions to unverify clans.",
          error: "INVALID_PERMISSIONS",
        } as APIResponse,
        { status: 403 }
      );
    }

    if (clan.application_status !== "Approved") {
      return NextResponse.json(
        {
          message: "This clan is not yet verified!",
          error: "CLAN_APPROVED",
        } as APIResponse,
        { status: 400 }
      );
    }

    const [mostRecentError, mostRecent] =
      await getMostRecentApplicationWithAnyStatus(clan.id);

    if (mostRecentError) throw mostRecentError;

    if (mostRecent) {
      const [verificationError, verificationStatus] =
        await removeClanVerification(mostRecent.id);
      if (verificationError) throw verificationError;

      return NextResponse.json(
        {
          message: "Clan unverified!",
          data: verificationStatus,
        } as APIResponse<ClanWithClanOwnerInfoAndBasicData>,
        { status: 200 }
      );
    }

    const [verificationError, verificationStatus] =
      await updateApplicationStatus({
        applicationStatus: "Denied",
        clanId: id,
      });
    if (verificationError) throw verificationError;

    return NextResponse.json(
      {
        message: "Clan unverified!",
        data: verificationStatus,
      } as APIResponse<ClanWithClanOwnerInfoAndBasicData>,
      { status: 200 }
    );
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      {
        message: "Unverification failed!",
        error: "UNVERIFICATION_FAILED_SERVER_ERR",
      } as APIResponse,
      { status: 500 }
    );
  }
};
