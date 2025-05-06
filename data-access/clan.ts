import { editClanSchema } from "@/app/validation-schemas/clan/clanSchema";
import { NewClanOptions } from "@/components/types/clan-types";
import prisma from "@/lib/prisma";
import {
  ApplicationStatus,
  Prisma,
  PrismaClient,
  User,
} from "@/prisma/generated/prisma/client";
import { checkAuth } from "@/utils/check-auth";
import { DefaultArgs } from "@prisma/client/runtime/library";
import { z } from "zod";
import { unbanAllAppeals } from "./ban-appeal";
import { unbanAllBans } from "./clan-ban";
import { createClanStaffMember } from "./clan-staff";
import { createMember, getMemberCount } from "./member";
import { ClanMember, Response } from "./types/types";
import getRole from "@/utils/get-role";

// Types
export type ClanWithClanOwnerInfo = Prisma.ClanGetPayload<
  typeof clanWithUserConfig
>;
type ClanWithClanOwnerInfoAndMemberCount = ClanWithClanOwnerInfo & {
  memberCount: number;
};
type UserIncludeConfig = {
  include: {
    user: {
      select: Record<
        keyof Omit<User, "banned" | "email" | "emailVerified">,
        boolean
      >;
    };
    _count: {
      select: {
        Member: {
          where: {
            user: {
              banned: boolean;
            };
            banned: boolean;
          };
        };
      };
    };
  };
};

type BasicIncludeConfig = {
  include: {
    user: {
      select: Record<
        keyof Omit<User, "banned" | "email" | "emailVerified">,
        boolean
      >;
    };
    _count: {
      select: {
        Member: {
          where: {
            banned: boolean;
          };
        };
      };
    };
  };
  omit: {
    description: true;
    banner_file_key: true;
    logo_url: true;
  };
};
type BasicIncludeConfigWithFileKeys = {
  include: {
    user: {
      select: Record<
        keyof Omit<User, "banned" | "email" | "emailVerified">,
        boolean
      >;
    };
    _count: {
      select: {
        Member: {
          where: {
            banned: boolean;
          };
        };
      };
    };
  };
  omit: {
    description: true;
    logo_url: true;
  };
};
// export type ClanWithClanOwnerInfoAndBasicData = Omit<
//   ClanWithClanOwnerInfo,
//   "description" | "banner_file_key" | "logo_url"
// >;
export type ClanWithClanOwnerInfoAndBasicData = Prisma.ClanGetPayload<
  typeof clanWithUserAndBasicInfo
>;
const clanWithUserConfig: UserIncludeConfig = {
  include: {
    user: {
      select: {
        id: true,
        name: true,
        image: true,
        createdAt: true,
        updatedAt: true,
      },
    },
    _count: {
      select: {
        Member: {
          where: {
            user: {
              banned: false,
            },
            banned: false,
          },
        },
      },
    },
  },
};
const clanWithUserConfigAndFileKeys: UserIncludeConfig = {
  include: {
    user: {
      select: {
        id: true,
        name: true,
        image: true,
        createdAt: true,
        updatedAt: true,
      },
    },
    _count: {
      select: {
        Member: {
          where: {
            user: {
              banned: false,
            },
            banned: false,
          },
        },
      },
    },
  },
};
export type ClanWithClanOwnerInfoAndBasicDataAndFileKeys =
  Prisma.ClanGetPayload<typeof clanWithUserAndBasicInfoAndFileKeys>;

export const clanWithUserAndBasicInfo: BasicIncludeConfig & {
  include: { user: { select: { banned?: boolean } } };
} = {
  include: {
    user: {
      select: {
        id: true,
        name: true,
        image: true,
        createdAt: true,
        updatedAt: true,
      },
    },
    _count: {
      select: {
        Member: {
          where: {
            banned: false,
          },
        },
      },
    },
  },
  omit: {
    description: true,
    banner_file_key: true,
    logo_url: true,
  },
};
export const clanWithUserAndBasicInfoAndFileKeys: BasicIncludeConfigWithFileKeys & {
  include: { user: { select: { banned?: boolean } } };
} = {
  include: {
    user: {
      select: {
        id: true,
        name: true,
        image: true,
        createdAt: true,
        updatedAt: true,
      },
    },
    _count: {
      select: {
        Member: {
          where: {
            banned: false,
          },
        },
      },
    },
  },
  omit: {
    description: true,
    logo_url: true,
  },
};

