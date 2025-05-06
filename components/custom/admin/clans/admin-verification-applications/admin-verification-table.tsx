"use client";
import { APIResponse } from "@/app/api/types/core/api";
import {
  TableLoading,
  TableRowLoading,
} from "@/components/custom/admin/clans/admin-clan-table-loading";
import { UserInfoPopover } from "@/components/custom/admin/clans/admin-user-info-popover";
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
import { ClanVerificationApplicationWithUsersAndClan } from "@/data-access/clan-verification-application";
import { useIsMobile } from "@/hooks/use-mobile";
import { useInfiniteQuery } from "@tanstack/react-query";
import {
  AlertCircle,
  CircleX,
  Copy,
  Ellipsis,
  Info,
  RefreshCw,
  SquareArrowUpRight,
} from "lucide-react";
import Link from "next/link";
import React, { Fragment, SetStateAction, useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";

const ClanApplicationsTable = () => {
  const { ref, inView } = useInView();
  const [hasNextPage, setHasNextPage] = useState(true);
  const [loading, setLoading] = useState("");
  const isMobile = useIsMobile();

  const fetchVerificationApplications = async ({
    pageParam,
  }: {
    pageParam: number;
  }): Promise<APIResponse<ClanVerificationApplicationWithUsersAndClan>> => {
    const res = await fetch(`/api/clans/applications/?offset=${pageParam}`);
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
    queryKey: ["clan_applications"],
    queryFn: fetchVerificationApplications,
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
          Something went wrong and we failed to retrieve applications.
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
        <p className="text-sm text-muted-foreground">No Applications</p>
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
          <p className="text-lg">Verification Applications</p>
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
          <TableCaption>List of all verification applications.</TableCaption>
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
                  {page.items?.map((application) => {
                    return (
                      <TableRow
                        key={application.clan.id}
                        className={`${
                          loading === application.clan.id ? "animate-pulse" : ""
                        }`}
                      >
                        <TableCell>{application.clan.clan_name}</TableCell>
                        <TableCell>{application.clan.clan_tag}</TableCell>
                        <TableCell>
                          {new Date(application.clan.createdAt).toDateString()}
                        </TableCell>
                        <TableCell>
                          <Badge>{application.status}</Badge>
                        </TableCell>
                        <TableCell>
                          <UserInfoPopover user={application.clan.user} />
                        </TableCell>
                        <TableCell>
                          {isMobile ? (
                            <ActionsDrawer
                              clan={application.clan}
                              loading={loading}
                              setLoading={setLoading}
                            />
                          ) : (
                            <ActionsDropdown
                              clan={application.clan}
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
  clan,
  loading,
  setLoading,
}: {
  clan: ClanWithUser;
  loading: string;
  setLoading: React.Dispatch<SetStateAction<string>>;
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild disabled={loading === clan.id}>
        <Button variant={"ghost"}>
          <Ellipsis />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Clan</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <CopyText textToCopy={clan.id}>
          <DropdownMenuItem>
            <Copy />
            Copy clan ID
          </DropdownMenuItem>
        </CopyText>
        <DropdownMenuItem>
          <Link
            href={`/clan/${clan.id}`}
            target="_blank"
            className="flex gap-2 items-center w-full h-full"
          >
            <SquareArrowUpRight size={15} />
            Open Clan
          </Link>
        </DropdownMenuItem>
        <DropdownMenuLabel>Application</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Link
            href={`https://bsch.apidocumentation.com/guide/website-functions/verifying-a-clan#for-bsch-staff-guidelines-for-verifying-clans`}
            target="_blank"
            className="flex gap-2 items-center w-full h-full"
          >
            <Info size={15} />
            How to verify
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const ActionsDrawer = ({
  clan,
  loading,
  setLoading,
}: {
  clan: ClanWithUser;
  loading: string;
  setLoading: React.Dispatch<SetStateAction<string>>;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild disabled={loading === clan.id}>
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
          <DrawerDescription>Make changes to applications.</DrawerDescription>
        </DrawerHeader>
        <div
          className="flex flex-col gap-4 p-4 flex-1 overflow-y-scroll"
          style={{
            WebkitOverflowScrolling: "touch",
          }}
        >
          <Card className="flex flex-col gap-4 p-4">
            <CardHeader>
              <CardTitle>Clan</CardTitle>
              <CardDescription>Actions for Verification</CardDescription>
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
                    target="_blank"
                    className="flex gap-2 items-center w-full h-full justify-center"
                  >
                    <SquareArrowUpRight size={15} />
                    Open Clan
                  </Link>
                </Button>
                <Button>
                  <Link
                    href={`https://bsch.apidocumentation.com/guide/website-functions/verifying-a-clan#for-bsch-staff-guidelines-for-verifying-clans`}
                    target="_blank"
                    className="flex gap-2 items-center w-full h-full justify-center"
                  >
                    <Info size={15} />
                    How to verify
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default ClanApplicationsTable;
