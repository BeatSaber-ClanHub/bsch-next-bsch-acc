"use client";

import { APIResponse } from "@/app/api/types/core/api";
import { TableLoading } from "@/components/custom/clan/applications-table/table-loading";
import { TableRowLoading } from "@/components/custom/clan/applications-table/table-row-loading";
import { Spinner } from "@/components/minimal-tiptap/components/spinner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ClanJoinRequestWithUserData } from "@/data-access/clan-join-request";
import useUnblockJoinRequestUser from "@/hooks/custom/use-unblock-join-request-user";
import { keepPreviousData, useInfiniteQuery } from "@tanstack/react-query";
import { AlertCircle, CircleX, Unlock } from "lucide-react";
import { Fragment, useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";

const BlockedUsersTable = ({ clanId }: { clanId: string }) => {
  const { ref, inView } = useInView();
  const [hasNextPage, setHasNextPage] = useState(true);

  const fetchAppeals = async ({
    pageParam,
  }: {
    pageParam: number;
  }): Promise<APIResponse<ClanJoinRequestWithUserData>> => {
    const res = await fetch(
      `/api/clan/${clanId}/join/requests/blocked?offset=${pageParam}`
    );
    if (!res.ok) throw await res.json();
    return await res.json();
  };

  const { data, fetchNextPage, isFetchingNextPage, status, isFetching } =
    useInfiniteQuery({
      queryKey: ["clan_blocked_join_requests", clanId],
      queryFn: fetchAppeals,
      initialPageParam: 0,
      getNextPageParam: (lastPage) => {
        const nextOffset = lastPage.metadata!.offset + lastPage.metadata!.limit;
        return nextOffset < lastPage.metadata!.count ? nextOffset : undefined;
      },
      refetchOnWindowFocus: false,
      placeholderData: keepPreviousData,
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
          Something went wrong and we failed to retrieve join requests.
        </AlertDescription>
      </Alert>
    );
  }

  if (isFetching && !isFetchingNextPage) {
    return <TableLoading />;
  }

  if (!data || data?.pages[0].items!.length <= 0) {
    return (
      <div className="border rounded-lg p-4 flex flex-col items-center justify-center">
        <CircleX className="text-muted-foreground" />
        <p className="text-sm text-muted-foreground">No Blocked Users.</p>
      </div>
    );
  }
  return (
    <div>
      <div className="border rounded-lg p-4">
        <Table>
          <TableCaption>
            List of users banned from making join requests.
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">User</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Submitted At</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="overflow-y-auto">
            {data.pages.map((page) => {
              return (
                <Fragment key={page.metadata?.offset}>
                  {page.items?.map((joinRequest) => (
                    <TableRow key={joinRequest.id}>
                      <TableCell>
                        <div className="flex gap-2 items-center">
                          <Avatar>
                            <AvatarFallback>
                              <Skeleton className="w-[40px] h-[40px]" />
                            </AvatarFallback>
                            <AvatarImage src={joinRequest.user.image} />
                          </Avatar>
                          <p>{joinRequest.user.name}</p>
                        </div>
                      </TableCell>
                      <TableCell>{joinRequest.status}</TableCell>
                      <TableCell>
                        {new Date(joinRequest.createdAt).toDateString()}
                      </TableCell>
                      <TableCell>
                        <ActionsMenu
                          requestId={joinRequest.id}
                          clanId={clanId}
                        />
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
    </div>
  );
};

const ActionsMenu = ({
  requestId,
  clanId,
}: {
  requestId: string;
  clanId: string;
}) => {
  return (
    <div className="flex gap-2">
      <TooltipProvider>
        <Unblock requestId={requestId} clanId={clanId} />
      </TooltipProvider>
    </div>
  );
};

const Unblock = ({
  requestId,
  clanId,
}: {
  requestId: string;
  clanId: string;
}) => {
  const [loadingAccept, setLoadingAccept] = useState(false);

  const { mutateAsync: unblockJoinRequest } = useUnblockJoinRequestUser(clanId);

  async function acceptRequest() {
    setLoadingAccept(true);
    await unblockJoinRequest({
      clanId: clanId,
      onSuccess: () => setLoadingAccept(false),
      requestId: requestId,
    });
  }
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="outline"
          onClick={acceptRequest}
          disabled={loadingAccept}
        >
          {loadingAccept && <Spinner />}
          <Unlock className="text-green-500" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>Allow user to make join requests again.</p>
      </TooltipContent>
    </Tooltip>
  );
};

export default BlockedUsersTable;