export const getClans = async (
  config?: Prisma.ClanFindManyArgs
): Promise<[Error | null, ClanWithClanOwnerInfoAndBasicData[] | null]> => {
  const { role } = await getRole();

  try {
    const data = await prisma.clan.findMany({
      ...config,
      include: {
        ...clanWithUserAndBasicInfo.include,
        user: {
          select: {
            ...clanWithUserAndBasicInfo.include.user.select,
            ...(role ? { banned: true } : {}),
          },
        },
      },
      omit: { ...clanWithUserAndBasicInfo.omit },
    });
    return [null, data];
  } catch (error) {
    return [error instanceof Error ? error : new Error(String(error)), null];
  }
};

export const getClan = async (
  id: string
): Promise<[Error | null, ClanWithClanOwnerInfoAndMemberCount | null]> => {
  try {
    // const data = await prisma.clan.findUnique({
    //   where: {
    //     id: id,
    //   },
    //   ...clanWithUserConfig,
    // });

    // const [memberCountError, count] = await getMemberCount({
    //   clanId: id,
    //   user: {
    //     banned: false,
    //   },
    //   banned: false,
    // });
    // if (memberCountError) throw memberCountError;
    // const resp: ClanWithClanOwnerInfoAndMemberCount = {
    //   ...data,
    //   memberCount: count as number,
    // };

    const data = await prisma.clan.findUnique({
      where: {
        id: id,
      },
      ...clanWithUserConfig,
    });
    if (!data) return [null, null];

    const newData: ClanWithClanOwnerInfoAndMemberCount = {
      ...data,
      memberCount: data?._count.Member || 0,
    };

    return [null, newData];
  } catch (error) {
    console.log(error);
    return [error instanceof Error ? error : new Error(String(error)), null];
  }
};

export const getYourClans = async ({
  limit = 20,
  offset = 0,
}: {
  limit?: number;
  offset?: number;
}): Promise<[Error | null, ClanWithClanOwnerInfoAndBasicData[] | null]> => {
  try {
    const session = await checkAuth();
    if (!session) return [new Error("Not authenticated"), null];

    const data = await prisma.clan.findMany({
      where: {
        clan_owner: session.user.id,
      },
      ...clanWithUserAndBasicInfo,
      take: limit,
      skip: offset,
    });

    return [null, data];
  } catch (error) {
    console.log(error);
    return [error instanceof Error ? error : new Error(String(error)), null];
  }
};

export const getJoinedClans = async ({
  take = 20,
  skip = 0,
}: {
  take?: number;
  skip?: number;
}): Promise<[Error | null, ClanWithClanOwnerInfoAndBasicData[] | null]> => {
  try {
    const session = await checkAuth();
    if (!session) return [new Error("Not authenticated"), null];

    const data = await prisma.clan.findMany({
      where: {
        NOT: {
          clan_owner: session.user.id,
        },
        Member: {
          some: {
            userId: session.user.id,
          },
        },
      },
      ...clanWithUserAndBasicInfo,
      take: take,
      skip: skip,
    });

    return [null, data];
  } catch (error) {
    console.log(error);
    return [error instanceof Error ? error : new Error(String(error)), null];
  }
};

export const getClanCount = async (
  config?: Prisma.ClanCountArgs
): Promise<[Error | null, number | null]> => {
  try {
    const data = await prisma.clan.count(config);

    return [null, data];
  } catch (error) {
    console.log(error);
    return [error instanceof Error ? error : new Error(String(error)), null];
  }
};
export const getUniqueClanOwnerCount = async (): Promise<
  [Error | null, number | null]
> => {
  try {
    const data = await prisma.clan.groupBy({
      by: ["clan_owner"],
      _count: true,
    });

    // The number of unique ownerIds is the length of the result array
    return [null, data.length];
  } catch (error) {
    console.log(error);
    return [error instanceof Error ? error : new Error(String(error)), null];
  }
};

