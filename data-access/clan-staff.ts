import prisma from "@/lib/prisma";
import { checkAuth } from "@/utils/check-auth";
import {
  ClanStaff,
  ClanStaffRole,
  Prisma,
  PrismaClient,
} from "@/prisma/generated/prisma/client";
import { Response } from "./staff";
import { DefaultArgs } from "@prisma/client/runtime/library";

export const createClanStaffMember = async ({
  clanId,
  userId,
  memberId,
  role,
  prisma: prismaInstance,
}: {
  clanId: string;
  userId: string;
  memberId: string;
  role: ClanStaffRole;
  prisma?: Omit<
    PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>,
    "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
  >;
}): Promise<Response<ClanStaff>> => {
  try {
    const data = await (prismaInstance
      ? prismaInstance
      : prisma
    ).clanStaff.create({
      data: {
        clanId: clanId,
        memberId: memberId,
        userId: userId,
        role: role,
      },
    });

    return [null, data];
  } catch (error) {
    return [error as Error, null];
  }
};

export type RoleResponse<T> = [Error | null, T | null];

/**
 * Gets user role
 * @returns - A promise that resolves to a member or an error.
 */
export const getStaffMember = async ({
  clanId,
  userId,
}: {
  clanId: string;
  userId: string;
}): Promise<RoleResponse<ClanStaff>> => {
  try {
    // Create clan
    const data: ClanStaff | null = await prisma.clanStaff.findFirst({
      where: {
        userId: userId,
        clanId: clanId,
      },
    });

    return [null, data];
  } catch (error) {
    console.log(error);
    return [error as Error, null];
  }
};

export const getClanRoleFromUserIdAndClanId = async ({
  userId,
  clanId,
}: {
  userId: string;
  clanId: string;
}): Promise<[Error | null, { role: ClanStaffRole } | null]> => {
  try {
    const data = await prisma.clanStaff.findFirst({
      where: {
        userId: userId,
        clanId: clanId,
      },
      select: {
        role: true,
      },
    });

    return [null, data];
  } catch (error) {
    console.log(error);
    return [error as Error, null];
  }
};

export const updateClanMemberRole = async ({
  role,
  memberId,
}: {
  role: ClanStaffRole;
  memberId: string;
}): Promise<[Error | null, ClanStaff | null]> => {
  try {
    const session = await checkAuth();
    if (!session) return ["Not authenticated" as unknown as Error, null];

    const data = await prisma.clanStaff.update({
      where: {
        memberId: memberId,
      },
      data: {
        role: role,
      },
    });

    return [null, data];
  } catch (error) {
    console.log(error);
    return [error as Error, null];
  }
};

export const unassignRole = async (
  memberId: string
): Promise<[Error | null, ClanStaff | null]> => {
  try {
    const session = await checkAuth();
    if (!session) return ["Not authenticated" as unknown as Error, null];

    const data = await prisma.clanStaff.delete({
      where: {
        memberId: memberId,
      },
    });

    return [null, data];
  } catch (error) {
    console.log(error);
    return [error as Error, null];
  }
};
