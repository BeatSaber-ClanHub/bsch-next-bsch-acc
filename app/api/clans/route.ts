import {
  allowedOrderByValues,
  OrderByFilters,
  ValidClanSpecialties,
} from "@/components/types/clan-types";
import {
  ClanWithClanOwnerInfoAndBasicData,
  getClanCount,
  getClans,
} from "@/data-access/clan";
import { ClanSpecialties, Prisma } from "@/prisma/generated/prisma/client";
import authenticationCheck, {
  AuthWithRole,
} from "@/utils/authentication-check";
import parseAndValidateQueryParams from "@/utils/parse-and-validate-params";
import { toTitleCase } from "@/utils/toTitleCase";
import { NextRequest, NextResponse } from "next/server";
import { validate as uuidValidate } from "uuid";
import { z } from "zod";
import { APIResponse, SortDirections } from "../types/core/api";

interface QueryFilters {
  limit: number;
  offset: number;
  many: Array<string> | null;
  orderBy: OrderByFilters;
  sortDirection: SortDirections;
  search: string | null;
  specialties: Array<ClanSpecialties> | null;
  includeHiddenClans: boolean;
  ownedBy: string;
}

/**
 * Takes a string of values and splits into array of valid object ids only. Utility function for readability.
 */
function parsedObjectIDArray(queryString: string): Array<string> {
  const array = queryString.split(";");
  const valid = array.filter((value) => uuidValidate(value));

  return valid as unknown as string[];
}

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
      specialties: z.preprocess((value: unknown) => {
        if (value === null || value === undefined) return null;
        const t = value.toString();
        const arr = t.split(";").map((val) => val.trim().toLowerCase());
        const options = ValidClanSpecialties.map((val) => val.toLowerCase());
        const valid = arr.filter((value) => options.includes(value));
        if (valid.length === 0) return null;
        return valid.map((val) => toTitleCase(val)) as ClanSpecialties[];
      }, z.array(z.enum([...ValidClanSpecialties] as [string, ...string[]]))),
      includeHiddenClans: z.preprocess((val) => {
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
      includeBannedClans: z.preprocess((val) => {
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

      ownedBy: z.string().uuid(),
    });

    const queryParams: z.infer<typeof schema> = parseAndValidateQueryParams({
      schema: schema,
      url: url,
    }) as z.infer<typeof schema> & { specialties: string[] };

    let query: Prisma.ClanWhereInput = {};

    // Handle text search
    if (queryParams.search) {
      query.OR = [
        { clan_name: { contains: queryParams.search, mode: "insensitive" } },
        { clan_tag: { contains: queryParams.search, mode: "insensitive" } },
      ];
    }

    if (queryParams.specialties) {
      query.clan_specialties = {
        hasEvery: queryParams.specialties as ClanSpecialties[],
      };
    }

    const orderByClause = {
      [queryParams.orderBy ?? "createdAt"]: queryParams.sortDirection ?? "desc",
    } as Record<OrderByFilters, "asc" | "desc">;

    if (
      queryParams.includeHiddenClans !== null &&
      !queryParams.includeHiddenClans
    ) {
      query.NOT = {
        visibility: "Hidden",
      };
    }

    if (queryParams.ownedBy !== null) {
      query.clan_owner = queryParams.ownedBy;
    }

    const [error, clans] = await getClans({
      where: {
        ...query,
        banned: queryParams.includeBannedClans == true ? true : false,
      },
      orderBy: orderByClause,
      take: queryParams.limit ?? 20,
      skip: queryParams.offset,
    });

    if (error) throw error;

    // Get clan count
    const [countError, count] = await getClanCount({
      where: {
        ...query,
        banned: queryParams.includeBannedClans == true ? true : false,
      },
    });
    if (countError) {
      throw countError;
    }

    // Create response object
    const totalPages = Math.ceil((count as number) / (queryParams.limit ?? 20));
    const currentPage =
      Math.floor((queryParams.offset ?? 0) / (queryParams.limit ?? 20)) + 1;
    const response: APIResponse<ClanWithClanOwnerInfoAndBasicData> = {
      message: "Clans fetched successfully!",
      items: clans,
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
