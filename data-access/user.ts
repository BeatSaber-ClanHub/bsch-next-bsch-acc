import prisma from "@/lib/prisma";
import { Prisma, User } from "@/prisma/generated/prisma/client";
import getRole from "@/utils/get-role";
import { Response } from "./types/types";

const basicInclude = {
  include: {
    staff: {
      select: {
        role: true,
      },
    },
  },
  omit: {
    email: true,
    emailVerified: true,
  },
};

export type BasicUser = Omit<
  Prisma.UserGetPayload<typeof basicInclude>,
  "email" | "emailVerified"
>;
export type UserWithClansWhereMember = Prisma.UserGetPayload<
  typeof basicInclude
>;

export const getUsers = async (
  props: Prisma.UserFindManyArgs
): Promise<[Error | null, BasicUser[] | null]> => {
  try {
    const data = await prisma.user.findMany({
      ...props,
      ...basicInclude,
    });

    return [null, data];
  } catch (error) {
    console.log(error);
    return [error instanceof Error ? error : new Error(String(error)), null];
  }
};

export const getUserById = async (
  userId: string
): Promise<[Error | null, User | null]> => {
  try {
    const data = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    return [null, data];
  } catch (error) {
    console.log(error);
    return [error as Error, null];
  }
};

export const banUserById = async (
  userId: string
): Promise<[Error | null, BasicUser | null]> => {
  try {
    const data = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        banned: true,
      },
      ...basicInclude,
    });

    return [null, data];
  } catch (error) {
    console.log(error);
    return [error as Error, null];
  }
};

export const unbanUserById = async (
  userId: string
): Promise<[Error | null, BasicUser | null]> => {
  try {
    const data = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        banned: false,
      },
      ...basicInclude,
    });

    return [null, data];
  } catch (error) {
    console.log(error);
    return [error as Error, null];
  }
};

export const deleteUserById = async (
  userId: string
): Promise<[Error | null, User | null]> => {
  try {
    const data = await prisma.user.delete({
      where: {
        id: userId,
      },
    });

    return [null, data];
  } catch (error) {
    return [error instanceof Error ? error : new Error(String(error)), null];
  }
};
export const getUserCount = async (
  where?: Prisma.UserWhereInput
): Promise<Response<number>> => {
  try {
    // Get count
    const data = await prisma.user.count({
      ...(where ? { where: where } : {}),
    });

    return [null, data];
  } catch (error) {
    console.log(error);
    return [error as Error, null];
  }
};
