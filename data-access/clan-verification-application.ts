import {
  ClanWithClanOwnerInfoAndBasicData,
  clanWithUserAndBasicInfo,
  updateApplicationStatus,
} from "@/data-access/clan";
import prisma from "@/lib/prisma";
import { Prisma } from "@/prisma/generated/prisma/client";
import { checkAuth } from "@/utils/check-auth";
import { DefaultArgs } from "@prisma/client/runtime/library";
import { ClanVerificationApplications } from "../prisma/generated/prisma/client/index";

const include = {
  include: {
    clan: {
      include: {
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
      },
      omit: {
        description: true,
        banner_file_key: true,
      },
    },
    reviewedByUser: {
      select: {
        id: true,
        name: true,
        image: true,
        createdAt: true,
        updatedAt: true,
      },
    },
    submittedBy: {
      select: {
        id: true,
        name: true,
        image: true,
        createdAt: true,
        updatedAt: true,
      },
    },
  },
};

export type ClanVerificationApplicationWithUsersAndClan =
  Prisma.ClanVerificationApplicationsGetPayload<typeof include>;

export const getVerificationApplications = async (
  config?: Pick<
    Prisma.ClanVerificationApplicationsFindManyArgs<DefaultArgs>,
    "orderBy" | "where" | "skip" | "take"
  >
): Promise<
  [null | Error, ClanVerificationApplicationWithUsersAndClan[] | null]
