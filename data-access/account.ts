import prisma from "@/lib/prisma";
import { checkAuth } from "@/utils/check-auth";
import { Account } from "@/prisma/generated/prisma/client";

export const getAccountsById = async (
  userId: string
): Promise<[Error | null, Account[] | null]> => {
  try {
    const data = await prisma.account.findMany({
      where: {
        userId: userId,
      },
    });

    return [null, data];
  } catch (error) {
    console.log(error);
    return [error as Error, null];
  }
};

export const getDiscordId = async (
  userId: string
): Promise<[Error | null, string | null]> => {
  try {
    const session = await checkAuth();
    if (!session) {
      return ["Not authenticated" as unknown as Error, null];
    }

    const data = await prisma.account.findFirst({
      where: {
        userId: userId,
      },
    });

    const discordId = data?.accountId ? data.accountId : null;

    return [null, discordId];
  } catch (error) {
    console.log(error);
    return [error as Error, null];
  }
};
