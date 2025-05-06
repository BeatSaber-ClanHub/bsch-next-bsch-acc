"use client";
import { APIResponse } from "@/app/api/types/core/api";
import ViewBanAppealDialog from "@/components/custom/admin/clans/admin-ban-appeals/view-ban-appeal-dialog";
import {
  TableLoading,
  TableRowLoading,
} from "@/components/custom/admin/clans/admin-clan-table-loading";
import { UserInfoPopover } from "@/components/custom/admin/clans/admin-user-info-popover";
import AppealStatusBadge from "@/components/custom/appeal-status-badge/appeal-status-badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EnrichedBanAppeal } from "@/data-access/types/types";
import { useInfiniteQuery } from "@tanstack/react-query";
import { AlertCircle, CircleX, RefreshCw } from "lucide-react";
import { Fragment, useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";

const BanAppealsData = () => {
  const { ref, inView } = useInView();
  const [hasNextPage, setHasNextPage] = useState(true);

  const fetchAppeals = async ({
    pageParam,
  }: {
    pageParam: number;
  }): Promise<APIResponse<EnrichedBanAppeal>> => {
    const res = await fetch(`/api/clans/banned/appeals?offset=${pageParam}`);
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
    queryKey: ["clan_ban_appeals"],
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
          Something went wrong and we failed to retrieve appeals.
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
        <p className="text-sm text-muted-foreground">No Appeals</p>
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
          <p className="text-lg">Clan Reports</p>
          <p className="text-sm text-muted-foreground">User reported clans</p>
        </div>
        <Button variant="outline" onClick={() => refetch()}>
          <RefreshCw />
        </Button>
      </div>
      <div className="flex flex-col h-[calc(100%-60px)] items-center">
        <Table>
          <TableCaption>List of all ban appeals.</TableCaption>
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
                  {page.items?.map((appeal) => (
                    <TableRow key={appeal.id}>
                      <TableCell>{appeal.clan.clan_name}</TableCell>
                      <TableCell>{appeal.clan.clan_tag}</TableCell>
                      <TableCell>
                        {new Date(appeal.createdAt).toDateString()}
                      </TableCell>
                      <TableCell>
                        <AppealStatusBadge status={appeal.status} />
                      </TableCell>
                      <TableCell>
                        <UserInfoPopover user={appeal.clan.user} />
                      </TableCell>
                      <TableCell>
                        <ViewBanAppealDialog appeal={appeal} />
                      </TableCell>
                    </TableRow>
                  ))}
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

export default BanAppealsData;
