import {
  ClanWithClanOwnerInfoAndBasicData,
  getJoinedClanCount,
  getJoinedClans,
} from "@/data-access/clan";
import { Clan } from "@/prisma/generated/prisma/client";
import authenticationCheck, {
  isNextResponse,
} from "@/utils/authentication-check";
import { NextRequest, NextResponse } from "next/server";
import { APIResponse } from "../../types/core/api";

interface QueryFilters {
  limit: number;
  offset: number;
}

export const GET = async (request: NextRequest) => {
  try {
    const auth = await authenticationCheck();
    if (isNextResponse(auth)) return auth;
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
    };

    // Run query
    const [error, clans] = await getJoinedClans({
      take: queryParams.limit,
      skip: queryParams.offset,
    });

    if (error) throw error;

    // Get clan count
    const [countError, count] = await getJoinedClanCount();
    if (countError) {
      throw countError;
    }

    // Create response object
    const totalPages = Math.ceil((count as number) / queryParams.limit);
    const currentPage = Math.floor(queryParams.offset / queryParams.limit) + 1;
    const response: APIResponse<ClanWithClanOwnerInfoAndBasicData> = {
      message: "Clans fetched successfully!",
      items: clans as ClanWithClanOwnerInfoAndBasicData[],
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
