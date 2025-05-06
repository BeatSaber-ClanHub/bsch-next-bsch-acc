import { APIResponse } from "@/app/api/types/core/api";
import { reportUserSchema } from "@/app/validation-schemas/report/report-user-schema";
import { createUserReport, EnrichedUserReport } from "@/data-access/report";
import { getUserById } from "@/data-access/user";
import authenticationCheck, {
  isNextResponse,
} from "@/utils/authentication-check";
import { NextRequest, NextResponse } from "next/server";
import { validate as uuidValidate } from "uuid";

export const POST = async (
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) => {
  try {
    const auth = await authenticationCheck();
    if (isNextResponse(auth)) return auth;

    // Valide id and body
    const { userId } = await params;
    if (!uuidValidate(userId)) {
      return NextResponse.json({} as APIResponse, { status: 400 });
    }

    const body = await request.json();
    const { error } = reportUserSchema.safeParse(body);
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

    // Make sure user exists
    const [findUserError, user] = await getUserById(userId);
    if (findUserError) throw findUserError;
    if (!user) {
      return NextResponse.json(
        {
          message: "This user does not exist",
          error: "USER_DNE",
        } as APIResponse,
        { status: 404 }
      );
    }

    // Make sure user isn't reporting themselves
    if (user.id === auth.session!.user.id) {
      return NextResponse.json(
        {
          message: "You can not report yourself.",
          error: "CAN_NOT_REPORT_SELF",
        } as APIResponse,
        { status: 409 }
      );
    }

    const [reportError, report] = await createUserReport({
      reason: body.reason,
      reportedBy: auth.session!.user.id,
      userId: userId,
    });

    if (reportError) throw reportError;

    // Show more complete response if the user is a site administrator
    if (
      auth.role === "Administrator" ||
      auth.role === "Developer" ||
      auth.role === "Moderator"
    ) {
      return NextResponse.json(
        {
          message: "User reported!",
          data: report,
        } as APIResponse<EnrichedUserReport>,
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        message: "User reported!",
        data: {
          id: report?.id,
          type: report?.type,
          reason: report?.reason,
        },
      } as APIResponse<EnrichedUserReport>,
      { status: 201 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      {
        message: "There was an issue reporting this user",
        error: "INTERNAL_ERROR",
      } as APIResponse,
      { status: 500 }
    );
  }
};
