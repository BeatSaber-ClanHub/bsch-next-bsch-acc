import { checkAuth } from "@/utils/check-auth";
import { updateBanStatus } from "./clan";
import { updateCurrentBanStatus } from "./clan-ban";
import { EnrichedBanAppeal, Response } from "./types/types";
import {
  BanAppeal,
  Prisma,
  ReviewStatus,
} from "@/prisma/generated/prisma/client";
import prisma from "@/lib/prisma";

export const createBanAppeal = async ({
  banId,
  justification,
  clanId,
}: {
  banId: string;
  justification: string;
  clanId: string;
}): Promise<Response<BanAppeal>> => {
  try {
    const session = await checkAuth();
    if (!session) return ["Not Authenticated" as unknown as Error, null];

    const data = await prisma.banAppeal.create({
      data: {
        status: "Submitted",
        banId: banId,
        justification: justification,
        clanId: clanId,
        appealSubmittedBy: session.user.id,
      },
    });

    return [null, data];
  } catch (error) {
    return [error as Error, null];
  }
};

export const getBanAppeal = async ({
  banId,
  status = ["Approved", "Denied", "In_Review", "Submitted"],
}: {
  banId: string;
  status?: Array<ReviewStatus>;
}): Promise<[Error | null, EnrichedBanAppeal | null]> => {
  try {
    const session = await checkAuth();
    if (!session) return ["Not Authenticated" as unknown as Error, null];

    const data = await prisma.banAppeal.findFirst({
      where: {
        banId: banId,
        status: {
          in: [...status],
        },
      },
      include: {
        user: {
          omit: {
            email: true,
            emailVerified: true,
          },
        },
        submittedBy: {
          omit: {
            email: true,
            emailVerified: true,
          },
        },
        clan: {
          omit: {
            banner_file_key: true,
          },
          include: {
            user: {
              omit: {
                email: true,
                emailVerified: true,
              },
            },
          },
        },
        ban: {
          include: {
            user: {
              omit: {
                email: true,
                emailVerified: true,
              },
            },
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return [null, data as unknown as EnrichedBanAppeal];
  } catch (error) {
    return [error as Error, null];
  }
};

export const getBanAppealById = async (
  appealId: string
): Promise<[Error | null, EnrichedBanAppeal | null]> => {
  try {
    const session = await checkAuth();
    if (!session) return ["Not Authenticated" as unknown as Error, null];

    const data = await prisma.banAppeal.findUnique({
      where: {
        id: appealId,
      },
      include: {
        user: {
          omit: {
            email: true,
            emailVerified: true,
          },
        },
        submittedBy: {
          omit: {
            email: true,
            emailVerified: true,
          },
        },
        clan: {
          omit: {
            banner_file_key: true,
          },
          include: {
            user: {
              omit: {
                email: true,
                emailVerified: true,
              },
            },
          },
        },
        ban: {
          include: {
            user: {
              omit: {
                email: true,
                emailVerified: true,
              },
            },
          },
        },
      },
    });

    return [null, data as unknown as EnrichedBanAppeal];
  } catch (error) {
    return [error as Error, null];
  }
};
export const getBanAppeals = async (
  config?: Pick<
    Prisma.BanAppealFindManyArgs,
    "where" | "orderBy" | "skip" | "take"
  >
): Promise<[Error | null, Array<BanAppeal> | null]> => {
  try {
    const session = await checkAuth();
    if (!session) return ["Not Authenticated" as unknown as Error, null];
    const data = await prisma.banAppeal.findMany({
      ...config,
      include: {
        user: {
          omit: {
            email: true,
            emailVerified: true,
          },
        },
        submittedBy: {
          omit: {
            email: true,
            emailVerified: true,
          },
        },
        ban: {
          include: {
            user: {
              omit: {
                emailVerified: true,
                email: true,
                banned: true,
              },
            },
          },
        },
        clan: {
          include: {
            user: {
              omit: {
                email: true,
                emailVerified: true,
              },
            },
          },
        },
      },
      take: config?.take || 20,
    });

    return [null, data];
  } catch (error) {
    return [error as Error, null];
  }
};

export const getAppealCount = async (
  config?: Pick<
    Prisma.BanAppealFindManyArgs,
    "where" | "orderBy" | "skip" | "take"
  >
): Promise<[Error | null, number | null]> => {
  try {
    const session = await checkAuth();
    if (!session) return [new Error("Not Authenticated"), null];
    const data = await prisma.banAppeal.count({
      where: {
        status: config?.where?.status
          ? config?.where?.status
          : {
              not: "Approved",
            },
        ...config?.where,
      },
      orderBy: config?.orderBy ? config.orderBy : { createdAt: "desc" },
      skip: config?.skip ? config?.skip : 0,
      take: config?.take ? config?.take : 20,
    });

    return [null, data];
  } catch (error) {
    return [error instanceof Error ? error : new Error(String(error)), null];
  }
};

export const updateBanAppeal = async ({
  appealId,
  clanId,
  banId,
  comments,
  status,
  allowAnotherAppeal,
}: {
  appealId: string;
  clanId: string;
  banId: string;
  comments?: string;
  status?: ReviewStatus;
  allowAnotherAppeal?: boolean;
}): Promise<Response<EnrichedBanAppeal>> => {
  try {
    const session = await checkAuth();
    if (!session) return ["Not Authenticated" as unknown as Error, null];

    if (status === "Approved" || status === "Denied") {
      const data = await prisma.$transaction(async (prisma) => {
        const appealData = await prisma.banAppeal.update({
          where: {
            id: appealId,
          },
          data: {
            appealReviewedBy: session.user.id,
            ...(comments ? { comments: comments } : {}),
            ...(status ? { status: status } : {}),
            ...(allowAnotherAppeal
              ? { allowAnotherAppeal: allowAnotherAppeal }
              : {}),
          },
          include: {
            user: {
              omit: {
                email: true,
                emailVerified: true,
              },
            },
            submittedBy: {
              omit: {
                email: true,
                emailVerified: true,
              },
            },
            clan: {
              omit: {
                banner_file_key: true,
              },
              include: {
                user: {
                  omit: {
                    email: true,
                    emailVerified: true,
                  },
                },
              },
            },
            ban: {
              include: {
                user: {
                  omit: {
                    email: true,
                    emailVerified: true,
                  },
                },
              },
            },
          },
        });

        const [updatedBanStatusError] = await updateBanStatus({
          banStatus: status === "Approved" ? false : true,
          clanId: clanId,
          prisma: prisma,
        });
        if (updatedBanStatusError) throw updatedBanStatusError;

        const [banStatusError] = await updateCurrentBanStatus({
          banId: banId,
          status: status,
          prisma: prisma,
        });
        if (banStatusError) throw banStatusError;

        return appealData;
      });

      return [null, data as EnrichedBanAppeal];
    }

    const data = await prisma.banAppeal.update({
      where: {
        id: appealId,
      },
      data: {
        appealReviewedBy: session.user.id,
        comments,
        status,
        allowAnotherAppeal,
      },
      include: {
        user: {
          omit: {
            email: true,
            emailVerified: true,
          },
        },
        submittedBy: {
          omit: {
            email: true,
            emailVerified: true,
          },
        },
        clan: {
          omit: {
            banner_file_key: true,
          },
          include: {
            user: {
              omit: {
                email: true,
                emailVerified: true,
              },
            },
          },
        },
        ban: {
          include: {
            user: {
              omit: {
                email: true,
                emailVerified: true,
              },
            },
          },
        },
      },
    });
    console.log(data);
    return [null, data as EnrichedBanAppeal];
  } catch (error) {
    return [error as Error, null];
  }
};

export const unbanAllAppeals = async (
  clanId: string
): Promise<[Error | null, number | null]> => {
  try {
    const session = await checkAuth();
    if (!session) return [new Error("Not authenticated"), null];

    const bannedClans = await prisma.banAppeal.updateMany({
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