export const getJoinedClanCount = async (): Promise<Response<number>> => {
  try {
    const session = await checkAuth();
    if (!session) return [new Error("Not authenticated"), null];

    const [error, data] = await getClanCount({
      where: {
        NOT: {
          clan_owner: session.user.id,
        },
        Member: {
          some: {
            userId: session.user.id,
          },
        },
      },
    });

    if (error) throw error;
    return [null, data];
  } catch (error) {
    console.log(error);
    return [error instanceof Error ? error : new Error(String(error)), null];
  }
};

export const createClan = async (
  clanData: NewClanOptions
): Promise<[Error | null, ClanWithClanOwnerInfo | null]> => {
  try {
    const session = await checkAuth();
    if (!session) return [new Error("Not authenticated"), null];

    // Transaction is used because not JUST a clan is created but that is the general purpose of this method. If anything fails, the function returns an error
    const result = await prisma.$transaction(async (prisma) => {
      // Create clan
      const clan = await prisma.clan.create({
        data: {
          ...clanData,
          description:
            clanData.description === null
              ? Prisma.JsonNull
              : clanData.description,
        },
        ...clanWithUserConfig,
      });

      // Create member
      const [memberError, clanMember] = (await createMember({
        clanId: clan.id,
        userId: clan.clan_owner,
        prisma: prisma,
      })) as unknown as [Error, ClanMember];
      if (memberError) throw new Error(memberError.message); // Handle the member error

      const clanMemberId = clanMember.id;

      // Create clan staff member
      const [staffError] = await createClanStaffMember({
        clanId: clan.id,
        userId: clanData.clan_owner,
        memberId: clanMemberId,
        role: "Creator",
        prisma: prisma,
      });
      if (staffError) throw new Error(staffError.message); // Handle the staff error

      return {
        ...clan,
        _count: {
          Member: 1,
        },
      };
    });

    return [null, result];
  } catch (error) {
    console.log(error);
    return [error instanceof Error ? error : new Error(String(error)), null];
  }
};

export const updateClanBanner = async ({
  clanId,
  bannerUrl,
  fileKey,
}: {
  clanId: string;
  bannerUrl: string;
  fileKey: string;
}): Promise<[Error | null, ClanWithClanOwnerInfoAndBasicData | null]> => {
  try {
    const session = await checkAuth();
    if (!session) return [new Error("Not authenticated"), null];

    // Create clan
    const data = await prisma.clan.update({
      where: {
        id: clanId,
      },
      data: {
        banner_url: bannerUrl,
        banner_file_key: fileKey,
      },
      ...clanWithUserAndBasicInfo,
    });

    return [null, data];
  } catch (error) {
    console.log(error);
    return [error instanceof Error ? error : new Error(String(error)), null];
  }
};

export const updateClan = async ({
  clanId,
  data: clanData,
}: {
  clanId: string;
  data: z.infer<typeof editClanSchema>;
}): Promise<[Error | null, ClanWithClanOwnerInfo | null]> => {
  try {
    const session = await checkAuth();
    if (!session) return [new Error("Not authenticated"), null];

    // Create clan
    const data = await prisma.clan.update({
      where: {
        id: clanId,
      },
      data: {
        ...clanData,
        description:
          clanData.description === null
            ? Prisma.JsonNull
            : clanData.description,
      },
      ...clanWithUserConfig,
    });

    return [null, data];
  } catch (error) {
    console.log(error);
    return [error instanceof Error ? error : new Error(String(error)), null];
  }
};

export const updateApplicationStatus = async ({
  clanId,
  applicationStatus,
  prisma: prismaInstance,
}: {
  clanId: string;
  applicationStatus: ApplicationStatus;
  prisma?: Omit<
    PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>,
    "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
  >;
}): Promise<[Error | null, ClanWithClanOwnerInfoAndBasicData | null]> => {
  try {
    const session = await checkAuth();
    if (!session) return [new Error("Not authenticated"), null];

    const data = await (prismaInstance ? prismaInstance : prisma).clan.update({
      where: {
        id: clanId,
      },
      data: {
        application_status: applicationStatus,
      },
      ...clanWithUserAndBasicInfo,
    });

    return [null, data];
  } catch (error) {
    console.log(error);
    return [error instanceof Error ? error : new Error(String(error)), null];
  }
};

