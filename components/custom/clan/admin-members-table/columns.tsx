"use client";

import banFromClanSchema from "@/app/validation-schemas/ban/ban-from-clan";
import DrawerActions from "@/components/custom/clan/admin-members-table/drawer-actions";
import Dropdown from "@/components/custom/clan/admin-members-table/dropdown";
import {
  BanMutation,
  KickMutation,
  UnbanMutation,
} from "@/components/custom/clan/admin-members-table/types";
import BanUserFromClanDialog from "@/components/custom/clan/members/ban-user-from-clan-dialog";
import TransferOwnershipDialog from "@/components/custom/clan/transfer-ownership-dialog";
import ReportUserDialog from "@/components/custom/report-users-dialog/report-users-dialog";
import { Spinner } from "@/components/minimal-tiptap/components/spinner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EnrichedClanMember } from "@/data-access/member";
import { useIsMobile } from "@/hooks/use-mobile";
import { ClanStaffRole, User } from "@/prisma/generated/prisma/client";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { useState } from "react";
import { z } from "zod";

export const columns: ColumnDef<EnrichedClanMember>[] = [
  {
    accessorKey: "user",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Username
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    filterFn: (row, columnId, filterValue) => {
      const user = row.original.user;
      const name = user?.name ?? "";
      return name.toLowerCase().includes(filterValue.toLowerCase());
    },
    cell: ({ row }) => {
      const user = row.original;
      const image = user.user.image;
      const name = user.user.name;

      return (
        <div className="flex items-center gap-4">
          <Avatar>
            <AvatarFallback>
              <Spinner />
            </AvatarFallback>
            <AvatarImage src={image} />
          </Avatar>
          <p>{name}</p>
        </div>
      );
    },
  },
  {
    accessorKey: "role",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Role
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "banned",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Banned
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const user = row.original;

      return (
        <Badge variant={user.banned === true ? "destructive" : "default"}>
          {user.banned === true ? "Banned" : "Not banned"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Joined
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const date = row.original.createdAt;
      const formattedDate = new Date(date).toDateString();
      return <p>{formattedDate}</p>;
    },
  },
  {
    id: "actions",
    cell: ({ row, table }) => {
      const user = row.original as EnrichedClanMember & {
        role: ClanStaffRole | "Member";
      };
      const viewingUserRole = (
        table.options.meta as { viewingUserRole: ClanStaffRole }
      )?.viewingUserRole;
      const viewingUser = (
        table.options.meta as {
          viewingUser: Pick<User, "id" | "image" | "name">;
        }
      )?.viewingUser;
      const isSelf = user.user.id === viewingUser.id;

      const banMutation = (table.options.meta as { banMutation: BanMutation })
        ?.banMutation;
      const unbanMutation = (
        table.options.meta as { unbanMutation: UnbanMutation }
      )?.unbanMutation;
      const kickMemberMutation = (
        table.options.meta as { kickMemberMutation: KickMutation }
      )?.kickMemberMutation;

      const clanId = (table.options.meta as { clanId: string })?.clanId;
      let canBan = false;

      if (viewingUserRole === "Creator") {
        // Creator can ban anyone
        canBan = true;
      } else if (viewingUserRole === "Administrator") {
        // Admin can ban Moderators or Members, but not other Admins or Creator
        if (user.role === "Moderator" || user.role === "Member") {
          canBan = true;
        } else {
          canBan = false;
        }
      } else {
        // Anyone else (including Moderators) cannot ban Admins or the Creator
        canBan = false;
      }

      return (
        <ActionsMenu
          canBan={canBan}
          isSelf={isSelf}
          member={user}
          banMutation={banMutation}
          unbanMutation={unbanMutation}
          clanId={clanId}
          viewingUserRole={viewingUserRole}
          viewingUser={viewingUser}
          kickMemberMutation={kickMemberMutation}
        />
      );
    },
  },
];

const ActionsMenu = ({
  member,
  isSelf,
  canBan,
  banMutation,
  unbanMutation,
  clanId,
  viewingUserRole,
  viewingUser,
  kickMemberMutation,
}: {
  member: EnrichedClanMember;
  isSelf: boolean;
  canBan: boolean;
  unbanMutation: UnbanMutation;
  banMutation: BanMutation;
  kickMemberMutation: KickMutation;
  clanId: string;
  viewingUserRole: ClanStaffRole;
  viewingUser: Pick<User, "id" | "image" | "name">;
}) => {
  const [reportDialog, setReportDialog] = useState(false);
  const [banDialog, setBanDialog] = useState(false);
  const [transferOwnershipDialog, setTransferOwnershipDialog] = useState(false);
  const [loading, setLoading] = useState(false);

  const isMobile = useIsMobile();

  const handleBanUser = async (data: z.infer<typeof banFromClanSchema>) => {
    try {
      setLoading(true);
      await banMutation({
        justification: data.justification,
        userId: member.user.id,
        memberId: member.id,
        clanId: clanId,
        onSuccess: () => setBanDialog(false),
      });
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  const handleUnbanUser = async () => {
    try {
      setLoading(true);
      await unbanMutation({
        userId: member.user.id,
        clanId: clanId,
        memberId: member.id,
      });
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  const kickMember = async () => {
    try {
      setLoading(true);
      await kickMemberMutation({
        userId: member.user.id,
        clanId: clanId,
        // onSuccess: () => setBanDialog(false),
      });
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  return (
    <>
      {isMobile ? (
        <DrawerActions
          canBan={canBan}
          isSelf={isSelf}
          member={member}
          handleBanMutation={handleBanUser}
          handleUnbanMutation={handleUnbanUser}
          setBanDialog={setBanDialog}
          setReportDialog={setReportDialog}
          reportDialog={reportDialog}
          banDialog={banDialog}
          clanId={clanId}
          viewingUserRole={viewingUserRole}
          loading={loading}
          setTransferOwnershipDialog={setTransferOwnershipDialog}
          kickMember={kickMember}
        />
      ) : (
        <Dropdown
          canBan={canBan}
          isSelf={isSelf}
          member={member}
          handleBanMutation={handleBanUser}
          handleUnbanMutation={handleUnbanUser}
          setBanDialog={setBanDialog}
          setReportDialog={setReportDialog}
          reportDialog={reportDialog}
          banDialog={banDialog}
          clanId={clanId}
          viewingUserRole={viewingUserRole}
          loading={loading}
          setTransferOwnershipDialog={setTransferOwnershipDialog}
          kickMember={kickMember}
        />
      )}

      <ReportUserDialog
        reportDialog={reportDialog}
        setReportDialog={setReportDialog}
        userId={member.user.id}
      />

      <BanUserFromClanDialog
        setBanDialog={setBanDialog}
        banDialog={banDialog}
        handleBanMutation={handleBanUser}
      />

      <TransferOwnershipDialog
        open={transferOwnershipDialog}
        setOpen={setTransferOwnershipDialog}
        currentOwner={viewingUser}
        newOwner={member.user}
        clanId={clanId}
      />
    </>
  );
};
