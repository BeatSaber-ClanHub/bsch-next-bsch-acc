import { APIResponse } from "@/app/api/types/core/api";
import {
  ClanVerificationApplicationWithUsersAndClan,
  getVerificationApplications,
  getVerificationApplicationsCount,
} from "@/data-access/clan-verification-application";
import { Prisma } from "@/prisma/generated/prisma/client";
import authenticationCheck, {
  isNextResponse,
} from "@/utils/authentication-check";
import { NextRequest, NextResponse } from "next/server";
import qs from "qs";
import { z } from "zod";

export const GET = async (request: NextRequest) => {
  try {
    const auth = await authenticationCheck();
    if (isNextResponse(auth)) return auth;

    if (!auth.role) {
      return NextResponse.json(
        {
          message: "You don't have permissions to view applications!",
          error: "INVALID_PERMISSIONS",
        } as APIResponse,
        { status: 403 }
      );
    }

    const orderByFields = [
      "clan_name",
      "clan_tag",
      "clan_specialties",
      "clan_owner",
      "application_status",
      "visibility",
      "updatedAt",
      "createdAt",
    ] as const;

    const url = request.nextUrl.toString();
    const params = qs.parse(url.split("?")[1]);

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
      clanName: z.string().optional(),
      clanTag: z.string().optional(),
      orderBy: z.enum(orderByFields).default("createdAt").optional(),
      sortDirection: z.enum(["asc", "desc"]).default("desc").optional(),
    });

    const { success, data } = schema.safeParse(params);
    let filters = data;

    if (!success) {
      type ParamsType = z.infer<typeof schema>;
      const validParams = Object.entries(params).reduce((acc, [key, value]) => {
        if (key in schema.shape) {
          const keyAsSchemaKey = key as keyof ParamsType;
          const fieldSchema = schema.shape[keyAsSchemaKey];
          const validation = fieldSchema.safeParse(value);
          if (validation.success) {
            (acc[keyAsSchemaKey] as string | undefined | number) =
              validation.data;
          }
        }
        return acc;
      }, {} as Partial<ParamsType>);
      filters = validParams;
    }

    const config: Pick<
      Prisma.ClanVerificationApplicationsFindManyArgs,
      "where" | "orderBy" | "skip" | "take"
    > = {
      where: {
        ...(filters?.search || filters?.clanName || filters?.clanTag
          ? {
              clan: {
                ...(filters?.search
                  ? {
                      OR: [
                        {
                          clan_name: {
                            contains: filters.search,
                            mode: "insensitive",
                          },
                        },
                        {
                          clan_tag: {
                            contains: filters.search,
                            mode: "insensitive",
                          },
                        },
                      ],
                    }
                  : {}),
                ...(filters?.clanName
                  ? {
                      clan_name: {
                        equals: filters.clanName,
                        mode: "insensitive",
                      },
                    }
                  : {}),
                ...(filters?.clanTag
                  ? {
                      clan_tag: {
                        equals: filters.clanTag,
                        mode: "insensitive",
                      },
                    }
                  : {}),
              },
            }
          : {}),
      },
      skip: filters?.offset || 0,
      take: filters?.limit || 20,
      orderBy: filters?.orderBy
        ? {
            [filters.orderBy]: filters.sortDirection || "asc",
          }
        : undefined,
    };

    const [applicationsError, applications] = await getVerificationApplications(
      config
    );
    if (applicationsError) throw applicationsError;

    const [countError, count] = await getVerificationApplicationsCount(config);
    if (countError) throw countError;

    const totalPages = Math.ceil(
      (count as number) / (config.take ? config.take : 20)
    );
    const currentPage =
      Math.floor(
        (config.skip ? config.skip : 0) / (config.take ? config.take : 20)
      ) + 1;

    return NextResponse.json(
      {
        message: "Clan Applications retrieved",
        items: applications,
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
      } as APIResponse<ClanVerificationApplicationWithUsersAndClan>,
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      {
        error: "CLAN_APPLICATIONS_GET_ERR",
        message: "There was an issue getting clan applications.",
      } as APIResponse,
      { status: 500 }
    );
  }
};
