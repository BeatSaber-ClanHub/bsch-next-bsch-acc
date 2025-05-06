"use client";

import { APIResponse } from "@/app/api/types/core/api";
import allowAnotherApplicationSchema from "@/app/validation-schemas/join-request/allow-another-application";
import { TableLoading } from "@/components/custom/clan/applications-table/table-loading";
import { TableRowLoading } from "@/components/custom/clan/applications-table/table-row-loading";
import { Spinner } from "@/components/minimal-tiptap/components/spinner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
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
import useAcceptJoinRequest from "@/hooks/custom/use-accept-join-request";
import useRejectJoinRequest from "@/hooks/custom/use-reject-join-request";
import { zodResolver } from "@hookform/resolvers/zod";
import { keepPreviousData, useInfiniteQuery } from "@tanstack/react-query";
import { AlertCircle, Check, CircleX, X } from "lucide-react";
import { Fragment, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useInView } from "react-intersection-observer";
import { z } from "zod";

const ApplicationsTable = ({ clanId }: { clanId: string }) => {
  const { ref, inView } = useInView();
  const [hasNextPage, setHasNextPage] = useState(true);

  const fetchAppeals = async ({
    pageParam,
  }: {
    pageParam: number;
  }): Promise<APIResponse<ClanJoinRequestWithUserData>> => {
    const res = await fetch(
      `/api/clan/${clanId}/join/requests?offset=${pageParam}`
    );
    if (!res.ok) throw await res.json();
    return await res.json();
  };

  const { data, fetchNextPage, isFetchingNextPage, status, isFetching } =
    useInfiniteQuery({
      queryKey: ["clan_join_requests", clanId],
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
        <p className="text-sm text-muted-foreground">No Join Requests</p>
      </div>
    );
  }
  return (
    <div>
      <div className="border rounded-lg p-4">
        <Table>
          <TableCaption>List of pending join requests.</TableCaption>
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
        <AcceptButton requestId={requestId} clanId={clanId} />
        <RejectionDialog requestId={requestId} clanId={clanId} />
      </TooltipProvider>
    </div>
  );
};

const AcceptButton = ({
  requestId,
  clanId,
}: {
  requestId: string;
  clanId: string;
}) => {
  const [loadingAccept, setLoadingAccept] = useState(false);

  const { mutateAsync: acceptJoinRequest } = useAcceptJoinRequest(clanId);

  async function acceptRequest() {
    setLoadingAccept(true);
    await acceptJoinRequest({
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
          <Check className="text-green-500" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>Accept join request</p>
      </TooltipContent>
    </Tooltip>
  );
};

const RejectionDialog = ({
  requestId,
  clanId,
}: {
  requestId: string;
  clanId: string;
}) => {
  const [open, setOpen] = useState(false);
  const { mutateAsync: rejectApplicationAsync } = useRejectJoinRequest(clanId);
  const form = useForm<z.infer<typeof allowAnotherApplicationSchema>>({
    resolver: zodResolver(allowAnotherApplicationSchema),
    defaultValues: {
      allowAnotherApplication: true,
    },
  });

  async function rejectApplication(
    data: z.infer<typeof allowAnotherApplicationSchema>
  ) {
    await rejectApplicationAsync({
      allowAnotherApplication: data.allowAnotherApplication,
      clanId: clanId,
      onSuccess: () => setOpen(false),
      requestId: requestId,
    });
  }
  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" onClick={() => setOpen(true)}>
              <X className="text-red-500" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Reject join request</p>
          </TooltipContent>
        </Tooltip>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reject Join Request?</DialogTitle>
          <DialogDescription>
            Rejecting a join request allows you to prevent thus user from trying
            to join your clan again. Would you like to block this user from
            attempting to join this clan again?
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(rejectApplication)}
            className="w-full space-y-4"
          >
            <FormField
              control={form.control}
              name="allowAnotherApplication"
              render={({ field }) => (
                <FormItem className="flex flex-col gap-2 border rounded-lg p-4">
                  <div className="space-y-0.5">
                    <FormLabel>Allow Future Requests</FormLabel>
                    <FormDescription>
                      Setting to true (default) will allow this user to request
                      to join this clan again.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <div className="flex gap-4 w-full justify-end">
              <Button
                variant="outline"
                type="button"
                onClick={() => setOpen(false)}
              >
                Close
              </Button>
              <Button
                variant="destructive"
                disabled={form.formState.isSubmitting}
                type="submit"
              >
                {form.formState.isSubmitting && <Spinner />}Reject
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ApplicationsTable;
