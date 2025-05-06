import prisma from "@/lib/prisma";
import getRole from "@/utils/get-role";
import { Prisma } from "@/prisma/generated/prisma/client";
import { Response } from "./types/types";

const reportSchema = {
  include: {
    userId: false,
    reportedByUser: {
      select: {
        createdAt: true,
        updatedAt: true,
        banned: true,
        id: true,
        image: true,
        name: true,
      },
    },
    clan: {
      select: {
        application_status: true,
        banned: true,
        banner_url: true,
        clan_name: true,
        clan_owner: true,
        clan_specialties: true,
        createdAt: true,
        updatedAt: true,
        description: false,
        discord_invite_link: true,
        id: true,
        visibility: true,
        clan_tag: true,
        user: {
          select: {
            createdAt: true,
            updatedAt: true,
            banned: true,
            id: true,
            image: true,
            name: true,
          },
        },
      },
    },
  },
};

const reportUserSchema = {
  include: {
    clan: false,
    user: {
      select: {
        id: true,
        image: true,
        name: true,
        createdAt: true,
        updatedAt: true,
        banned: true,
      },
    },
    reportedByUser: {
      select: {
        id: true,
        image: true,
        name: true,
        createdAt: true,
        updatedAt: true,
        banned: true,
      },
    },
  },
};
export type EnrichedClanReport = Prisma.ReportGetPayload<typeof reportSchema>;
export type EnrichedUserReport = Prisma.ReportGetPayload<
  typeof reportUserSchema
>;
interface CreateClanReportProps {
  reason: string;
  reportedBy: string;
  clanId: string;
}
interface CreateUserReportProps {
  reason: string;
  reportedBy: string;
  userId: string;
}
/**
 * Returns count of reported clans
 * @returns - A promise that resolves to a count or error
 */
export const getReportedClanCount = async (
  where?: Prisma.ReportWhereInput
): Promise<Response<number>> => {
  try {
    const { role } = await getRole();
    if (
      role !== "Administrator" &&
      role !== "Developer" &&
      role !== "Moderator"
    )
      return [null, 0];

    // Get count
    const data = await prisma.report.count({
      where: {
        type: "Clan",
        resolved: false,
        ...where,
      },
    });

    return [null, data];
  } catch (error) {
    console.log(error);
    return [error as Error, null];
  }
};

export const getReportedClans = async (
  config: Prisma.ReportFindManyArgs
): Promise<[Error | null, EnrichedClanReport[] | null]> => {
  try {
    const data = await prisma.report.findMany({
      where: {
        resolved: false,
        type: "Clan",
        ...config.where,
      },
      skip: config.skip ? config.skip : 0,
      take: config.take ? config.take : 20,
      orderBy: config.orderBy
        ? config.orderBy
        : {
            createdAt: "desc",
          },
      ...reportSchema,
    });

    return [null, data];
  } catch (error) {
    return [error instanceof Error ? error : new Error(String(error)), null];
  }
};
export const getReport = async (
  reportId: string
): Promise<[Error | null, EnrichedClanReport | null]> => {
  try {
    const data = await prisma.report.findUnique({
      where: {
        id: reportId,
      },
      ...reportSchema,
    });

    return [null, data];
  } catch (error) {
    return [error instanceof Error ? error : new Error(String(error)), null];
  }
};

export const createClanReport = async (
  config: CreateClanReportProps
): Promise<[Error | null, EnrichedClanReport | null]> => {
  try {
    const data = await prisma.report.create({
      data: {
        type: "Clan",
        reason: config.reason,
        reportedBy: config.reportedBy,
        clanId: config.clanId,
      },
      ...reportSchema,
    });

    return [null, data];
  } catch (error) {
    return [error instanceof Error ? error : new Error(String(error)), null];
  }
};

export const dismissReport = async (
  reportId: string
): Promise<[Error | null, EnrichedClanReport | null]> => {
  try {
    const data = await prisma.report.update({
      where: {
        id: reportId,
      },
      data: {
        resolved: true,
      },
      ...reportSchema,
    });

    return [null, data];
  } catch (error) {
    return [error instanceof Error ? error : new Error(String(error)), null];
  }
};

// User reports

export const getReportedUserCount = async (
  where?: Prisma.ReportWhereInput
): Promise<Response<number>> => {
  try {
    const { role } = await getRole();
    if (
      role !== "Administrator" &&
      role !== "Developer" &&
      role !== "Moderator"
    )
      return [null, 0];

    // Get count
    const data = await prisma.report.count({
      where: {
        type: "User",
        resolved: false,
        ...where,
      },
    });

    return [null, data];
  } catch (error) {
    console.log(error);
    return [error as Error, null];
  }
};

export const getReportedUsers = async (
  config: Prisma.ReportFindManyArgs
): Promise<[Error | null, EnrichedUserReport[] | null]> => {
  try {
    const data = await prisma.report.findMany({
      where: {
        resolved: false,
        type: "User",
        ...config.where,
      },
      skip: config.skip ? config.skip : 0,
      take: config.take ? config.take : 20,
      orderBy: config.orderBy
        ? config.orderBy
        : {
            createdAt: "desc",
          },
      ...reportUserSchema,
    });

    return [null, data];
  } catch (error) {
    return [error instanceof Error ? error : new Error(String(error)), null];
  }
};

export const createUserReport = async (
  config: CreateUserReportProps
): Promise<[Error | null, EnrichedUserReport | null]> => {
  try {
    const data = await prisma.report.create({
      data: {
        type: "User",
        reason: config.reason,
        reportedBy: config.reportedBy,
        userId: config.userId,
      },
      ...reportUserSchema,
    });

    return [null, data];
  } catch (error) {
    return [error instanceof Error ? error : new Error(String(error)), null];
  }
};
