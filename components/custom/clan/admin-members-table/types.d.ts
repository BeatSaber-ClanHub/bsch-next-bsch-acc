import { EnrichedClanMember } from "@/data-access/member";
export type ActionsMenuChildrenProps = {
  member: EnrichedClanMember;
  isSelf: boolean;
  canBan: boolean;
  handleBanMutation: (data: z.infer<typeof banFromClanSchema>) => Promise<void>;
  handleUnbanMutation: () => Promise<void>;
  setBanDialog: Dispatch<SetStateAction<boolean>>;
  banDialog: boolean;
  setReportDialog: Dispatch<SetStateAction<boolean>>;
  setTransferOwnershipDialog: Dispatch<SetStateAction<boolean>>;
  reportDialog: boolean;
  clanId: string;
  viewingUserRole: ClanStaffRole;
  loading: boolean;
  kickMember: () => Promise<void>;
};

export interface BanRequest {
  clanId: string;
  memberId: string;
  userId: string;
  justification: string;
  onSuccess?: (props?: unknown) => void;
}

export type BanMutation = (props: BanRequest) => void;

export interface UnbanRequest {
  userId: string;
  clanId: string;
  memberId: string;
}

export interface KickRequest {
  userId: string;
  clanId: string;
  onSuccess?: (props?: unknown) => void;
}

export type UnbanMutation = (props: UnbanRequest) => void;

export type KickMutation = (props: KickRequest) => void;
