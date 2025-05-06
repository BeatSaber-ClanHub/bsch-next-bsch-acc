/* eslint-disable @typescript-eslint/no-unused-vars */
import { getClanCount } from "@/data-access/clan";
import { getReportedClanCount } from "@/data-access/report";
import authenticationCheck, {
  isNextResponse,
} from "@/utils/authentication-check";
import { NextRequest, NextResponse } from "next/server";
import { Analytics, APIResponse } from "../../types/core/api";

export const GET = async (request: NextRequest) => {
  try {
    const auth = await authenticationCheck();
    if (isNextResponse(auth)) return auth;
    const { session, role } = auth;
    if (
      role !== "Administrator" &&
      role !== "Developer" &&
      role !== "Moderator"
    ) {
      return NextResponse.json(
        {
          error: "INVALID_PERMISSIONS",
          message: "You do not have permissions to view analytics!",
        } as APIResponse,
        { status: 403 }
      );
    }

    const [approvedCountError, approvedCount] = await getClanCount({
      where: {
        application_status: "Approved",
      },
    });

    const [, totalClans] = await getClanCount();

    const [awaitingApprovalCountError, awaitingApprovalCount] =
      await getClanCount({
        where: {
          application_status: {
            in: ["Applied", "In_Review"],
          },
        },
      });

    const [reportedClanCountError, reportedClanCount] =
      await getReportedClanCount();

    const analyticsData: Analytics = {
      approved: (approvedCount as number) || 0,
      awaitingApproval: (awaitingApprovalCount as number) || 0,
      totalClans: totalClans as number,
      ...((role === "Moderator" ||
        role === "Developer" ||
        role === "Administrator") && {
        reportedClans: (reportedClanCount as number) || 0,
      }),
    };

    const resp: APIResponse<Analytics> = {
      message: "Analytics retrieved!",
      data: analyticsData,
    };

    return NextResponse.json(resp, { status: 200 });
  } catch (error) {
    console.log(error);
    const resp: APIResponse = {
      error: "CLANS_ANALYTICS_ERROR",
      message: "There was an issue getting clan analytics!",
    };

    return NextResponse.json(resp, { status: 500 });
  }
};
