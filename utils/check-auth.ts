import { getKeyFromAPIKey } from "@/data-access/api-key";
import { getUserById } from "@/data-access/user";
import { auth } from "@/lib/auth";
import { Session, User } from "better-auth";
import { headers } from "next/headers";

export interface Auth {
  user: User & { banned: boolean };
  session?: Session;
}
type AuthResponse = Auth | null;
/**
 *
 * @returns {Promise<AuthResponse>} Returns session and user object or null
 */
export const checkAuth = async (): Promise<AuthResponse> => {
  try {
    const requestHeaders = await headers(); // Get headers from the server-side request
    const key = requestHeaders.get("Authorization"); // Extr
    if (key) {
      const [keyError, keyData] = await getKeyFromAPIKey(key);
      if (keyError) return null;
      if (!keyData) return null;

      // make sure key is not expired
      if (keyData.expireAt !== null) {
        const expiresAt = new Date(keyData.expireAt).getTime();
        const currentDate = Date.now();

        if (currentDate > expiresAt) {
          return null;
        }
      }

      const [userError, user] = await getUserById(keyData.userId);

      if (userError) return null;

      if (!user) return null;

      return {
        user: {
          createdAt: user.createdAt,
          email: user.email,
          emailVerified: user.emailVerified,
          id: user.id,
          name: user.name,
          updatedAt: user.updatedAt,
          image: user.image,
          banned: user.banned,
        },
      };
    } else {
      const session = await auth.api.getSession({
        headers: await headers(),
      });

      if (!session) return session;

      const [userError, user] = await getUserById(session.user.id);
      if (userError) throw userError;

      if (!user) return null;

      return {
        session: session.session,
        user: {
          ...session.user,
          banned: user.banned,
        },
      };
    }
  } catch (error) {
    console.log(error);
    return null;
  }
};

// curl ^"http://localhost:3000/api/clans/joined?offset=0^" ^
//   -H ^"Accept: */*^" ^
//   -H ^"Accept-Language: en-US,en;q=0.9^" ^
//   -H ^"Connection: keep-alive^" ^
//   -b ^"better-auth.session_token=xb2s2EEuLAdqYcPnCMNsypwOOgUelsPO.Ayc^%^2FCoPkeoRJU42kmLOGgOU2s8EA^%^2FwVwHjI1h82QPO0^%^3D^" ^
//   -H ^"Referer: http://localhost:3000/dashboard^" ^
//   -H ^"Sec-Fetch-Dest: empty^" ^
//   -H ^"Sec-Fetch-Mode: cors^" ^
//   -H ^"Sec-Fetch-Site: same-origin^" ^
//   -H ^"User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36^" ^
//   -H ^"sec-ch-ua: ^\^"Chromium^\^";v=^\^"134^\^", ^\^"Not:A-Brand^\^";v=^\^"24^\^", ^\^"Google Chrome^\^";v=^\^"134^\^"^" ^
//   -H ^"sec-ch-ua-mobile: ?0^" ^
//   -H ^"sec-ch-ua-platform: ^\^"Windows^\^"^"
