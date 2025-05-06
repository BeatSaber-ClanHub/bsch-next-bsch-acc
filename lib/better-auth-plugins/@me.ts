import { APIResponse } from "@/app/api/types/core/api";
import { checkAuth } from "@/utils/check-auth";
import { createAuthEndpoint } from "better-auth/api";
import { BetterAuthPlugin } from "better-auth/types";

// This plugin exposes a /api/auth/@me endpoint which returns the user object from the current session.
export const currentUserEndpoint = () => {
  return {
    id: "@me",
    endpoints: {
      getCurrentUser: createAuthEndpoint(
        "/@me",
        {
          method: "GET",
        },
        async (ctx) => {
          try {
            const session = await checkAuth();
            if (!session) {
              return ctx.error("UNAUTHORIZED", {
                message: "Not authenticated!",
                error: "NOT_AUTHENTICATED",
              } as APIResponse);
            }
            return ctx.json(session.user);
          } catch (error) {
            console.log(error);
            return ctx.error("INTERNAL_SERVER_ERROR", {
              message: "There was an issue with authentication!",
              error: "INTERNAL_ERROR",
            } as APIResponse);
          }
        }
      ),
    },
  } satisfies BetterAuthPlugin;
};
