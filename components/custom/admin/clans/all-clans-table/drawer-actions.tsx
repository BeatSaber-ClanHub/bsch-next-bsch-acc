"use client";

import BanClanForm from "@/components/custom/admin/ban-clan-form/ban-clan-form";
import { ActionsMenuChildrenProps } from "@/components/custom/admin/clans/all-clans-table/types";
import UnbanClanButton from "@/components/custom/clan/unban-clan-button";
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
  Check,
  Copy,
  MoreHorizontal,
  SquareArrowOutUpRight,
  X,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const DrawerActions = ({
  clan,
  unverifyClan,
  unverifyLoading,
  verifyClan,
  verifyLoading,
  role,
}: ActionsMenuChildrenProps) => {
  const [loading, setLoading] = useState(false);

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
              {clan.clan_name}
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
                <AvatarImage src={clan.user.image} />
              </Avatar>
              <p className="text-muted-foreground">{clan.user.name}</p>
            </div>
            <div className="flex flex-col gap-4 p-4">
              <Card>
                <CardHeader>
                  <CardTitle>Clan</CardTitle>
                  <CardDescription>
                    Current clan is: {clan.clan_name}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-4">
                    <CopyText textToCopy={clan.id}>
                      <Button variant="outline">
                        <Copy />
                        Copy clan ID
                      </Button>
                    </CopyText>
                    <Button variant="outline">
                      <Link
                        href={`/clan/${clan.id}`}
                        className="flex items-center gap-2 justify-center"
                      >
                        <SquareArrowOutUpRight />
                        Open Clan
                      </Link>
                    </Button>

                    {/* Ban button */}
                    {clan!.banned === false && role != "Currator" ? (
                      <BanClanForm
                        clan={clan!}
                        setOpenCallback={() => setLoading(false)}
                      />
                    ) : null}

                    {/* Unban button */}
                    {clan!.banned && role !== "Currator" ? (
                      <UnbanClanButton clan={clan} />
                    ) : null}

                    {/* Verify button */}
                    {clan.visibility === "Visible" &&
                    !clan.banned &&
                    clan.application_status !== "Approved" ? (
                      <Button onClick={verifyClan} disabled={verifyLoading}>
                        {verifyLoading && <Spinner />}
                        <Check /> Verify
                      </Button>
                    ) : null}

                    {/* Unerify button */}
                    {clan.application_status === "Approved" ? (
                      <Button onClick={unverifyClan} disabled={unverifyLoading}>
                        {unverifyLoading && <Spinner />}
                        <X /> Unverify
                      </Button>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default DrawerActions;
