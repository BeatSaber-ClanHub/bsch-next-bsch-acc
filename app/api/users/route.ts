import {
  allowedOrderByValues,
  OrderByFilters,
} from "@/components/types/clan-types";
import { BasicUser, getUserCount, getUsers } from "@/data-access/user";
import { Prisma } from "@/prisma/generated/prisma/client";
import authenticationCheck, {
  AuthWithRole,
} from "@/utils/authentication-check";
import parseAndValidateQueryParams from "@/utils/parse-and-validate-params";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { APIResponse } from "../types/core/api";

export const GET = async (request: NextRequest) => {
  try {
    const auth = (await authenticationCheck({
      bypassAuthCheck: true,
      bypassBanCheck: true,
    })) as unknown as AuthWithRole;

    const orderByFields = [...allowedOrderByValues] as [string, ...string[]];

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
      includeBannedUsers: z.preprocess((val) => {
        if (typeof val !== "string") {
          return false;
        }
        if (val === "true") {
          if (auth.session?.user.banned || !auth.role) {
            return false;
          }
          return true;
        }
        return false;
      }, z.boolean()),
    });

    const queryParams: z.infer<typeof schema> = parseAndValidateQueryParams({
      schema: schema,
      url: url,
    }) as z.infer<typeof schema> & { specialties: string[] };

    const query: Prisma.UserWhereInput = {};

    // Handle text search
    if (queryParams.search) {
      query.OR = [
        { name: { contains: queryParams.search, mode: "insensitive" } },
        { id: { contains: queryParams.search, mode: "insensitive" } },
      ];
    }

    if (!queryParams.includeBannedUsers) {
      query.banned = false;
    }

    const orderByClause = {
      [queryParams.orderBy ?? "createdAt"]: queryParams.sortDirection ?? "desc",
    } as Record<OrderByFilters, "asc" | "desc">;

    const [error, users] = await getUsers({
      where: {
        ...query,
      },
      orderBy: orderByClause,
      take: queryParams.limit ?? 20,
      skip: queryParams.offset,
    });

    if (error) throw error;

    // Get clan count
    const [countError, count] = await getUserCount(query);

    // Create response object
    const totalPages = Math.ceil((count as number) / (queryParams.limit ?? 20));
    const currentPage =
      Math.floor((queryParams.offset ?? 0) / (queryParams.limit ?? 20)) + 1;
    const response: APIResponse<BasicUser> = {
      message: "Users fetched successfully!",
      items: users,
      metadata: {
        count: count as number,
        limit: queryParams.limit ?? 20,
        offset: queryParams.offset ?? 0,
        pagination: {
          next:
            (queryParams.offset ?? 0) + (queryParams.limit ?? 20) <
            (count as number),
          totalPages: totalPages > 0 ? totalPages : 0,
          currentPage: totalPages > 0 ? currentPage : 0,
        },
      },
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      {
        error: "CLANS_SERVER_ERROR",
        message: "There was an issue retrieving data!",
      },
      {
        status: 500,
      }
    );
  }
};
