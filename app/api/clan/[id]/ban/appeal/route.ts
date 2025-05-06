import { banClanSchema } from "@/app/validation-schemas/ban/ban-clan";
import { createBanAppeal, getBanAppeal } from "@/data-access/ban-appeal";
import { getClan } from "@/data-access/clan";
import { getClanBan } from "@/data-access/clan-ban";
import authenticationCheck, {
  isNextResponse,
} from "@/utils/authentication-check";
import getClanRole from "@/utils/get-clan-role";
import { BanAppeal, Prisma } from "@/prisma/generated/prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { validate as uuidValidate } from "uuid";
import { z } from "zod";
import { APIResponse } from "../../../../types/core/api";

export const POST = async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const auth = await authenticationCheck();
    if (isNextResponse(auth)) return auth;
    const { session } = auth;
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

    const { role } = await getClanRole({
      clanId: clan.id,
      userId: session.user.id,
    });
    if (role !== "Creator") {
      return NextResponse.json(
        {
          error: "INVALID_PERMISSIONS",
          message: "Only the clan owner can appeal the ban",
        } as APIResponse,
        { status: 403 }
      );
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

    // get the current ban (there can only be one per clan)
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

    if (clanBan.allowAppealAt !== null) {
      const currentDate = new Date().getTime();
      const allowAppealAt = new Date(clanBan.allowAppealAt).getTime();

      if (currentDate < allowAppealAt) {
        return NextResponse.json(
          {
            message:
              "You are eligible for appeal, but you must wait until the appeal cooldown time has elapsed. Try again at " +
              new Date(clanBan.allowAppealAt),
            error: "NOT_ELIGIBLE_WAIT_COOLDOWN",
          } as APIResponse,
          { status: 400 }
        );
      }
    }

    // get the appeal if one exists
    const [existingBanError, existingBanAppeal] = await getBanAppeal({
      banId: clanBan.id,
    });
    if (existingBanError) throw existingBanError;
    // check appeal status's
    if (existingBanAppeal) {
      if (
        existingBanAppeal.status === "Denied" &&
        existingBanAppeal.allowAnotherAppeal === false
      ) {
        return NextResponse.json(
          {
            message: "You are not eligible for another appeal.",
            error: "NOT_ELIGIBLE",
          } as APIResponse,
          { status: 400 }
        );
      } else if (existingBanAppeal.status === "In_Review") {
        return NextResponse.json(
          {
            message:
              "Your appeal is in review. You can not submit another appeal during this process.",
            error: "IN_REVIEW",
          } as APIResponse,
          { status: 400 }
        );
      } else if (existingBanAppeal.status === "Approved") {
        return NextResponse.json(
          {
            message:
              "Your appeal was approved. You can not submit another appeal.",
            error: "APPROVED",
          } as APIResponse,
          { status: 400 }
        );
      } else if (existingBanAppeal.status === "Submitted") {
        return NextResponse.json(
          {
            message: "An appeal has already been submitted.",
            error: "SUBMITTED",
          } as APIResponse,
          { status: 400 }
        );
      }
    }

    const [banError, appeal] = await createBanAppeal({
      banId: clanBan.id,
      justification: body.justification,
      clanId: id,
    });

    if (banError) {
      if (banError instanceof Prisma.PrismaClientKnownRequestError) {
        const code = banError.code;
        if (code === "P2002") {
          return NextResponse.json(
            {
              message: "This clan has already been appealed.",
              error: "CLN_APPEAL_EXISTS",
            } as APIResponse,
            {
              status: 400,
            }
          );
        }
      }
      throw banError;
    }

    return NextResponse.json(
      {
        message: "Appeal submitted!",
        data: appeal,
      } as APIResponse<BanAppeal>,
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    const resp: APIResponse = {
      error: "APPEAL_FAILED",
      message: "There was an issue appealing the ban for this clan!",
    };

    return NextResponse.json(resp, { status: 500 });
  }
};
