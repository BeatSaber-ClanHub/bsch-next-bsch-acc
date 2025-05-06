import { appealActionsSchema } from "@/app/validation-schemas/ban-appeal/ban-appeal";
import { getBanAppeal, updateBanAppeal } from "@/data-access/ban-appeal";
import { getClan } from "@/data-access/clan";
import { getClanBan } from "@/data-access/clan-ban";
import authenticationCheck, {
  isNextResponse,
} from "@/utils/authentication-check";
import { BanAppeal } from "@/prisma/generated/prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { validate as uuidValidate } from "uuid";
import { z } from "zod";
import { APIResponse } from "../../../../../types/core/api";

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

    if (
      role !== "Administrator" &&
      role !== "Developer" &&
      role !== "Moderator"
    ) {
      return NextResponse.json(
        {
          error: "INVALID_PERMISSIONS",
          message: "You do not have permissions to manage appeals.",
        } as APIResponse,
        { status: 403 }
      );
    }

    const body: z.infer<typeof appealActionsSchema> = await request.json();
    const { error } = appealActionsSchema.safeParse(body);

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

    // get the current ban (there can be multiple bans because when a clan is unbanned, the record isnt deleted but it will get the most recent one which is not approved.)
    const [clanBanError, clanBan] = await getClanBan(id);
    if (clanBanError) throw clanBanError;
    if (!clanBan) {
      return NextResponse.json(
        {
          error: "NO_CURR_BANS",
          message: "There is not current ban to appeal",
        } as APIResponse,
        { status: 404 }
      );
    }

    if (clanBan.permanent) {
      return NextResponse.json(
        {
          message:
            "You are not eligible for another appeal. You clan has been permanently banned.",
          error: "NOT_ELIGIBLE",
        } as APIResponse,
        { status: 400 }
      );
    }

    // get the appeal if one exists
    const [existingBanError, existingBanAppeal] = await getBanAppeal({
      banId: clanBan.id,
    });
    if (existingBanError) throw existingBanError;

    if (!existingBanAppeal) {
      return NextResponse.json(
        {
          message: "An appeal for this clan ban could not be found",
          error: "APPEAL_NOT_FOUND",
        } as APIResponse,
        { status: 404 }
      );
    }

    if (existingBanAppeal.status === "Approved") {
      return NextResponse.json(
        {
          error: "APPEAL_APPROVED",
          message:
            "This appeal can not be changed. It has already been approved.",
        } as APIResponse,
        { status: 400 }
      );
    }

    if (existingBanAppeal.status === "Denied") {
      return NextResponse.json(
        {
          error: "APPEAL_APPROVED",
          message:
            "This appeal can not be changed. It has already been denied.",
        } as APIResponse,
        { status: 400 }
      );
    }

    let newComments: string | null = "";
    if (body.comments === "") {
      newComments = "";
    } else if (body.comments) {
      newComments = body.comments;
    } else {
      newComments = existingBanAppeal.comments;
    }

    const data = {
      allowAnotherAppeal: body.allowAnotherAppeal
        ? body.allowAnotherAppeal
        : existingBanAppeal.allowAnotherAppeal,
      comments: newComments ? newComments : "",
      status: body.status ? body.status : existingBanAppeal.status,
    };

    const [banError, appeal] = await updateBanAppeal({
      appealId: existingBanAppeal.id,
      clanId: existingBanAppeal.clanId,
      banId: clanBan.id,
      ...data,
    });

    if (banError) throw banError;

    return NextResponse.json(
      {
        message: "Appeal updated!",
        data: appeal,
      } as APIResponse<BanAppeal>,
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    const resp: APIResponse = {
      error: "APPEAL_FAILED",
      message: "There was an issue updating the appeal for this clan!",
    };

    return NextResponse.json(resp, { status: 500 });
  }
};
