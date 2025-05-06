import {
  allowedOrderByValues,
  allowedVisibilityOptions,
  OrderByFilters,
  ValidClanSpecialties,
} from "@/components/types/clan-types";
import {
  ClanWithClanOwnerInfoAndBasicData,
  getClanCount,
  getClans,
} from "@/data-access/clan";
import {
  ClanSpecialties,
  Prisma,
  Visibility,
} from "@/prisma/generated/prisma/client";
import authenticationCheck, {
  isNextResponse,
} from "@/utils/authentication-check";
import { toTitleCase } from "@/utils/toTitleCase";
import { NextRequest, NextResponse } from "next/server";
import { validate as uuidValidate } from "uuid";
import {
  APIResponse,
  SortDirections,
  sortDirections,
} from "../../types/core/api";

interface QueryFilters {
  limit: number;
  offset: number;
  many: Array<string> | null;
  orderBy: OrderByFilters;
  sortDirection: SortDirections;
  search: string | null;
  specialties: Array<ClanSpecialties> | null;
  visibility: Visibility | null;
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
    const auth = await authenticationCheck();
    if (isNextResponse(auth)) return auth;
    const { session } = auth;
    // Get query params
    const url = new URL(request.url);

    // Parse and format them
    const queryParams: QueryFilters = {
      limit: (() => {
        const value = Number(url.searchParams.get("limit"));
        if (isNaN(value)) return 20;
        const valueNumber = Math.abs(Math.round(value));
        if (valueNumber > 100) {
          return 100;
        } else if (valueNumber == 0) {
          return 20;
        } else {
          return valueNumber;
        }
      })(),
      offset: (() => {
        const value = Number(url.searchParams.get("offset"));
        return isNaN(value) ? 0 : Math.abs(Math.round(value));
      })(),
      many: (() => {
        const value = String(url.searchParams.get("many"));
        const parsed = parsedObjectIDArray(value);
        if (parsed.length <= 0) return null;
        return parsed;
      })(),
      orderBy: (() => {
        const value = url.searchParams.get("orderBy");
        const valid = allowedOrderByValues.includes(value as OrderByFilters);
        if (!valid) return "clan_name";
        return value as unknown as OrderByFilters;
      })(),
      sortDirection: (() => {
        const value = url.searchParams.get("sortDirection");
        const valid = sortDirections.includes(value as SortDirections);
        if (!valid) return "asc";
        return value as unknown as SortDirections;
      })(),
      specialties: (() => {
        const value = url.searchParams.get("specialties");
        if (!value) return null;
        // Split at the ;
        const arr = value.split(";").map((val) => val.toLowerCase());

        // Get list of all valid options and convert to lowercase
        const options = ValidClanSpecialties.map((val) => val.toLowerCase());
        const valid = arr.filter((value) => options.includes(value));

        // Return all valid values as title case
        return valid.map((val) => toTitleCase(val)) as ClanSpecialties[];
      })(),
      search: url.searchParams.get("search") || null,
      visibility: (() => {
        const value = url.searchParams.get("visibility");
        if (!value) return null;

        const formatted = toTitleCase(value as string);
        const valid = allowedVisibilityOptions.includes(
          formatted as Visibility
        );
        if (!valid) return null;
        return formatted as unknown as Visibility;
      })(),
    };

    const query: Prisma.ClanWhereInput = {};

    // Add filtering based on many (array of object ids)
    if (queryParams.many) {
      query.id = { in: queryParams.many as unknown as string[] };
    }

    // Handle text search
    if (queryParams.search) {
      query.OR = [
        { clan_name: { contains: queryParams.search, mode: "insensitive" } },
        { clan_tag: { contains: queryParams.search, mode: "insensitive" } },
      ];
    }

    if (queryParams.specialties) {
      query.clan_specialties = {
        hasSome: queryParams.specialties,
      };
    }

    if (queryParams.visibility) {
      query.visibility = queryParams.visibility;
    }

    // Orderby filter
    const orderByClause = {
      [queryParams.orderBy]: queryParams.sortDirection as "asc" | "desc",
    } as Record<OrderByFilters, "asc" | "desc">;

    console.log(orderByClause);
    // Run query
    const [error, clans] = await getClans({
      where: {
        ...query,
        AND: {
          clan_owner: session!.user.id,
        },
      }, // Dynamic search filters applied here
      orderBy: orderByClause,
      take: queryParams.limit,
      skip: queryParams.offset,
    });

    if (error) throw error;

    // Get clan count
    const [countError, count] = await getClanCount({
      where: {
        AND: {
          clan_owner: session!.user.id,
        },
      },
    });
    if (countError) {
      throw countError;
    }

    // Create response object
    const totalPages = Math.ceil((count as number) / queryParams.limit);
    const currentPage = Math.floor(queryParams.offset / queryParams.limit) + 1;
    const response: APIResponse<ClanWithClanOwnerInfoAndBasicData> = {
      message: "Clans fetched successfully!",
      items: clans,
      metadata: {
        count: count as number,
        limit: queryParams.limit,
        offset: queryParams.offset,
        pagination: {
          next: queryParams.offset + queryParams.limit < (count as number),
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
