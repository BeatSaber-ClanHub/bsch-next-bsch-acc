import { APIResponse } from "@/app/api/types/core/api";
import { OrderByFilters } from "@/components/types/clan-types";
import {
  getWebsiteAnnouncementCount,
  getWebsiteAnnouncements,
  WebsiteAnnouncementWithPosterUserData,
} from "@/data-access/website-announcement";
import { Prisma } from "@/prisma/generated/prisma/client";
import getRole from "@/utils/get-role";
import parseAndValidateQueryParams from "@/utils/parse-and-validate-params";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export const GET = async (request: NextRequest) => {
  try {
    const { role } = await getRole();

    const orderByFields = [
      "createdAt",
      "updatedAt",
      "hideAt",
      "showAt",
      "visible",
    ] as [string, ...string[]];

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
      sortDirection: z.enum(["asc", "desc"]).default("desc").optional(),
      orderBy: z.enum(orderByFields).default("createdAt").optional(),
    });

    const queryParams: z.infer<typeof schema> = parseAndValidateQueryParams({
      schema: schema,
      url: url,
    }) as z.infer<typeof schema>;

    const query: Prisma.WebsiteAnnouncementWhereInput = {};

    const orderByClause = {
      [queryParams.orderBy ?? "createdAt"]: queryParams.sortDirection ?? "desc",
    } as Record<OrderByFilters, "asc" | "desc">;

    const now = new Date();

    const [error, announcements] = await getWebsiteAnnouncements({
      where: {
        ...query,
        ...(role !== "Administrator" && role !== "Developer"
          ? {
              OR: [
                {
                  AND: [
                    {
                      showAt: {
                        lte: now,
                      },
                    },
                    {
                      hideAt: {
                        gte: now,
                      },
                    },
                  ],
                },
                {
                  visible: true,
                },
              ],
            }
          : {}),
      },
      orderBy: orderByClause,
      take: queryParams.limit ?? 20,
      skip: queryParams.offset,
    });

    if (error) throw error;

    // Get clan count
    const [countError, count] = await getWebsiteAnnouncementCount(query);

    // Create response object
    const totalPages = Math.ceil((count as number) / (queryParams.limit ?? 20));
    const currentPage =
      Math.floor((queryParams.offset ?? 0) / (queryParams.limit ?? 20)) + 1;
    const response: APIResponse<WebsiteAnnouncementWithPosterUserData> = {
      message: "Announcements fetched successfully!",
      items: announcements,
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
        error: "WEBSITE_ANNOUNCEMENTS_ERROR",
        message: "There was an issue retrieving announcements!",
      },
      {
        status: 500,
      }
    );
  }
};
