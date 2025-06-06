import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.AUTH_SERVER_BASE_URL, // the base url of your auth server
});
