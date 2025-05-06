import { Clan } from "@/prisma/generated/prisma/client";

export type CreateClanServerSide = Omit<Clan, "">;
