"use client";

import { ActionsMenuChildrenProps } from "@/components/custom/clan/admin-members-table/types";
import SelectClanRoleSelectionMenu from "@/components/custom/clan/members/select-clan-role-selection-menu";
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
import {
  AlertCircle,
  ArrowBigRight,
  BotOff,
  Copy,
  Lock,
  MoreHorizontal,
  Unlock,
} from "lucide-react";

const DrawerActions = ({
  member,
  isSelf,
  canBan,
  handleUnbanMutation,
  setBanDialog,
  setReportDialog,
  clanId,
  viewingUserRole,
  loading,
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
              {member.user.name}
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
                <AvatarImage src={member.user.image} />
              </Avatar>
              <p className="text-muted-foreground">{member.user.name}</p>
            </div>
            <div className="flex flex-col gap-4 p-4">
              <Card>
                <CardHeader>
                  <CardTitle>User</CardTitle>
                  <CardDescription>
                    Current user is: {member.user.name}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-4">
                    <CopyText textToCopy={member.user.id}>
                      <Button variant="outline">
                        <Copy />
                        Copy user ID
                      </Button>
                    </CopyText>

                    {/* Report User */}
                    {!isSelf && (
                      <Button onClick={() => setReportDialog(true)}>
                        <AlertCircle /> Report User
                      </Button>
                    )}

                    {/* Ban/Unban Actions */}
                    {canBan && isBannable && member.banned === true && (
                      <Button
                        onClick={handleUnbanMutation}
                        variant="secondary"
                        disabled={loading}
                      >
                        {loading && <Spinner />}
                        <Unlock />
                        Unban Member
                      </Button>
                    )}
                    {canBan && isBannable && member.banned === false && (
                      <Button
                        onClick={() => {
                          setBanDialog(true);
                        }}
                        variant="destructive"
                        disabled={loading}
                      >
                        {loading && <Spinner />}
                        <Lock />
                        Ban User
                      </Button>
                    )}

                    {/* Role Selection Menu */}
                    {!member.banned && member.role !== "Creator" && !isSelf && (
                      <>
                        <p className="text-muted-foreground text-xs">
                          User Clan Role
                        </p>
                        <SelectClanRoleSelectionMenu
                          clanId={clanId}
                          member={member}
                        />
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Clan Actions */}
              {!isSelf && (canKick || canTransferOwnership) && (
                <Card>
                  <CardHeader>
                    <CardTitle>Clan</CardTitle>
                    <CardDescription className="sr-only">
                      Clan Actions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col gap-4">
                      {canTransferOwnership && (
                        <Button
                          variant="destructive"
                          onClick={() => setTransferOwnershipDialog(true)}
                        >
                          <ArrowBigRight />
                          Transfer ownership to member
                        </Button>
                      )}
                      {canKick && (
                        <Button onClick={kickMember} disabled={loading}>
                          <BotOff />
                          Kick from Clan
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default DrawerActions;
