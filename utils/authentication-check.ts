import { APIResponse } from "@/app/api/types/core/api";
import { Auth, checkAuth } from "@/utils/check-auth";
import isBanned from "@/utils/is-banned";
import { Role } from "@/prisma/generated/prisma/client";
import { NextResponse } from "next/server";
import getRole from "./get-role";

export type AuthWithRole = {
  role: Role | null;
  session: Auth | null;
};

interface Config {
  bypassBanCheck?: boolean;
  bypassAuthCheck?: boolean;
}

// This might seem really stupid to make the auth checks optional but not all endpoints REQUIRE authentication. Its optional on some but to keep stuff located in one file, this is how we're doing it.
async function authenticationCheck(
  config?: Config
): Promise<NextResponse | AuthWithRole> {
  // if auth is to be checked
  let session = null;

  if (!config?.bypassAuthCheck) {
    session = await checkAuth();
    if (!session || !session.user) {
      return NextResponse.json(
        {
          error: "NOT_AUTHENTICATED",
          message: "Not authenticated!",
        } as APIResponse,
        { status: 401 }
      );
    }
  } else {
    // Still check auth data, but don't return error
    session = await checkAuth();
  }

  // if ban is to be checked
  if (!config?.bypassBanCheck && session !== null) {
    const { banned } = await isBanned(session);
    if (banned) {
      return NextResponse.json(
        {
          error: "ACCOUNT_BANNED",
          message: "This account has been banned!",
        } as APIResponse,
        { status: 403 }
      );
    }
  }
  const { role } = await getRole();

  return {
    role: role,
    session: session,
  };
}

export function isNextResponse(value: unknown): value is NextResponse {
  return value instanceof NextResponse;
}

export default authenticationCheck;
