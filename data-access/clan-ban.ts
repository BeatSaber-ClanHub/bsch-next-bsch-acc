import prisma from "@/lib/prisma";
import { checkAuth } from "@/utils/check-auth";
import {
  ClanBan,
  Prisma,
  PrismaClient,
  ReviewStatus,
} from "@/prisma/generated/prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
import { updateBanStatus } from "./clan";
import { Response } from "./types/types";

const includeSchema = {
  include: {
    clan: {
      select: {
        clan_tag: true,
        banned: true,
        clan_name: true,
        banner_url: true,
        clan_owner: true,
        clan_specialties: true,
        createdAt: true,
        id: true,
        logo_url: true,
        discord_invite_link: true,
        updatedAt: true,
        visibility: true,
        application_status: true,
        user: {
          select: {
            name: true,
            banned: true,
            image: true,
            createdAt: true,
            updatedAt: true,
            id: true,
          },
        },
      },
    },
    user: {
      select: {
        name: true,
        banned: true,
        image: true,
        createdAt: true,
        updatedAt: true,
        id: true,
      },
    },
  },
};
export type EnrichedClanBan = Prisma.ClanBanGetPayload<typeof includeSchema>;

export const createClanBan = async ({
  allowAppealAt = null,
  clanId,
  justification,
  permanent = false,
}: {
  allowAppealAt?: Date | null;
  clanId: string;
  justification: string;
  permanent: boolean;
}): Promise<Response<EnrichedClanBan>> => {
  try {
    const session = await checkAuth();
    if (!session) return ["Not Authenticated" as unknown as Error, null];

    const data = await prisma.$transaction(async (prisma) => {
      const ban = await prisma.clanBan.create({
        data: {
          justification: justification,
          allowAppealAt: allowAppealAt,
          bannedBy: session.user.id,
          clanId: clanId,
          permanent: permanent,
        },
        ...includeSchema,
      });

      const [banError] = await updateBanStatus({
        clanId: clanId,
        banStatus: true,
        prisma: prisma,
      });
      if (banError) throw banError;

      return ban;
    });

    const clanData = {
      ...data.clan,
      banned: true,
    };
    return [
      null,
      {
        ...data,
        clan: {
          ...clanData,
        },
      },
    ];
  } catch (error) {
    console.log(error);
    return [error as unknown as Error, null];
  }
};

export const getClanBan = async (
  clanId: string
): Promise<[Error | null, ClanBan | null]> => {
  try {
    const session = await checkAuth();
    if (!session) throw Error("Not authenticated");

    const data = await prisma.clanBan.findFirst({
      where: {
        clanId: clanId,
        status: {
          not: "Approved",
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return [null, data];
  } catch (error) {
    console.log(error);
    return [error as Error, null];
  }
};

export const getCurrentClanBan = async (
  clanId: string
): Promise<[Error | null, ClanBan | null]> => {
  try {
    const session = await checkAuth();
    if (!session) throw Error("Not authenticated");

    const data = await prisma.clanBan.findFirst({
      where: {
        clanId: clanId,
        NOT: {
          status: {
            in: ["Approved", "Denied"],
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return [null, data];
  } catch (error) {
    console.log(error);
    return [error as Error, null];
  }
};

export const updateCurrentBanStatus = async ({
  banId,
  status,
  prisma: prismaInstance,
}: {
  banId: string;
  status: ReviewStatus;
  prisma?: Omit<
    PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>,
    "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
  >;
}): Promise<[Error | null, ClanBan | null]> => {
  try {
    const session = await checkAuth();
    if (!session) throw Error("Not authenticated");

    const data = await (prismaInstance
      ? prismaInstance
      : prisma
    ).clanBan.update({
      where: {
        id: banId,
      },
      data: {
        status: status,
      },
    });

    return [null, data];
  } catch (error) {
    console.log(error);
    return [error as Error, null];
  }
};

export const unbanAllBans = async (
  clanId: string
): Promise<[Error | null, number | null]> => {
  try {
    const session = await checkAuth();
    if (!session) return [new Error("Not authenticated"), null];

    const bannedClans = await prisma.clanBan.updateMany({
      where: {
        clanId: clanId,
      },
      data: {
        status: "Approved",
      },
    });

    return [null, bannedClans.count];
  } catch (error) {
    return [error instanceof Error ? error : new Error(String(error)), null];
  }
};

export const getBannedClans = async (
  config?: Pick<
    Prisma.ClanBanFindManyArgs,
    "where" | "orderBy" | "skip" | "take"
  >
): Promise<[null | Error, null | EnrichedClanBan[]]> => {
  try {
    const session = await checkAuth();
    if (!session) return [new Error("Not authenticated"), null];

    const whereClause = config?.where ?? {};

    const clanFilter: Prisma.ClanWhereInput = whereClause.clan ?? {};

    const data = await prisma.clanBan.findMany({
      where: {
        ...whereClause,
        clan: {
          ...clanFilter,
          banned: true,
        },
        status: {
          not: "Approved",
        },
      },
      ...includeSchema,
      orderBy: config?.orderBy ?? { updatedAt: "desc" },
      skip: config?.skip ?? 0,
      take: config?.take ?? 20,
    });

    return [null, data];
  } catch (error) {
    console.error(error);
    return [error instanceof Error ? error : new Error(String(error)), null];
  }
};

export const getBannedClansCount = async (
  config?: Pick<
    Prisma.ClanBanFindManyArgs,
    "where" | "orderBy" | "skip" | "take"
  >
): Promise<[null | Error, null | number]> => {
  try {
    const session = await checkAuth();
    if (!session) return [new Error("Not authenticated"), null];

    const whereClause = config?.where ?? {};
    const clanFilter: Prisma.ClanWhereInput = whereClause.clan ?? {};

    const data = await prisma.clanBan.count({
      where: {
        ...whereClause,
        clan: {
          ...clanFilter,
          banned: true,
        },
        status: {
          not: "Approved",
        },
      },
    });

    return [null, data];
  } catch (error) {
    console.error(error);
    return [error instanceof Error ? error : new Error(String(error)), null];
  }
};
