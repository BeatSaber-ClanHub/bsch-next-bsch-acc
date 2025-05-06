"use client";

import { ActionsMenuChildrenProps } from "@/components/custom/clan/admin-members-table/types";
import SelectClanRoleSelectionMenu from "@/components/custom/clan/members/select-clan-role-selection-menu";
import CopyText from "@/components/custom/general-website/copy-text";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertCircle,
  ArrowBigRight,
  BotOff,
  Copy,
  Lock,
  MoreHorizontal,
  Unlock,
} from "lucide-react";

const Dropdown = ({
  member,
  isSelf,
  canBan,
  handleUnbanMutation,
  setBanDialog,
  setReportDialog,
  clanId,
  loading,
  viewingUserRole,
  setTransferOwnershipDialog,
  kickMember,
}: ActionsMenuChildrenProps) => {
  const isAdmin = viewingUserRole === "Administrator";
  const isCreator = viewingUserRole === "Creator";
  const isBannable = member.role !== "Creator";
  const canTransferOwnership = isCreator && !member.banned;
  let canKick = false;
  if (isCreator) canKick = true;
  else if (isAdmin && !["Administrator", "Creator"].includes(member?.role))
    canKick = true;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <CopyText textToCopy={member.user.id}>
          <DropdownMenuItem>
            <Copy />
            Copy user ID
          </DropdownMenuItem>
        </CopyText>

        {!isSelf && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>User</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => setReportDialog(true)}>
              <AlertCircle />
              Report User
            </DropdownMenuItem>

            {/* Banning/Unbanning */}
            {canBan && isBannable && member.banned === true && (
              <DropdownMenuItem
                onClick={handleUnbanMutation}
                disabled={loading}
              >
                <Unlock />
                Unban Member
              </DropdownMenuItem>
            )}
            {canBan && isBannable && member.banned === false && (
              <DropdownMenuItem
                onClick={() => setBanDialog(true)}
                className="text-red-500"
                disabled={loading}
              >
                <Lock />
                Ban User
              </DropdownMenuItem>
            )}

            {/* Role Selection Menu */}
            {!member.banned && !isSelf && canKick && (
              <SelectClanRoleSelectionMenu
                clanId={clanId}
                member={member}
                type="dropdown"
              />
            )}

            {/* Admin/Creator Specific Actions */}
            {canKick && !member.banned ? (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Clan</DropdownMenuLabel>
                <DropdownMenuItem
                  className="text-yellow-500"
                  onClick={kickMember}
                  disabled={loading}
                >
                  <BotOff /> Kick from Clan
                </DropdownMenuItem>
              </>
            ) : null}
            {canTransferOwnership && (
              <DropdownMenuItem
                className="text-red-500"
                onClick={() => setTransferOwnershipDialog(true)}
              >
                <ArrowBigRight /> Transfer Ownership
              </DropdownMenuItem>
            )}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default Dropdown;
