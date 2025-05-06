"use client";
import { APIResponse } from "@/app/api/types/core/api";
import ViewBanInfoDialog from "@/components/custom/admin/clans/admin-banned-clans/admin-view-ban-info-dialog";
import {
  TableLoading,
  TableRowLoading,
} from "@/components/custom/admin/clans/admin-clan-table-loading";
import { UserInfoPopover } from "@/components/custom/admin/clans/admin-user-info-popover";
import UnbanClanButton from "@/components/custom/clan/unban-clan-button";
import CopyText from "@/components/custom/general-website/copy-text";
import { ClanWithUser } from "@/components/types/clan-types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ClanWithClanOwnerInfoAndBasicData } from "@/data-access/clan";
import { EnrichedClanBan } from "@/data-access/clan-ban";
import { useIsMobile } from "@/hooks/use-mobile";
import { useInfiniteQuery } from "@tanstack/react-query";
import {
  AlertCircle,
  CircleX,
  Copy,
  Ellipsis,
  Eye,
  RefreshCw,
  SquareArrowUpRight,
} from "lucide-react";
import Link from "next/link";
import React, { Fragment, SetStateAction, useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";

const BannedClansData = () => {
  const { ref, inView } = useInView();
  const [hasNextPage, setHasNextPage] = useState(true);
  const [loading, setLoading] = useState("");
  const isMobile = useIsMobile();

  const fetchAppeals = async ({
    pageParam,
  }: {
    pageParam: number;
  }): Promise<APIResponse<EnrichedClanBan>> => {
    const res = await fetch(`/api/clans/banned/?offset=${pageParam}`);
    if (!res.ok) throw await res.json();
    return await res.json();
  };

  const {
    data,
    fetchNextPage,
    isFetchingNextPage,
    status,
    isFetching,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["clan_banned"],
    queryFn: fetchAppeals,
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      const nextOffset = lastPage.metadata!.offset + lastPage.metadata!.limit;
      return nextOffset < lastPage.metadata!.count ? nextOffset : undefined;
    },
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (data?.pages) {
      const lastPage = data.pages[data.pages.length - 1];
      setHasNextPage(lastPage.metadata?.pagination.next ?? false);
    }
  }, [data]);

  useEffect(() => {
    if (inView && hasNextPage && !isFetching && hasNextPage) {
      fetchNextPage();
    }
  }, [fetchNextPage, inView, hasNextPage, isFetching]);

  if (status === "error") {
    return (
      <Alert>
        <AlertCircle />
        <AlertTitle>There was an issue.</AlertTitle>
        <AlertDescription>
          Something went wrong and we failed to retrieve banned clans.
        </AlertDescription>
      </Alert>
    );
  }

  if (isFetching && !isFetchingNextPage) {
    return <TableLoading />;
  }

  if (!data || data?.pages[0].items!.length <= 0) {
    return (
      <div className="flex items-center flex-col gap-2 justify-center flex-1">
        <CircleX className="text-muted-foreground" />
        <p className="text-sm text-muted-foreground">No Bans</p>
        <Button onClick={() => refetch()}>
          <RefreshCw /> Refresh
        </Button>
      </div>
    );
  }
  return (
    <>
      <div className="flex items-center justify-between">
        <div className="h-[60px]">
          <p className="text-lg">Banned Clans</p>
          <p className="text-sm text-muted-foreground">
            Data is sorted by submission date
          </p>
        </div>
        <Button variant="outline" onClick={() => refetch()}>
          <RefreshCw />
        </Button>
      </div>
      <div className="flex flex-col h-[calc(100%-60px)] items-center">
        <Table>
          <TableCaption>List of all banned clans.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Name</TableHead>
              <TableHead>Tag</TableHead>
              <TableHead>Submitted At</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="overflow-y-auto">
            {data.pages.map((page) => {
              return (
                <Fragment key={page.metadata?.offset}>
                  {page.items?.map((bannedClan) => {
                    return (
                      <TableRow
                        key={bannedClan.id}
                        className={`${
                          loading === bannedClan.clanId ? "animate-pulse" : ""
                        }`}
                      >
                        <TableCell>{bannedClan.clan.clan_name}</TableCell>
                        <TableCell>{bannedClan.clan.clan_tag}</TableCell>
                        <TableCell>
                          {new Date(bannedClan.createdAt).toDateString()}
                        </TableCell>
                        <TableCell>
                          <Badge>{bannedClan.status}</Badge>
                        </TableCell>
                        <TableCell>
                          <UserInfoPopover user={bannedClan.clan.user} />
                        </TableCell>
                        <TableCell>
                          {isMobile ? (
                            <ActionsDrawer
                              bannedClan={bannedClan}
                              loading={loading}
                              setLoading={setLoading}
                            />
                          ) : (
                            <ActionsDropdown
                              bannedClan={bannedClan}
                              loading={loading}
                              setLoading={setLoading}
                            />
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </Fragment>
              );
            })}
            <TableRow>
              <TableCell colSpan={5} className="p-0">
                <div ref={ref} style={{ height: 0, visibility: "hidden" }} />
              </TableCell>
            </TableRow>
            {/* Loading spinner row */}
            {isFetchingNextPage && <TableRowLoading />}
          </TableBody>
        </Table>
      </div>
    </>
  );
};

const ActionsDropdown = ({
  bannedClan,
  loading,
  setLoading,
}: {
  bannedClan: EnrichedClanBan;
  loading: string;
  setLoading: React.Dispatch<SetStateAction<string>>;
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild disabled={loading === bannedClan.clanId}>
        <Button variant={"ghost"}>
          <Ellipsis />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Ban</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <CopyText textToCopy={bannedClan.id}>
          <DropdownMenuItem>
            <Copy />
            Copy ban ID
          </DropdownMenuItem>
        </CopyText>
        <ViewBanInfoDialog
          ban={bannedClan}
          dropdownMenuItem={
            <Button
              className="w-full justify-start !p-2"
              variant="ghost"
              onSelect={(e) => e.stopPropagation()}
            >
              <Eye />
              View Ban
            </Button>
          }
        />
        <DropdownMenuLabel>Clan</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Link
            href={`/clan/${bannedClan.clan.id}`}
            target="_blank"
            className="flex gap-2 items-center w-full h-full"
          >
            <SquareArrowUpRight size={15} />
            Open Clan
          </Link>
        </DropdownMenuItem>

        <UnbanClanButton
          clan={bannedClan.clan as unknown as ClanWithClanOwnerInfoAndBasicData}
          setParentLoading={setLoading}
          dropdownMenuItem={true}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const ActionsDrawer = ({
  bannedClan,
  loading,
  setLoading,
}: {
  bannedClan: EnrichedClanBan;
  loading: string;
  setLoading: React.Dispatch<SetStateAction<string>>;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild disabled={loading === bannedClan.clanId}>
        <Button variant={"ghost"}>
          <Ellipsis />
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
          <DrawerTitle>Actions</DrawerTitle>
          <DrawerDescription>Make changes or view bans.</DrawerDescription>
        </DrawerHeader>
        <div
          className="flex flex-col gap-4 p-4 flex-1 overflow-y-scroll"
          style={{
            WebkitOverflowScrolling: "touch",
          }}
        >
          <Card className="flex flex-col gap-4 p-4">
            <CardHeader>
              <CardTitle>Ban</CardTitle>
              <CardDescription>Actions for Ban</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                <CopyText textToCopy={bannedClan.id}>
                  <Button variant="outline">
                    <Copy />
                    Copy ban ID
                  </Button>
                </CopyText>
                <ViewBanInfoDialog ban={bannedClan} />
              </div>
            </CardContent>
          </Card>
          <Card className="flex flex-col gap-4 p-4">
            <CardHeader>
              <CardTitle>Clan</CardTitle>
              <CardDescription>Actions for Clan</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                <Button variant="outline">
                  <Link
                    href={`/clan/${bannedClan.clanId}`}
                    target="_blank"
                    className="flex gap-2 items-center w-full h-full justify-center"
                  >
                    <SquareArrowUpRight size={15} />
                    Open Clan
                  </Link>
                </Button>
                <UnbanClanButton
                  clan={
                    bannedClan.clan as unknown as ClanWithClanOwnerInfoAndBasicData
                  }
                  setParentLoading={setLoading}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default BannedClansData;
