import { createMember, EnrichedClanMember } from "@/data-access/member";
import prisma from "@/lib/prisma";
import { ClanJoinRequest, Prisma } from "@/prisma/generated/prisma/client";

const config = {
  include: {
    user: {
      select: {
        name: true,
        id: true,
        image: true,
      },
    },
  },
};
export type ClanJoinRequestWithUserData = Prisma.ClanJoinRequestGetPayload<
  typeof config
>;

export const getMostRecentRequest = async ({
  clanId,
  userId,
}: {
  clanId: string;
  userId: string;
}): Promise<[Error | null, ClanJoinRequest | null]> => {
  try {
    const data = await prisma.clanJoinRequest.findFirst({
      where: {
        clanId: clanId,
        userId: userId,
        status: {
          not: "Approved",
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return [null, data];
  } catch (error) {
    return [error instanceof Error ? error : new Error(String(error)), null];
  }
};

export const getRequest = async (
  requestId: string
): Promise<[Error | null, ClanJoinRequest | null]> => {
  try {
    const data = await prisma.clanJoinRequest.findUnique({
      where: {
        id: requestId,
      },
    });

    return [null, data];
  } catch (error) {
    return [error instanceof Error ? error : new Error(String(error)), null];
  }
};

export const createRequestToJoinClan = async ({
  clanId,
  userId,
}: {
  clanId: string;
  userId: string;
}): Promise<[Error | null, ClanJoinRequest | null]> => {
  try {
    const data = await prisma.clanJoinRequest.create({
      data: {
        clanId: clanId,
        userId: userId,
      },
    });

    return [null, data];
  } catch (error) {
    return [error instanceof Error ? error : new Error(String(error)), null];
  }
};

interface QueryConfig {
  limit?: number;
  offset?: number;
  search?: string;
  sortDirection?: "asc" | "desc";
  orderBy?: "name" | "createdAt" | "allowAnotherApplication" | "status";
}

export const getPendingJoinRequests = async ({
  clanId,
  queryConfig,
}: {
  clanId: string;
  queryConfig?: QueryConfig;
}): Promise<[Error | null, ClanJoinRequestWithUserData[] | null]> => {
  try {
    const data = await prisma.clanJoinRequest.findMany({
      where: {
        clanId: clanId,
        status: "Submitted",
        user: {
          ...(queryConfig?.search
            ? { name: { contains: queryConfig.search, mode: "insensitive" } }
            : {}),
          banned: false,
        },
      },
      ...config,
      take: queryConfig?.limit ? queryConfig.limit : 20,
      skip: queryConfig?.offset ? queryConfig.offset : 0,
      orderBy: queryConfig?.orderBy
        ? {
            [queryConfig.orderBy]: queryConfig?.sortDirection
              ? queryConfig.sortDirection
              : "desc",
          }
        : {
            createdAt: "desc",
          },
    });

    return [null, data];
  } catch (error) {
    return [error instanceof Error ? error : new Error(String(error)), null];
  }
};

export const countPendingJoinRequests = async ({
  clanId,
  search,
}: {
  clanId: string;
  search?: string;
}): Promise<[Error | null, number | null]> => {
  try {
    const data = await prisma.clanJoinRequest.count({
      where: {
        clanId: clanId,
        status: "Submitted",
        user: {
          ...(search
            ? { name: { contains: search, mode: "insensitive" } }
            : {}),
          banned: false,
        },
      },
    });

    return [null, data];
  } catch (error) {
    return [error instanceof Error ? error : new Error(String(error)), null];
  }
};

export const deleteJoinRequest = async (
  requestId: string
): Promise<[Error | null, ClanJoinRequest | null]> => {
  try {
    const data = await prisma.clanJoinRequest.delete({
      where: {
        id: requestId,
      },
    });

    return [null, data];
  } catch (error) {
    return [error instanceof Error ? error : new Error(String(error)), null];
  }
};

export const acceptJoinRequest = async ({
  requestId,
  reviewedByUserId,
}: {
  requestId: string;
  reviewedByUserId: string;
}): Promise<[Error | null, EnrichedClanMember | null]> => {
  try {
    const data = await prisma.$transaction(async (prisma) => {
      const request = await prisma.clanJoinRequest.update({
        where: {
          id: requestId,
        },
        data: {
          reviewedById: reviewedByUserId,
          status: "Approved",
        },
      });

      const [memberErr, member] = await createMember({
        clanId: request.clanId,
        userId: request.userId,
        prisma: prisma,
      });
      if (memberErr) throw memberErr;

      return member;
    });

    return [null, data as unknown as EnrichedClanMember];
  } catch (error) {
    return [error instanceof Error ? error : new Error(String(error)), null];
  }
};

export const rejectJoinRequest = async ({
  requestId,
  reviewedByUserId,
  allowAnotherApplication,
}: {
  requestId: string;
  reviewedByUserId: string;
  allowAnotherApplication: boolean;
}): Promise<[Error | null, ClanJoinRequestWithUserData | null]> => {
  try {
    const data = await prisma.clanJoinRequest.update({
      where: {
        id: requestId,
      },
      data: {
        reviewedById: reviewedByUserId,
        status: "Denied",
        allowAnotherApplication: allowAnotherApplication,
      },
      ...config,
    });

    return [null, data];
  } catch (error) {
    return [error instanceof Error ? error : new Error(String(error)), null];
  }
};

export const getJoinRequests = async ({
  clanId,
  queryConfig,
}: {
  clanId: string;
  queryConfig?: QueryConfig & { uniqueUsers?: boolean };
}): Promise<[Error | null, ClanJoinRequestWithUserData[] | null]> => {
  try {
    const data = await prisma.clanJoinRequest.findMany({
      where: {
        clanId: clanId,
        ...(queryConfig?.search
          ? {
              user: {
                name: { contains: queryConfig.search, mode: "insensitive" },
                banned: false,
              },
            }
          : {}),
      },
      ...config,
      ...(queryConfig?.uniqueUsers ? { distinct: "userId" } : {}),
      take: queryConfig?.limit ? queryConfig.limit : 20,
      skip: queryConfig?.offset ? queryConfig.offset : 0,
      orderBy: queryConfig?.orderBy
        ? {
            [queryConfig.orderBy]: queryConfig?.sortDirection
              ? queryConfig.sortDirection
              : "desc",
          }
        : {
            createdAt: "desc",
          },
    });

    return [null, data];
  } catch (error) {
    return [error instanceof Error ? error : new Error(String(error)), null];
  }
};

export const countJoinRequests = async ({
  clanId,
  queryConfig,
}: {
  clanId: string;
  queryConfig?: QueryConfig & { uniqueUsers?: boolean };
}): Promise<[Error | null, number | null]> => {
  try {
    if (queryConfig?.uniqueUsers) {
      const data = await prisma.clanJoinRequest.groupBy({
        by: ["userId"],
        _count: {
          id: true,
        },
        where: {
          clanId: clanId,
          ...(queryConfig?.search
            ? {
                user: {
                  name: { contains: queryConfig.search, mode: "insensitive" },
                  banned: false,
                },
              }
            : {}),
        },
      });
      return [null, data.length];
    } else {
      const data = await prisma.clanJoinRequest.count({
        where: {
          clanId: clanId,
          ...(queryConfig?.search
            ? {
                user: {
                  name: { contains: queryConfig.search, mode: "insensitive" },
                  banned: false,
                },
              }
            : {}),
        },
      });
      return [null, data];
    }
  } catch (error) {
    return [error instanceof Error ? error : new Error(String(error)), null];
  }
};

export const getBlockedUsers = async ({
  clanId,
  queryConfig,
}: {
  clanId: string;
  queryConfig?: QueryConfig & { uniqueUsers?: boolean };
}): Promise<[Error | null, ClanJoinRequestWithUserData[] | null]> => {
  try {
    const data = await prisma.clanJoinRequest.findMany({
      where: {
        clanId: clanId,
        ...(queryConfig?.search
          ? {
              user: {
                name: { contains: queryConfig.search, mode: "insensitive" },
                banned: false,
              },
            }
          : {}),
      },
      ...config,
      distinct: "userId",
      take: queryConfig?.limit ? queryConfig.limit : 20,
      skip: queryConfig?.offset ? queryConfig.offset : 0,
      orderBy: queryConfig?.orderBy
        ? {
            [queryConfig.orderBy]: queryConfig?.sortDirection
              ? queryConfig.sortDirection
              : "desc",
          }
        : {
            createdAt: "desc",
          },
    });

    const dataStripped = data.filter((request) => {
      if (request.allowAnotherApplication === false) return request;
    });

    return [null, dataStripped];
  } catch (error) {
    return [error instanceof Error ? error : new Error(String(error)), null];
  }
};

// AI wrote this...I can not for the life of me figure out a better solution
export const countBlockedUsers = async ({
  clanId,
  queryConfig,
}: {
  clanId: string;
  queryConfig?: QueryConfig & { uniqueUsers?: boolean };
}): Promise<[Error | null, number | null]> => {
  try {
    const count: [{ count: number }] = await prisma.$queryRaw`
  SELECT COUNT(*) AS "count"
  FROM (
    SELECT DISTINCT ON ("userId") "userId", "allowAnotherApplication", "createdAt"
    FROM "clanJoinRequest"
    WHERE "clanId" = ${clanId}
      AND "userId" IN (
        SELECT "_id"
        FROM "user"
        WHERE "name" ILIKE ${`%${
          queryConfig?.search === undefined ? "" : queryConfig?.search
        }%`} AND "banned" = false
      )
    ORDER BY "userId", "createdAt" DESC
  ) AS subquery
`;

    return [null, Number(count[0].count)];
  } catch (error) {
    return [error instanceof Error ? error : new Error(String(error)), null];
  }
};

export const unblockJoinRequest = async ({
  requestId,
  unblockedByUserId,
}: {
  requestId: string;
  unblockedByUserId: string;
}): Promise<[Error | null, ClanJoinRequestWithUserData | null]> => {
  try {
    const data = await prisma.clanJoinRequest.update({
      where: {
        id: requestId,
      },
      data: {
        unblockedByUserId: unblockedByUserId,
        status: "Denied",
        allowAnotherApplication: true,
      },
      ...config,
    });

    return [null, data];
  } catch (error) {
    return [error instanceof Error ? error : new Error(String(error)), null];
  }
};
