import { Clan, ClanStaffRole } from "@/prisma/generated/prisma/client";
import { BanAppeal, apiKey } from "@/prisma/generated/prisma/client";

export type Response<T> = [Error | null, T[] | T | null];
export interface ClanWithMemberCount extends Clan {
  memberCount: number;
}

// interface ClanMemberWithoutUser {
//   name: string;
//   image: string;
//   id: string;
// }

// export interface ClanMember {
//   user: ClanMemberWithoutUser;
// }

export interface ClanMember {
  role: ClanStaffRole | "Member";
  name: string;
  image: string;
  banned: boolean;
  createdAt: Date;
  id: string;
  userId: string;
}

type UserPick = Pick<
  User,
  "banned" | "createdAt" | "id" | "image" | "name" | "updatedAt"
>;

export interface EnrichedBanAppeal extends BanAppeal {
  user: Omit<User, "email" | "emailVerified">;
  submittedBy: Omit<User, "email" | "emailVerified">;
  clan: Omit<Clan, "banner_file_key" | "description"> & {
    user: Omit<User, "email" | "emailVerified">;
  };
  ban: Ban & {
    user: Omit<User, "email" | "emailVerified">;
  };
}

export type APIKeyWithDecrypt = apiKey & { decryptedKey: string };
