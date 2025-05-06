import { APIResponse } from "@/app/api/types/core/api";
import { getClan } from "@/data-access/clan";
import {
  ClanJoinRequestWithUserData,
  countBlockedUsers,
  getBlockedUsers,
} from "@/data-access/clan-join-request";
import authenticationCheck, {
  isNextResponse,
} from "@/utils/authentication-check";
import getClanRole from "@/utils/get-clan-role";
import parseAndValidateQueryParams from "@/utils/parse-and-validate-params";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { validate as uuidValidate } from "uuid";
export const GET = async (
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

    // Get the clan
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
      clan.banned &&
      session.role !== "Administrator" &&
      session.role !== "Developer" &&
      session.role !== "Moderator"
    ) {
      return NextResponse.json(
        {
          message: "This clan is banned. You can not view the join requests.",
        } as APIResponse,
        { status: 403 }
      );
    }

    const { role } = await getClanRole({
      clanId: clan.id,
      userId: session.session!.user.id,
    });
    if (
      role !== "Administrator" &&
      role !== "Creator" &&
      role !== "Moderator"
    ) {
      return NextResponse.json(
        {
          message:
            "You do not have permissions to view this clans join requests.",
          error: "INVALID_PERMISSIONS",
        } as APIResponse,
        { status: 403 }
      );
    }

    const orderByFields = [
      "name",
      "createdAt",
      "allowAnotherApplication",
      "status",
    ] as const;
    const url = request.nextUrl.toString();
    const schema = z.object({
      limit: z
        .preprocess(
          (val) => parseInt(val as string, 10),
          z.number().min(0).max(100).default(20).optional()
        )
        .optional(),
      offset: z
        .preprocess(
          (val) => parseInt(val as string, 10),
          z.number().min(0).default(0).optional()
        )
        .optional(),
      search: z.string().optional(),
      sortDirection: z.enum(["asc", "desc"]).default("desc").optional(),
      orderBy: z.enum(orderByFields).default("createdAt").optional(),
    });

    const queryParams: z.infer<typeof schema> = parseAndValidateQueryParams({
      schema: schema,
      url: url,
    });

    const [requestsError, requests] = await getBlockedUsers({
      clanId: clan.id,
      queryConfig: queryParams,
    });
    if (requestsError) throw requestsError;

    const [countError, count] = await countBlockedUsers({
      clanId: clan.id,
      queryConfig: queryParams,
    });

    if (countError) throw countError;

    const totalPages = Math.ceil(
      (count as number) / (queryParams.limit ? queryParams.limit : 20)
    );
    const currentPage =
      Math.floor(
        (queryParams.offset ? queryParams.offset : 0) /
          (queryParams.limit ? queryParams.limit : 20)
      ) + 1;

    return NextResponse.json(
      {
        message: "Requests fetched!",
        items: requests,
        metadata: {
          count: count as number,
          limit: queryParams.limit ? queryParams.limit : 20,
          offset: queryParams.offset ? queryParams.offset : 0,
          pagination: {
            next:
              (queryParams.offset ? queryParams.offset : 0) +
                (queryParams.limit ? queryParams.limit : 20) <
              (count as number),
            totalPages: totalPages > 0 ? totalPages : 0,
            currentPage: totalPages > 0 ? currentPage : 0,
          },
        },
      } as APIResponse<ClanJoinRequestWithUserData>,
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      {
        message: "There was an issue retrieving join requests.",
        error: "INTERNAL_ERROR",
      } as APIResponse,
      { status: 500 }
    );
  }
};
