import { getClan } from "@/data-access/clan";
import {
  EnrichedClanMember,
  getMember,
  getMemberCount,
  getMembers,
  GetMembersProps,
  OrderByParams,
} from "@/data-access/member";
import { ClanMember } from "@/data-access/types/types";
import authenticationCheck, {
  isNextResponse,
} from "@/utils/authentication-check";
import getClanRole from "@/utils/get-clan-role";
import parseAndValidateQueryParams from "@/utils/parse-and-validate-params";
import { NextRequest, NextResponse } from "next/server";
import { validate as uuidValidate } from "uuid";
import { z } from "zod";
import { APIResponse } from "../../../types/core/api";

export const GET = async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const auth = await authenticationCheck({
      bypassAuthCheck: true,
      bypassBanCheck: true,
    });
    if (isNextResponse(auth)) return auth;
    const { session, role: siteRole } = auth;
    // Get clan ID
    const { id } = await params;

    // Make sure that the ID is a valid ID
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

    let clanMember: ClanMember | null = null;
    // if (
    //   clan.visibility === "Hidden" &&
    //   siteRole !== "Moderator" &&
    //   siteRole !== "Administrator" &&
    //   siteRole !== "Developer"
    // ) {
    // If the user has a session, check if they are a member
    if (session?.user.id) {
      const [memberError, member] = await getMember({
        clanId: id,
        userId: session.user.id,
      });
      if (memberError) throw memberError;
      clanMember = member;
    }

    if (
      (!clanMember || clanMember.banned) &&
      clan.visibility === "Hidden" &&
      auth.role !== "Moderator" &&
      auth.role !== "Administrator" &&
      auth.role !== "Developer"
    )
      return NextResponse.json(
        {
          message: "You don't have permission to view this clans!",
          error: "INVALID_PERMISSIONS",
        } as APIResponse,
        { status: 403 }
      );
    // }

    const orderByFields = ["name", "createdAt", "role"] as const;
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

    const { role: clanRole } = await getClanRole({
      clanId: clan.id,
      userId: session?.user.id || "",
    });

    let orderByConfig: OrderByParams = {};
    if (queryParams?.orderBy === "role") {
      orderByConfig = {
        ClanStaff: {
          role: queryParams.sortDirection,
        },
      };
    } else if (queryParams.orderBy) {
      orderByConfig = {
        [queryParams.orderBy as string]: queryParams.sortDirection || "desc",
      };
    }

    const includeBannedUsers =
      clanRole === "Administrator" ||
      clanRole === "Creator" ||
      clanRole === "Moderator" ||
      siteRole === "Administrator" ||
      siteRole === "Developer" ||
      siteRole === "Moderator";

    const config: GetMembersProps = {
      includeBanned: includeBannedUsers && clanMember?.banned === false,
      clanId: id,
      ...(queryParams?.offset ? { skip: queryParams.offset } : {}),
      ...(queryParams?.limit ? { take: queryParams.limit } : {}),
      ...(queryParams?.search ? { search: queryParams.search } : {}),
      orderBy: orderByConfig
        ? orderByConfig
        : {
            createdAt: "desc",
          },
    };
    const [membersError, members] = await getMembers(config);

    if (membersError) throw membersError;

    const [membersCountError, count] = await getMemberCount({
      clanId: id,
      user: {
        banned: false,
      },
      ...(!includeBannedUsers ? { NOT: { banned: true } } : {}),
      ...(queryParams?.search && {
        user: {
          name: { contains: queryParams.search, mode: "insensitive" },
        },
      }),
    });
    if (membersCountError) throw membersCountError;

    const totalPages = Math.ceil(
      (count as number) / (config.take ? config.take : 20)
    );
    const currentPage =
      Math.floor(
        (config.skip ? config.skip : 0) / (config.take ? config.take : 20)
      ) + 1;

    return NextResponse.json(
      {
        message: "Members retrieved!",
        items: members,
        metadata: {
          count: count as number,
          limit: config.take ? config.take : 20,
          offset: config.skip ? config.skip : 0,
          pagination: {
            next:
              (config.skip ? config.skip : 0) +
                (config.take ? config.take : 20) <
              (count as number),
            totalPages: totalPages > 0 ? totalPages : 0,
            currentPage: totalPages > 0 ? currentPage : 0,
          },
        },
      } as APIResponse<EnrichedClanMember>,
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    const resp: APIResponse = {
      error: "GET_CLAN_MEMBERS_ISSUE",
      message: "There was an issue retrieving clan members!",
    };

    return NextResponse.json(resp, { status: 500 });
  }
};
