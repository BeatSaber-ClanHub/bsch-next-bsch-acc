import { APIResponse } from "@/app/api/types/core/api";
import { getClan } from "@/data-access/clan";
import {
  ClanVerificationApplicationWithUsersAndClan,
  createVerificationApplication,
} from "@/data-access/clan-verification-application";
import authenticationCheck, {
  isNextResponse,
} from "@/utils/authentication-check";
import getClanRole from "@/utils/get-clan-role";
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

    const { role } = await getClanRole({
      clanId: id,
      userId: auth.session!.user.id,
    });
    if (role !== "Creator" && role !== "Administrator") {
      return NextResponse.json(
        {
          message: "You do not have permissions to apply for verification.",
          error: "INVALID_PERMISSIONS",
        } as APIResponse,
        { status: 403 }
      );
    }

    if (clan.banned) {
      return NextResponse.json(
        {
          message: "This clan is banned! You can not apply during a ban.",
          error: "CLAN_BANNED_APPLICATION_FAILED",
        } as APIResponse,
        { status: 400 }
      );
    }

    if (clan.visibility === "Hidden") {
      return NextResponse.json(
        {
          message:
            "This clan is hidden! Your clan must be made public before you can apply.",
          error: "CLAN_HIDDEN_APPLICATION_FAILED",
        } as APIResponse,
        { status: 400 }
      );
    }

    if (clan.application_status === "Approved") {
      return NextResponse.json(
        {
          message: "This clan is already approved!",
          error: "CLAN_APPROVED",
        } as APIResponse,
        { status: 400 }
      );
    }

    if (clan.application_status === "In_Review") {
      return NextResponse.json(
        {
          message:
            "This clan is In Review. You can not apply during this state!",
          error: "CLAN_IN_REVIEW",
        } as APIResponse,
        { status: 400 }
      );
    }

    const targetDays = 30;

    const currentDate = new Date();
    const createdAtDate = new Date(clan.createdAt);

    const diffInTime = currentDate.getTime() - createdAtDate.getTime();
    const diffInDays = Math.round(diffInTime / (1000 * 60 * 60 * 24));

    const remainingDays = targetDays - diffInDays;

    if (remainingDays > 0) {
      return NextResponse.json(
        {
          message: `You need to wait ${remainingDays} more days! Clans must be listed on BSCH for 30 days!`,
          error: "TIME_NOT_ELAPSED",
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

    if (clan.memberCount < 10) {
      return NextResponse.json(
        {
          message: "You need 10 or more members!",
          error: "MEMBER_COUNT_SMALL",
        } as APIResponse,
        { status: 400 }
      );
    }

    const [verificationError, verificationStatus] =
      await createVerificationApplication({
        clanId: id,
        submittedById: auth.session!.user.id,
      });
    if (verificationError) throw verificationError;

    return NextResponse.json(
      {
        message: "Application submitted!",
        data: verificationStatus,
      } as APIResponse<ClanVerificationApplicationWithUsersAndClan>,
      { status: 200 }
    );
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      {
        message: "Application failed!",
        error: "APPLICATION_FAILED_SERVER_ERR",
      } as APIResponse,
      { status: 500 }
    );
  }
};
