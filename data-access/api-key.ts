import prisma from "@/lib/prisma";
import { checkAuth } from "@/utils/check-auth";
import decryptAPIKey from "@/utils/decrypt-api-key";
import encryptApiKey from "@/utils/encrypt-api-key";
import generateApiKey from "@/utils/generate-api-key";
import hashAPIKey from "@/utils/hash-api-key";
import { apiKey } from "@/prisma/generated/prisma/client";
import { APIKeyWithDecrypt } from "./types/types";

export const countKeys = async (): Promise<[Error | null, number | null]> => {
  try {
    const session = await checkAuth();
    if (!session) return [new Error("Not Authenticated"), null];

    const data = await prisma.apiKey.count({
      where: {
        userId: session.user.id,
      },
    });

    return [null, data];
  } catch (error) {
    return [error instanceof Error ? error : new Error(String(error)), null];
  }
};

export const createKey = async ({
  name,
  expireAt,
}: {
  name: string;
  expireAt: Date | null;
}): Promise<[Error | null, apiKey | null]> => {
  try {
    const session = await checkAuth();
    if (!session) return [new Error("Not Authenticated"), null];

    const raw = generateApiKey();
    console.log("raw key", raw);
    const encrypted = encryptApiKey(raw);
    const hashed = hashAPIKey(raw);

    const data = await prisma.apiKey.create({
      data: {
        hashedKey: hashed,
        name: name,
        expireAt: expireAt,
        encryptedKey: encrypted,
        userId: session.user.id,
      },
    });

    return [null, data];
  } catch (error) {
    return [error instanceof Error ? error : new Error(String(error)), null];
  }
};
export const getKeys = async (): Promise<
  [Error | null, APIKeyWithDecrypt[] | null]
> => {
  try {
    const session = await checkAuth();
    if (!session) return [new Error("Not Authenticated"), null];

    const data = await prisma.apiKey.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        expireAt: "desc",
      },
    });

    const keysWithDecryption = data.map((encryptedKey) => {
      return {
        ...encryptedKey,
        decryptedKey: decryptAPIKey(encryptedKey.encryptedKey),
      };
    });

    return [null, keysWithDecryption];
  } catch (error) {
    return [error instanceof Error ? error : new Error(String(error)), null];
  }
};

export const getKey = async (
  id: string
): Promise<[Error | null, apiKey | null]> => {
  try {
    const session = await checkAuth();
    if (!session) return [new Error("Not Authenticated"), null];

    const data = await prisma.apiKey.findUnique({
      where: {
        id: id,
        userId: session.user.id,
      },
    });

    return [null, data];
  } catch (error) {
    return [error instanceof Error ? error : new Error(String(error)), null];
  }
};

export const changeAPIKeyName = async (config: {
  name: string;
  id: string;
}): Promise<[Error | null, apiKey | null]> => {
  try {
    const data = await prisma.apiKey.update({
      where: {
        id: config.id,
      },
      data: {
        name: config.name,
      },
    });

    return [null, data];
  } catch (error) {
    return [error instanceof Error ? error : new Error(String(error)), null];
  }
};

export const deleteAPIKey = async (
  id: string
): Promise<[Error | null, apiKey | null]> => {
  try {
    const data = await prisma.apiKey.delete({
      where: {
        id: id,
      },
    });

    return [null, data];
  } catch (error) {
    return [error instanceof Error ? error : new Error(String(error)), null];
  }
};

export const getKeyFromAPIKey = async (
  rawKey: string
): Promise<[Error | null, apiKey | null]> => {
  try {
    const hashedKey = hashAPIKey(rawKey);
    const data = await prisma.apiKey.findUnique({
      where: {
        hashedKey: hashedKey,
      },
    });

    return [null, data];
  } catch (error) {
    return [error instanceof Error ? error : new Error(String(error)), null];
  }
};
