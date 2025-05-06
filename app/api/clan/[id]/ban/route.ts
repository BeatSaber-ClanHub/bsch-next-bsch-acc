import { banClanSchema } from "@/app/validation-schemas/ban/ban-clan";
import { getClan } from "@/data-access/clan";
import { createClanBan, getClanBan } from "@/data-access/clan-ban";
import { ClanBan } from "@/prisma/generated/prisma/client";
import authenticationCheck, {
  isNextResponse,
} from "@/utils/authentication-check";
import { NextRequest, NextResponse } from "next/server";
import { validate as uuidValidate } from "uuid";
import { z } from "zod";
import { APIResponse } from "../../../types/core/api";

export const POST = async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const auth = await authenticationCheck();
    if (isNextResponse(auth)) return auth;
    const { session, role } = auth;
    // Get clan ID
    const { id } = await params;
    if (!session) {
      return NextResponse.json(
        {
          error: "NOT_AUTHENTICATED",
          message: "Not authenticated!",
        } as APIResponse,
        { status: 403 }
      );
    }

    if (
      role !== "Administrator" &&
      role !== "Developer" &&
      role !== "Moderator"
    ) {
      return NextResponse.json(
        {
          message: "You do not have permissions to ban clans!",
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

      return NextResponse.json(resp, { status: 403 });
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

    const body: z.infer<typeof banClanSchema> = await request.json();
    const { error } = banClanSchema.safeParse(body);

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

    if (body.permanent && Object.hasOwn(body, "allowAppealAt")) {
      delete body.allowAppealAt;
    }

    const [getExistingBanError, existingBan] = await getClanBan(id);
    if (getExistingBanError) throw getExistingBanError;

    if (existingBan?.status !== "Approved" && clan.banned) {
      return NextResponse.json(
        {
          message: "This clan is already banned!",
          error: "CLN_BAN_EXISTS",
        } as APIResponse,
        {
          status: 400,
        }
      );
    }

    const [banError, bannedClan] = await createClanBan({
      clanId: id,
      justification: body.justification,
      permanent: body.permanent || false,
      ...(body.allowAppealAt ? { allowAppealAt: body.allowAppealAt } : {}),
    });

    if (banError) throw banError;

    return NextResponse.json(
      {
        message: "This clan has been banned!",
        data: bannedClan,
      } as APIResponse<ClanBan>,
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    const resp: APIResponse = {
      error: "BAN_FAILED",
      message: "There was an issue banning this caln!",
    };

    return NextResponse.json(resp, { status: 500 });
  }
};
