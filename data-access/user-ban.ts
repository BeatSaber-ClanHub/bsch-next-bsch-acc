import prisma from "@/lib/prisma";
import { BanType, UserBan } from "@/prisma/generated/prisma/client";
import { checkAuth } from "@/utils/check-auth";
import { banMember, unbanMember } from "./member";
import { Response } from "./types/types";
import { banUserById, unbanUserById } from "@/data-access/user";

interface Ban {
  discordId: string;
  justification: string;
  clanId?: string;
  userId: string;
  memberId?: string;
  type: BanType;
}

export const createUserBan = async ({
  discordId,
  justification,
  clanId,
  userId,
  memberId,
  type,
}: Ban): Promise<[Error | null, UserBan | null]> => {
  try {
    const session = await checkAuth();
    if (!session) {
      return ["Not Authenticated" as unknown as Error, null];
    }

    const result = await prisma.$transaction(async (prisma) => {
      const data = await prisma.userBan.create({
        data: {
          discordId: discordId,
          justification: justification,
          clanId: clanId,
          userId: userId,
          memberId: memberId,
          type: type,
        },
      });

      if (type === "From_Platform") {
        const [updateMemberError] = await banUserById(userId);

        if (updateMemberError) throw updateMemberError;
      }
      if (memberId) {
        const [updateMemberError] = await banMember(memberId);
        if (updateMemberError) throw updateMemberError;
      }

      return data;
    });

    return [null, result];
  } catch (error) {
    console.log(error);
    return [error as Error, null];
  }
};

export const updateUserIdForPlatformBan = async ({
  banId,
  updatedUserId,
}: {
  banId: string;
  updatedUserId: string;
}): Promise<[Error | null, UserBan | null]> => {
  try {
    const data = await prisma.userBan.update({
      where: {
        id: banId,
      },
      data: {
        userId: updatedUserId,
      },
    });
    return [null, data];
  } catch (error) {
    console.log(error);
    return [error as Error, null];
  }
};

export const getUserBan = async (
  memberId: string
): Promise<[Error | null, Omit<UserBan, "email"> | null]> => {
  try {
    const session = await checkAuth();
    if (!session) {
      return ["Not Authenticated" as unknown as Error, null];
    }

    const data = await prisma.userBan.findFirst({
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

export const getUserPlatformBanByDiscordId = async (
  discordId: string
): Promise<[Error | null, Omit<UserBan, "email"> | null]> => {
  try {
    const data = await prisma.userBan.findFirst({
      where: {
        discordId: discordId,
        type: "From_Platform",
      },
    });

    return [null, data];
  } catch (error) {
    console.log(error);
    return [error as Error, null];
  }
};

export const getUserPlatformBan = async (
  userId: string
): Promise<[Error | null, UserBan | null]> => {
  try {
    const data = await prisma.userBan.findFirst({
      where: {
        userId: userId,
        type: "From_Platform",
      },
    });

    return [null, data];
  } catch (error) {
    console.log(error);
    return [error as Error, null];
  }
};

export const deleteUserBan = async (
  memberId: string
): Promise<Response<Omit<UserBan, "email">>> => {
  try {
    const session = await checkAuth();
    if (!session) {
      return ["Not Authenticated" as unknown as Error, null];
    }

    const result = await prisma.$transaction(async (prisma) => {
      const [error, user] = await getUserBan(memberId);
      if (error) throw error;

      await prisma.userBan.deleteMany({
        where: {
          memberId: memberId,
        },
      });

      const [updateMemberError] = await unbanMember(memberId);
      if (updateMemberError) throw updateMemberError;

      return user;
    });

    return [null, result];
  } catch (error) {
    console.log(error);
    return [error as Error, null];
  }
};

export const deleteUserPlatformBan = async (
  userId: string
): Promise<Response<UserBan>> => {
  try {
    const session = await checkAuth();
    if (!session) {
      return ["Not Authenticated" as unknown as Error, null];
    }

    const result = await prisma.$transaction(async (prisma) => {
      const [error, user] = await getUserPlatformBan(userId);
      if (error) throw error;

      const data = await prisma.userBan.deleteMany({
        where: {
          userId: userId,
          type: "From_Platform",
        },
      });

      const [updateMemberError] = await unbanUserById(userId);
      if (updateMemberError) throw updateMemberError;

      return user;
    });

    return [null, result];
  } catch (error) {
    console.log(error);
    return [error as Error, null];
  }
};
