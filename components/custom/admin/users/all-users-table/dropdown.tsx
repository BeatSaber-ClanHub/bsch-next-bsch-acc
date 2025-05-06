"use client";

import BanUserDialog from "@/components/custom/admin/ban-user-dialog/ban-user.dialog";
import { ActionsMenuChildrenProps } from "@/components/custom/admin/users/all-users-table/types";
import SelectRoleMenu from "@/components/custom/admin/users/select-role-menu/select-role-menu";
import UserDetailsDialog from "@/components/custom/admin/users/user-details-dialog/user-detail-dialog";
import CopyText from "@/components/custom/general-website/copy-text";
import { Spinner } from "@/components/minimal-tiptap/components/spinner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import useUnbanUser from "@/hooks/custom/use-unban-user";
import canManage from "@/utils/can-manage";
import { Copy, Eye, Lock, MoreHorizontal, Unlock } from "lucide-react";
import { useState } from "react";

const Dropdown = ({ user, activeUserRole }: ActionsMenuChildrenProps) => {
  const { mutateAsync } = useUnbanUser();
  const [loading, setLoading] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [banDialogOpen, setBanDialogOpen] = useState(false);

  const userRole = user.staff?.role || "User";
  const canManageUser = canManage({
    activeUserRole: activeUserRole,
    otherUserRole: userRole,
  });

  const [unbanning, setUnbanning] = useState(false);
  async function unban() {
    try {
      setUnbanning(true);
      await mutateAsync({ userId: user.id });
      setUnbanning(false);
    } catch (error) {
      setUnbanning(false);
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <CopyText textToCopy={user.id}>
            <DropdownMenuItem>
              <Copy />
              Copy user ID
            </DropdownMenuItem>
          </CopyText>
          {/* <Link href={`/clan/${clan.id}`} target="_blank">
          <DropdownMenuItem>
            <SquareArrowOutUpRight />
            Open Clan
          </DropdownMenuItem>
        </Link> */}
          {user!.banned === false && canManageUser ? (
            // <BanClanForm
            //   clan={clan!}
            //   setOpenCallback={() => setLoading(false)}
            //   dropdownMenuItem={
            //     <Button
            //       className="text-red-500 w-full justify-start !p-2"
            //       variant="ghost"
            //       onSelect={(e) => e.stopPropagation()}
            //       disabled={loading}
            //     >
            //       {loading && <Spinner />} <Lock />
            //       Ban Clan
            //     </Button>
            //   }
            // />

            <DropdownMenuItem
              className="text-red-500"
              onClick={() => setBanDialogOpen(true)}
            >
              <Lock />
              Ban User
            </DropdownMenuItem>
          ) : null}
          {/* Unban button */}
          {user!.banned && (
            <DropdownMenuItem
              className="text-red-500"
              disabled={unbanning}
              onClick={unban}
            >
              {unbanning && <Spinner />}
              <Unlock />
              Unban User
            </DropdownMenuItem>
          )}

          <DropdownMenuItem onClick={(e) => setDetailsDialogOpen(true)}>
            <Eye />
            View User Details
          </DropdownMenuItem>
          <SelectRoleMenu
            user={user}
            activeUserRole={activeUserRole}
            type="dropdown"
          />
        </DropdownMenuContent>
      </DropdownMenu>

      <BanUserDialog
        open={banDialogOpen}
        setOpen={setBanDialogOpen}
        user={user}
      />

      <UserDetailsDialog
        open={detailsDialogOpen}
        setOpen={setDetailsDialogOpen}
      />
    </>
  );
};

export default Dropdown;
