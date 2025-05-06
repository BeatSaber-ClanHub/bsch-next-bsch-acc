import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { currentUserEndpoint } from "./better-auth-plugins/@me";
import prisma from "./prisma";
import { v4 } from "uuid";
import { getAccountsById } from "@/data-access/account";
import {
  getUserPlatformBanByDiscordId,
  updateUserIdForPlatformBan,
} from "@/data-access/user-ban";
import { banUserById } from "@/data-access/user";
export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  socialProviders: {
    discord: {
      clientId: process.env.DISCORD_CLIENT_ID as string,
      clientSecret: process.env.DISCORD_CLIENT_SECRET as string,
      redirectURI:
        process.env.AUTH_SERVER_BASE_URL + "/api/auth/callback/discord",
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user, ctx) => {
          return {
            data: {
              ...user,
              id: v4(),
            },
          };
        },
      },
    },
    account: {
      create: {
        after: async (account, ctx) => {
          // Because a user can have multiple accounts, we check over each one but in reality they only have a discord account
          // if the account is a discord account, check if their is some kind of existing ban for this account
          if (account.providerId === "discord") {
            const [err, banned] = await getUserPlatformBanByDiscordId(
              account.accountId
            );
            if (err) throw err;

            if (banned) {
              const [banUserErr, bannedUser] = await banUserById(
                account.userId
              );
              if (banUserErr) throw banUserErr;

              const [updateBanErr, updatedBanRecord] =
                await updateUserIdForPlatformBan({
                  banId: banned.id,
                  updatedUserId: account.userId,
                });
              if (updateBanErr) throw updateBanErr;
            }
          }
        },
      },
    },
  },
  plugins: [currentUserEndpoint()],
  trustedOrigins: ["172.16.42.31", "http://172.16.42.6:3000"],
});
