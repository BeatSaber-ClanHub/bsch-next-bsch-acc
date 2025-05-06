import { APIResponse } from "@/app/api/types/core/api";
import { reportClanSchema } from "@/app/validation-schemas/report/report-clan-schema";
import { getClan } from "@/data-access/clan";
import { createClanReport } from "@/data-access/report";
import authenticationCheck, {
  isNextResponse,
} from "@/utils/authentication-check";
import { Report } from "@/prisma/generated/prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { validate as uuidValidate } from "uuid";
import { z } from "zod";

export const POST = async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const session = await authenticationCheck();
    if (isNextResponse(session)) return session;

    const { id } = await params;
    const isValidId = uuidValidate(id);
    if (!isValidId) {
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

    const body: z.infer<typeof reportClanSchema> = await request.json();
    const { error } = reportClanSchema.safeParse(body);

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

    const [reportError, report] = await createClanReport({
      clanId: id,
      reason: body.reason,
      reportedBy: session.session!.user.id,
    });
    if (reportError) throw reportError;

    if (
      session.role === "Administrator" ||
      session.role === "Developer" ||
      session.role === "Moderator"
    ) {
      return NextResponse.json(
        {
          message: "Clan reported!",
          data: report,
        } as APIResponse<Report>,
        { status: 201 }
      );
    }
    return NextResponse.json(
      {
        message: "Clan Reported!",
        data: {
          id: report?.id,
          type: report?.type,
          reason: report?.reason,
          clanId: report?.clan?.id,
        },
      } as APIResponse<Report>,
      { status: 201 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      {
        message: "There was an issue reporting this clan!",
        error: "INTERNAL_ERR_CLAN_REPORT",
      } as APIResponse,
      { status: 500 }
    );
  }
};
