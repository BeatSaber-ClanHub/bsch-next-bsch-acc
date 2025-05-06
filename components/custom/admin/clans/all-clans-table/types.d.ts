import { ClanWithClanOwnerInfoAndBasicData } from "@/data-access/clan";
import { Role } from "@/prisma/generated/prisma/client";
export type ActionsMenuChildrenProps = {
  clan: ClanWithClanOwnerInfoAndBasicData;
  verifyClan: (e: React.MouseEvent<HTMLDivElement | HTMLButtonElement>) => void;
  unverifyClan: (
    e: React.MouseEvent<HTMLDivElement | HTMLButtonElement>
  ) => void;
  verifyLoading: boolean;
  unverifyLoading: boolean;
  role: Role;
};
