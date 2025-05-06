import { APIResponse } from "@/app/api/types/core/api";
import {
  ClanWithClanOwnerInfoAndBasicData,
  getClan,
  updateApplicationStatus,
} from "@/data-access/clan";
import {
  getMostRecentApplication,
  verifyClanApplication,
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
          message: "You do not have permissions to verify clans.",
          error: "INVALID_PERMISSIONS",
        } as APIResponse,
        { status: 403 }
      );
    }

    if (clan.visibility === "Hidden") {
      return NextResponse.json(
        {
          message:
            "This clan is hidden! This clan must be made public before it can be approved.",
          error: "CLAN_HIDDEN_VERIFICATION_FAILED",
        } as APIResponse,
        { status: 400 }
      );
    }

    if (clan.banned) {
      return NextResponse.json(
        {
          message: "This clan is banned! You can not verify it.",
          error: "CLAN_HIDDEN_VERIFICATION_FAILED",
        } as APIResponse,
        { status: 400 }
      );
    }

    if (clan.application_status === "Approved") {
      return NextResponse.json(
        {
          message: "This clan is already verified!",
          error: "CLAN_APPROVED",
        } as APIResponse,
        { status: 400 }
      );
    }

    if (!clan.discord_invite_link) {
      return NextResponse.json(
        {
          message: "A clan invite link is required!",
          error: "INVALID_INVITE_LINK",
        } as APIResponse,
        { status: 400 }
      );
    }

    // So there are a couple of cases here. Admin can just approve a clan, even if it hasnt applied. This is because there will be cases when this is
    // a needed action. this means not all clans have a outbound application. if thats the case, then the clan is just updated directly
    const [mostRecentError, mostRecentApplication] =
      await getMostRecentApplication(clan.id);
    if (mostRecentError) throw mostRecentError;

    if (!mostRecentApplication) {
      const [verificationError, verificationStatus] =
        await updateApplicationStatus({
          applicationStatus: "Approved",
          clanId: id,
        });
      if (verificationError) throw verificationError;
      return NextResponse.json(
        {
          message: "Clan verified!",
          data: verificationStatus,
        } as APIResponse<ClanWithClanOwnerInfoAndBasicData | null>,
        { status: 200 }
      );
    }

    // if the clan DOES has an outbound application, it is approved
    const [verificationError, verificationStatus] = await verifyClanApplication(
      mostRecentApplication.id
    );
    if (verificationError) throw verificationError;

    return NextResponse.json(
      {
        message: "Clan verified!",
        data: verificationStatus,
      } as APIResponse<ClanWithClanOwnerInfoAndBasicData>,
      { status: 200 }
    );
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      {
        message: "Verification failed!",
        error: "VERIFICATION_FAILED_SERVER_ERR",
      } as APIResponse,
      { status: 500 }
    );
  }
};
