import { APIResponse } from "@/app/api/types/core/api";
import { getClan } from "@/data-access/clan";
import { EnrichedClanMember, getMember, leaveClan } from "@/data-access/member";
import { getUserById } from "@/data-access/user";
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
    const { session } = auth;

    // Get clan and user ID's
    const clanId = (await params).id;

    // Make sure they are valid Object IDS
    if (!uuidValidate(clanId)) {
      const resp: APIResponse = {
        message: "Malformed Clan ID!",
        error: "MALFORMED_ID",
      };

      return NextResponse.json(resp, { status: 400 });
    }

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

    // Check user is in the clan
    const [clanMemberError, member] = await getMember({
      clanId: clanId,
      userId: session!.user.id,
    });
    if (clanMemberError) throw clanMemberError;

    if (!member) {
      const resp: APIResponse = {
        message: "This user is not a member of this Clan!",
        error: "NOT_FOUND",
      };

      return NextResponse.json(resp, { status: 404 });
    }

    if (member.userId !== session?.user.id) {
      return NextResponse.json(
        {
          error: "USERID_DOES_NOT_MATCH_SESSION_USER_ID",
          message: "You can not leave on behalf of someone else.",
        } as APIResponse,
        { status: 409 }
      );
    }

    const { role } = await getClanRole({
      clanId: clan.id,
      userId: session.user.id,
    });
    if (role === "Creator") {
      return NextResponse.json(
        {
          error: "OWNER",
          message:
            "You can not leave the clan as an owner. You must transfer ownership first.",
        } as APIResponse,
        { status: 409 }
      );
    }

    const [userError, user] = await getUserById(session!.user.id);
    if (userError) throw userError;

    if (!user) {
      return NextResponse.json(
        {
          message: "This user does not exist.",
          error: "USER_NOT_FOUND",
        } as APIResponse,
        { status: 404 }
      );
    }

    const [kickError, kickedMember] = await leaveClan(member.id);
    if (kickError) throw kickError;

    const resp: APIResponse<EnrichedClanMember> = {
      message: "Clan left!",
      data: kickedMember!,
    };

    return NextResponse.json(resp, { status: 200 });
  } catch (error) {
    console.log(error);
    const resp: APIResponse = {
      message: "Something went wrong!",
      error: "CLAN_MEMBER_KICK_ERROR",
    };

    return NextResponse.json(resp, { status: 500 });
  }
};
