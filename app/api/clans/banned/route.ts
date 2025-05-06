import { APIResponse } from "@/app/api/types/core/api";
import { getBannedClans, getBannedClansCount } from "@/data-access/clan-ban";
import authenticationCheck, {
  isNextResponse,
} from "@/utils/authentication-check";
import { BanAppeal, Prisma } from "@/prisma/generated/prisma/client";
import { NextRequest, NextResponse } from "next/server";
import qs from "qs";
import { z } from "zod";

export const GET = async (request: NextRequest) => {
  try {
    const auth = await authenticationCheck();
    if (isNextResponse(auth)) return auth;
    const { role } = auth;

    if (
      role !== "Administrator" &&
      role !== "Developer" &&
      role !== "Moderator"
    ) {
      return NextResponse.json(
        {
          message: "You do not have permissions to view ban appeals",
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
      Prisma.ClanBanFindManyArgs,
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
    console.log(config);
    const [bannedClansError, bannedClans] = await getBannedClans(config);
    if (bannedClansError) throw bannedClansError;

    const [countError, count] = await getBannedClansCount(config);
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
        message: "Banned Clans retrieved",
        items: bannedClans,
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
      } as APIResponse<BanAppeal>,
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      {
        error: "BANNED_CLANS_GET_ERR",
        message: "There was an issue getting banned clans",
      } as APIResponse,
      { status: 500 }
    );
  }
};
