"use client";

import BanUserDialog from "@/components/custom/admin/ban-user-dialog/ban-user.dialog";
import { ActionsMenuChildrenProps } from "@/components/custom/admin/users/all-users-table/types";
import SelectRoleMenu from "@/components/custom/admin/users/select-role-menu/select-role-menu";
import UserDetailsDialog from "@/components/custom/admin/users/user-details-dialog/user-detail-dialog";
import CopyText from "@/components/custom/general-website/copy-text";
import { Spinner } from "@/components/minimal-tiptap/components/spinner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Skeleton } from "@/components/ui/skeleton";
import useUnbanUser from "@/hooks/custom/use-unban-user";
import canManage from "@/utils/can-manage";
import { Copy, Eye, Lock, MoreHorizontal, Unlock } from "lucide-react";
import { useState } from "react";

const DrawerActions = ({ user, activeUserRole }: ActionsMenuChildrenProps) => {
  const [loading, setLoading] = useState(false);
  const [banDialogOpen, setBanDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const { mutateAsync } = useUnbanUser();

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

  // const siteRoles: Role[] = [
  //   "Currator",
  //   "Moderator",
  //   "Administrator",
  //   "Developer",
  // ];
  return (
    <>
      <Drawer>
        <DrawerTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DrawerTrigger>
        <DrawerContent
          className="max-h-[75vh] overflow-hidden"
          style={{
            maxHeight: "75vh",
            WebkitOverflowScrolling: "touch",
          }}
        >
          <DrawerHeader>
            <DrawerTitle className="text-center">Actions</DrawerTitle>
            <DrawerDescription className="text-center">
              {user.name}
            </DrawerDescription>
          </DrawerHeader>
          <div
            className="flex flex-col gap-4 p-4 flex-1 overflow-y-scroll"
            style={{
              WebkitOverflowScrolling: "touch",
            }}
          >
            <div className="p-4 border rounded-lg mx-4 flex gap-4 items-center">
              <Avatar>
                <AvatarFallback>
                  <Skeleton className="w-[40px] h-[40px]" />
                </AvatarFallback>
                <AvatarImage src={user.image} />
              </Avatar>
              <p className="text-muted-foreground">{user.name}</p>
            </div>
            <div className="flex flex-col gap-4 p-4">
              <Card>
                <CardHeader>
                  <CardTitle>Clan</CardTitle>
                  <CardDescription>
                    Current user is: {user.name}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-4">
                    <CopyText textToCopy={user.id}>
                      <Button variant="outline">
                        <Copy />
                        Copy user ID
                      </Button>
                    </CopyText>
                    {/* <Button variant="outline">
                      <Link
                        href={`/clan/${clan.id}`}
                        className="flex items-center gap-2 justify-center"
                      >
                        <SquareArrowOutUpRight />
                        Open Clan
                      </Link>
                    </Button> */}

                    {/* Ban button */}
                    {user!.banned === false && canManageUser ? (
                      // <BanUserForm
                      //   clan={clan!}
                      //   setOpenCallback={() => setLoading(false)}
                      // />
                      <Button
                        variant="destructive"
                        onClick={() => setBanDialogOpen(true)}
                      >
                        <Lock />
                        Ban User
                      </Button>
                    ) : null}

                    {/* Unban button */}
                    {user!.banned && (
                      <Button
                        onClick={unban}
                        variant="destructive"
                        disabled={unbanning}
                      >
                        {unbanning && <Spinner />}
                        <Unlock />
                        Unban User
                      </Button>
                    )}
                    <Button onClick={() => setDetailsDialogOpen(true)}>
                      <Eye />
                      View User Details
                    </Button>
                    <SelectRoleMenu
                      user={user}
                      activeUserRole={activeUserRole}
                      type="select"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </DrawerContent>

        <BanUserDialog
          open={banDialogOpen}
          setOpen={setBanDialogOpen}
          user={user}
        />

        <UserDetailsDialog
          open={detailsDialogOpen}
          setOpen={setDetailsDialogOpen}
        />
      </Drawer>
    </>
  );
};

export default DrawerActions;