export const updateBanStatus = async ({
  clanId,
  banStatus,
  prisma: prismaInstance,
}: {
  clanId: string;
  banStatus: boolean;
  prisma?: Omit<
    PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>,
    "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
  >;
}): Promise<[Error | null, ClanWithClanOwnerInfoAndBasicData | null]> => {
  try {
    const session = await checkAuth();
    if (!session) return [new Error("Not authenticated"), null];

    const data = await (prismaInstance ? prismaInstance : prisma).clan.update({
      where: {
        id: clanId,
      },
      data: {
        banned: banStatus,
      },
      ...clanWithUserAndBasicInfo,
    });

    return [null, data];
  } catch (error) {
    console.log(error);
    return [error instanceof Error ? error : new Error(String(error)), null];
  }
};

export const getBannedClans = async (
  config?: Pick<Prisma.ClanFindManyArgs, "where" | "orderBy" | "skip" | "take">
): Promise<[Error | null, ClanWithClanOwnerInfoAndBasicData[] | null]> => {
  try {
    const session = await checkAuth();
    if (!session) return [new Error("Not authenticated"), null];

    const whereClause = config?.where ?? {};

    const data = await prisma.clan.findMany({
      where: {
        banned: true,
        ...whereClause,
      },
      ...clanWithUserAndBasicInfo,
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

export const unbanClan = async (
  clanId: string
): Promise<[Error | null, ClanWithClanOwnerInfoAndBasicData | null]> => {
  try {
    const session = await checkAuth();
    if (!session) return [new Error("Not authenticated"), null];

    const data = await prisma.$transaction(async () => {
      const clan = await prisma.clan.update({
        where: {
          id: clanId,
        },
        data: {
          banned: false,
        },
        ...clanWithUserAndBasicInfo,
      });

      const [unbanError] = await unbanAllBans(clanId);
      if (unbanError) throw unbanError;

      const [unbanAppealError] = await unbanAllAppeals(clanId);
      if (unbanAppealError) throw unbanAppealError;

      return clan;
    });

    return [null, data];
  } catch (error) {
    return [error instanceof Error ? error : new Error(String(error)), null];
  }
};

export const deleteClan = async (
  clanId: string
): Promise<
  [Error | null, ClanWithClanOwnerInfoAndBasicDataAndFileKeys | null]
> => {
  try {
    const session = await checkAuth();
    if (!session) return [new Error("Not authenticated"), null];

    const data = await prisma.clan.delete({
      where: {
        id: clanId,
      },
      ...clanWithUserAndBasicInfoAndFileKeys,
    });

    return [null, data];
  } catch (error) {
    return [error instanceof Error ? error : new Error(String(error)), null];
  }
};

export const transferClanOwnership = async ({
  clanId,
  newOwnerUserId,
  newOwnerMemberId,
  oldOwnerMemberId,
}: {
  clanId: string;
  newOwnerUserId: string;
  newOwnerMemberId: string;
  oldOwnerMemberId: string;
}): Promise<[Error | null, ClanWithClanOwnerInfoAndBasicData | null]> => {
  try {
    const session = await checkAuth();
    if (!session) return [new Error("Not authenticated"), null];

    const data = await prisma.$transaction(async () => {
      const updatedClan = await prisma.clan.update({
        where: {
          id: clanId,
        },
        data: {
          clan_owner: newOwnerUserId,
        },
        ...clanWithUserAndBasicInfo,
      });

      await prisma.clanStaff.upsert({
        where: {
          memberId: newOwnerMemberId,
        },
        create: {
          clanId: clanId,
          memberId: newOwnerMemberId,
          userId: newOwnerUserId,
          role: "Creator",
        },
        update: {
          role: "Creator",
        },
      });

      await prisma.clanStaff.update({
        where: {
          memberId: oldOwnerMemberId,
        },
        data: {
          role: "Administrator",
        },
      });

      return updatedClan;
    });

    return [null, data];
  } catch (error) {
    return [error instanceof Error ? error : new Error(String(error)), null];
  }
};
