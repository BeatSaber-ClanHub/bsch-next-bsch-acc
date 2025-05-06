import prisma from "@/lib/prisma";
import {
  ClanStaffRole,
  Member,
  Prisma,
  PrismaClient,
  User,
} from "@/prisma/generated/prisma/client";
import { checkAuth } from "@/utils/check-auth";
import { DefaultArgs } from "@prisma/client/runtime/library";
import { ClanMember, Response } from "./types/types";

const includeConfig = {
  include: {
    ClanStaff: {
      select: {
        role: true,
      },
    },
    user: {
      omit: {
        banned: true,
        email: true,
        emailVerified: true,
      },
    },
  },
};
export type ConfigType = Prisma.MemberGetPayload<typeof includeConfig>;
// export type ConfigType = test & { role: ClanStaffRole | "Member" };

export interface EnrichedClanMember {
  id: string;
  banned?: boolean;
  createdAt: Date;
  updatedAt: Date;
  role: ClanStaffRole | "Member";
  user: Omit<User, "email" | "emailVerified" | "banned">;
  userId: string;
  clanId: string;
}

// export type EnrichedClanMember = EnrichedClanMemberRText & {role: ClanStaffRole | "Member"}
export const createMember = async ({
  userId,
  clanId,
  prisma: prismaInstance,
}: {
  userId: string;
  clanId: string;
  prisma?: Omit<
    PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>,
    "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
  >;
}): Promise<[Error | null, EnrichedClanMember | null]> => {
  try {
    const data = await (prismaInstance ? prismaInstance : prisma).member.create(
      {
        data: {
          clanId: clanId,
          userId: userId,
        },
        ...includeConfig,
      }
    );

    const member: EnrichedClanMember = {
      id: data.id,
      user: data.user,
      banned: data.banned,
      role: data.ClanStaff?.role ?? "Member",
      clanId: data.clanId,
      userId: data.userId,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };

    return [null, member];
  } catch (error) {
    return [error instanceof Error ? error : new Error(String(error)), null];
  }
};

export const getMemberCount = async (
  config?: Prisma.MemberWhereInput
): Promise<Response<number>> => {
  try {
    const data = await prisma.member.count({
      where: config,
    });

    return [null, data];
  } catch (error) {
    console.log(error);
    return [error instanceof Error ? error : new Error(String(error)), null];
  }
};

type Dir = "asc" | "desc";
export interface OrderByParams {
  name?: Dir;
  id?: Dir;
  createdAt?: Dir;
  ClanStaff?: {
    role?: Dir;
  };
}

export type GetMembersProps = {
  clanId: string;
  take?: number;
  skip?: number;
  orderBy?: OrderByParams | null;
  search?: string | null;
  includeBanned?: boolean;
};

export const getMembers = async ({
  clanId,
  take = 20,
  skip = 0,
  orderBy = null,
  search = null,
  includeBanned = false,
}: GetMembersProps): Promise<[Error | null, EnrichedClanMember[] | null]> => {
  try {
    const data = await prisma.member.findMany({
      where: {
        clanId: clanId,
        user: {
          banned: false,
        },
        ...(!includeBanned && {
          NOT: {
            banned: true,
          },
        }),
        ...(search && {
          user: {
            name: { contains: search, mode: "insensitive" },
          },
        }),
      },
      ...includeConfig,
      ...(orderBy && { orderBy }),
      take: take,
      skip: skip,
    });

    const users = data.map((member) => {
      const role: ClanStaffRole | "Member" =
        (member.ClanStaff?.role as ClanStaffRole) || "Member";
      const user = member.user;
      const banned = member.banned;
      const t = {
        id: member.id,
        ...(includeBanned && { banned: banned }),
        role: role,
        createdAt: member.createdAt,
        user: {
          ...user,
        },
      };
      return t;
    });

    return [null, users as unknown as EnrichedClanMember[]];
  } catch (error) {
    console.log(error);
    return [error instanceof Error ? error : new Error(String(error)), null];
  }
};

export const getMember = async ({
  clanId,
  userId,
}: {
  clanId: string;
  userId: string;
}): Promise<[Error | null, ClanMember | null]> => {
  try {
    const data = (await prisma.member.findFirst({
      where: {
        clanId: clanId,
        userId: userId,
        user: {
          banned: false,
        },
      },
    })) as unknown as ClanMember;

    return [null, data];
  } catch (error) {
    console.log(error);
    return [error instanceof Error ? error : new Error(String(error)), null];
  }
};

export const banMember = async (
  memberId: string
): Promise<[Error | null, Member | null]> => {
  try {
    const session = await checkAuth();
    if (!session) return ["Not Authenticated" as unknown as Error, null];

    const data = await prisma.member.update({
      where: {
        id: memberId,
      },
      data: {
        banned: true,
      },
    });

    return [null, data];
  } catch (error) {
    console.log(error);
    return [error instanceof Error ? error : new Error(String(error)), null];
  }
};

export const unbanMember = async (
  memberId: string
): Promise<[Error | null, EnrichedClanMember | null]> => {
  try {
    const session = await checkAuth();
    if (!session) return ["Not Authenticated" as unknown as Error, null];

    const data = await prisma.member.update({
      where: {
        id: memberId,
      },
      data: {
        banned: false,
      },
      ...includeConfig,
    });

    return [null, data as unknown as EnrichedClanMember];
  } catch (error) {
    console.log(error);
    return [error instanceof Error ? error : new Error(String(error)), null];
  }
};

// Kicking a member deletes them from the members records.
export const kickMember = async (
  memberId: string
): Promise<[Error | null, EnrichedClanMember | null]> => {
  try {
    const session = await checkAuth();
    if (!session) return ["Not Authenticated" as unknown as Error, null];

    const data = await prisma.member.delete({
      where: {
        id: memberId,
      },
      ...includeConfig,
    });

    return [null, data as unknown as EnrichedClanMember];
  } catch (error) {
    return [error instanceof Error ? error : new Error(String(error)), null];
  }
};

// Kicking a member deletes them from the members records.
export const leaveClan = async (
  memberId: string
): Promise<[Error | null, EnrichedClanMember | null]> => {
  try {
    const session = await checkAuth();
    if (!session) return ["Not Authenticated" as unknown as Error, null];

    const data = await prisma.member.delete({
      where: {
        id: memberId,
      },
      ...includeConfig,
    });

    return [null, data as unknown as EnrichedClanMember];
  } catch (error) {
    return [error instanceof Error ? error : new Error(String(error)), null];
  }
};