> => {
  try {
    const whereClause = config?.where ?? {};
    const clanWhereClause: Prisma.ClanWhereInput = whereClause?.clan ?? {};

    const data = await prisma.clanVerificationApplications.findMany({
      where: {
        ...whereClause,
        status: "Submitted",
        clan: {
          ...clanWhereClause,
          banned: false,
          visibility: "Visible",
        },
      },
      ...include,
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

export const getVerificationApplicationsCount = async (
  config?: Pick<
    Prisma.ClanVerificationApplicationsFindManyArgs<DefaultArgs>,
    "orderBy" | "where" | "skip" | "take"
  >
): Promise<[null | Error, null | number]> => {
  try {
    const session = await checkAuth();
    if (!session) return [new Error("Not authenticated"), null];

    const whereClause = config?.where ?? {};
    const clanWhereClause: Prisma.ClanWhereInput = whereClause?.clan ?? {};

    const data = await prisma.clanVerificationApplications.count({
      where: {
        ...whereClause,
        status: "Submitted",
        clan: {
          ...clanWhereClause,
          banned: false,
          visibility: "Visible",
        },
      },
    });

    return [null, data];
  } catch (error) {
    console.error(error);
    return [error instanceof Error ? error : new Error(String(error)), null];
  }
};

export interface ClanWithClanOwnerInfoAndBasicDataWithUserBannedField
  extends ClanWithClanOwnerInfoAndBasicData {
  include: {
    user: {
      banned: boolean;
    };
  };
}

export const createVerificationApplication = async (
  config: Pick<ClanVerificationApplications, "clanId" | "submittedById">
): Promise<
  [null | Error, ClanVerificationApplicationWithUsersAndClan | null]
> => {
  try {
    const data = await prisma.$transaction(async (prisma) => {
      const verification = await prisma.clanVerificationApplications.create({
        data: {
          clanId: config.clanId,
          submittedById: config.submittedById,
          status: "Submitted",
        },
        ...include,
      });

      const [verificationError] = await updateApplicationStatus({
        applicationStatus: "Applied",
        clanId: config.clanId,
        prisma: prisma,
      });

      if (verificationError) throw verificationError;

      return verification;
    });

    return [null, data];
  } catch (error) {
    console.error(error);
    return [error instanceof Error ? error : new Error(String(error)), null];
  }
};

export const verifyClanApplication = async (
  id: string
): Promise<[null | Error, ClanWithClanOwnerInfoAndBasicData | null]> => {
  try {
    const data = await prisma.$transaction(async (prisma) => {
      const updated = await prisma.clanVerificationApplications.update({
        where: {
          id: id,
        },
        data: {
          status: "Approved",
        },
        include: {
          clan: {
            ...clanWithUserAndBasicInfo,
          },
        },
      });

      const [verificationError] = await updateApplicationStatus({
        applicationStatus: "Approved",
        clanId: updated.clanId,
        prisma: prisma,
      });
      if (verificationError) throw verificationError;

      return updated;
    });

    return [null, data.clan];
  } catch (error) {
    console.error(error);
    return [error instanceof Error ? error : new Error(String(error)), null];
  }
};

// Removing a clans verification isnt the same as rejecting it. Rejecting it is for new applications. If a clan is
// already verified, then you remove it. Its application remains as approved because it was, but we set the
// status to none
export const removeClanVerification = async (
  id: string
): Promise<[null | Error, ClanWithClanOwnerInfoAndBasicData | null]> => {
  try {
    const data = await prisma.$transaction(async (prisma) => {
      const updated = await prisma.clanVerificationApplications.update({
        where: {
          id: id,
        },
        data: {
          status: "Approved",
        },
        include: {
          clan: {
            select: {
              id: true,
              banned: true,
              clan_name: true,
              clan_tag: true,
              banner_url: true,
              clan_owner: true,
              clan_specialties: true,
              createdAt: true,
              updatedAt: true,
              discord_invite_link: true,
              visibility: true,
              application_status: true,
            },
            ...clanWithUserAndBasicInfo,
          },
        },
      });

      const [verificationError] = await updateApplicationStatus({
        applicationStatus: "None",
        clanId: updated.clanId,
        prisma: prisma,
      });
      if (verificationError) throw verificationError;

      return updated;
    });

    return [null, data.clan];
  } catch (error) {
    console.error(error);
    return [error instanceof Error ? error : new Error(String(error)), null];
  }
};

export const getMostRecentApplication = async (
  clanId: string
): Promise<
  [null | Error, ClanVerificationApplicationWithUsersAndClan | null]
> => {
  try {
    const data = await prisma.clanVerificationApplications.findFirst({
      where: {
        clanId: clanId,
        status: "Submitted",
      },
      orderBy: {
        createdAt: "desc",
      },
      ...include,
    });

    return [null, data];
  } catch (error) {
    console.error(error);
    return [error instanceof Error ? error : new Error(String(error)), null];
  }
};

export const getMostRecentApplicationWithAnyStatus = async (
  clanId: string
): Promise<
  [null | Error, ClanVerificationApplicationWithUsersAndClan | null]
> => {
  try {
    const data = await prisma.clanVerificationApplications.findFirst({
      where: {
        clanId: clanId,
      },
      orderBy: {
        createdAt: "desc",
      },
      ...include,
    });

    return [null, data];
  } catch (error) {
    console.error(error);
    return [error instanceof Error ? error : new Error(String(error)), null];
  }
};

export const denyClanApplication = async (
  id: string
): Promise<[null | Error, ClanWithClanOwnerInfoAndBasicData | null]> => {
  try {
    const data = await prisma.$transaction(async (prisma) => {
      const updated = await prisma.clanVerificationApplications.update({
        where: {
          id: id,
        },
        data: {
          status: "Denied",
        },
        include: {
          clan: {
            select: {
              id: true,
              banned: true,
              clan_name: true,
              clan_tag: true,
              banner_url: true,
              clan_owner: true,
              clan_specialties: true,
              createdAt: true,
              updatedAt: true,
              discord_invite_link: true,
              visibility: true,
              application_status: true,
            },
            ...clanWithUserAndBasicInfo,
          },
        },
      });

      const [verificationError] = await updateApplicationStatus({
        applicationStatus: "Denied",
        clanId: updated.clanId,
        prisma: prisma,
      });
      if (verificationError) throw verificationError;

      return updated;
    });

    return [null, data.clan];
  } catch (error) {
    console.error(error);
    return [error instanceof Error ? error : new Error(String(error)), null];
  }
};
