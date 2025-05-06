import clanSchema from "@/app/validation-schemas/clan/clanSchema";
import {
  ApplicationStatus,
  Clan as PrismaClan,
  User,
  Visibility,
} from "@/prisma/generated/prisma/client";
import { z } from "zod";
// Clan type
export type Clan = z.infer<typeof _client_createClanSchema>;

// Application status
// export type ApplicationStatus = z.infer<
//   typeof clanSchema.shape.application_status
// >[number];

// Visibility options
// export type VisibilityOptions = z.infer<
//   typeof clanSchema.shape.visibility
// >[number];

// Helper type for NewClanOptions
export type NewClan = Pick<
  PrismaClan,
  | "clan_name"
  | "clan_tag"
  | "clan_specialties"
  | "banner_url"
  | "clan_owner"
  | "description"
  | "discord_invite_link"
  | "application_status"
  | "logo_url"
  | "clan_short_description"
>;

// New Clan options
export type NewClanOptions = Omit<
  NewClan,
  | "banner_url"
  | "description"
  | "application_status"
  | "logo_url"
  | "visibility"
> & {
  banner_url?: string;
  description?: string | undefined;
  application_status?: ApplicationStatus;
  logo_url?: string;
  visibility?: Visibility;
};
// Create a type for the various clan specialties. Defined in the schema and infered here
export type ClanSpecialties = z.infer<
  typeof _client_createClanSchema.shape.clan_specialties
>[number];

export const ValidClanSpecialties: ClanSpecialties[] = [
  "Acc",
  "Challenge",
  "Everything",
  "Ranked",
  "Speed",
];
// For API resposne
export interface ClanError {
  error: string;
  message: string;
}

// API response
export interface ClanResponse {
  items: PrismaClan[];
  error?: ClanError;
}

export interface IndividualClanResponse {
  data: PrismaClan;
  error?: ClanError;
}

// Omit the keys that do not need to be checked on the client
export const _client_createClanSchema = clanSchema.omit({
  clan_owner: true,
  logo_url: true,
  banner_url: true,
  description: true,
  application_status: true,
  visibility: true,
});

// Color mappings for clan specialties
export const colorClasses: Record<ClanSpecialties, string> = {
  Speed: "bg-sky-400 border-sky-400",
  Acc: "bg-emerald-400 border-emerald-400",
  Challenge: "bg-rose-400 border-rose-400",
  Ranked: "bg-amber-400 border-amber-400",
  Everything: "bg-violet-400 border-violet-400",
};

// All sort filters
export type OrderByFilters =
  | "createdAt"
  | "updatedAt"
  | "application_status"
  | "clan_name"
  | "clan_owner"
  | "clan_specialties"
  | "clan_tag";

export const allowedOrderByValues: OrderByFilters[] = [
  "createdAt",
  "updatedAt",
  "application_status",
  "clan_name",
  "clan_owner",
  "clan_specialties",
  "clan_tag",
];

export const allowedVisibilityOptions: Visibility[] = ["Hidden", "Visible"];

export interface ClanWithUser extends PrismaClan {
  user: Pick<
    User,
    "banned" | "createdAt" | "id" | "image" | "name" | "updatedAt"
  >;
}
