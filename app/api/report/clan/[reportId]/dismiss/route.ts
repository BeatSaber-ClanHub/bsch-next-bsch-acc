import { APIResponse } from "@/app/api/types/core/api";
import {
  dismissReport,
  EnrichedClanReport,
  getReport,
} from "@/data-access/report";
import authenticationCheck, {
  isNextResponse,
} from "@/utils/authentication-check";
import { NextRequest, NextResponse } from "next/server";
import { validate as uuidValidate } from "uuid";

export const POST = async (
  request: NextRequest,
  { params }: { params: Promise<{ reportId: string }> }
) => {
  try {
    const session = await authenticationCheck();
    if (isNextResponse(session)) return session;
    const { reportId } = await params;

    const isValidReportId = uuidValidate(reportId);
    if (!isValidReportId) {
      const resp: APIResponse = {
        error: "MALFORMED_ID",
        message: "This Report ID is not valid",
      };

      return NextResponse.json(resp, { status: 403 });
    }

    if (
      session.role !== "Administrator" &&
      session.role !== "Developer" &&
      session.role !== "Moderator"
    ) {
      return NextResponse.json(
        {
          message: "You do not have permissions to view this report.",
          error: "INVALID_PERMISSIONS",
        } as APIResponse,
        { status: 403 }
      );
    }

    const [reportError, report] = await getReport(reportId);
    if (reportError) throw reportError;

    if (!report) {
      const resp: APIResponse = {
        message: "Report not found!",
        error: "NOT_FOUND",
      };

      return NextResponse.json(resp, { status: 404 });
    }

    if (report.resolved) {
      return NextResponse.json(
        {
          message: "This report has been already been dismissed",
          error: "REPORT_DISMISSED",
        } as APIResponse,
        { status: 409 }
      );
    }

    const [dismissedError, dismissedReport] = await dismissReport(reportId);
    if (dismissedError) throw dismissedError;

    return NextResponse.json(
      {
        message: "Report dismissed!",
        data: dismissedReport,
      } as APIResponse<EnrichedClanReport>,
      { status: 201 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      {
        message: "There was an issue retrieving this report!",
        error: "INTERNAL_ERR_CLAN_REPORT",
      } as APIResponse,
      { status: 500 }
    );
  }
};
