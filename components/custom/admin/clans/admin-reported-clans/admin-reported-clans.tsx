"use client";
import { APIResponse } from "@/app/api/types/core/api";
import BanClanForm from "@/components/custom/admin/ban-clan-form/ban-clan-form";
import {
  TableLoading,
  TableRowLoading,
} from "@/components/custom/admin/clans/admin-clan-table-loading";
import ViewReportDialog from "@/components/custom/admin/clans/admin-reported-clans/admin-view-report-dialog";
import DismissReportButton from "@/components/custom/admin/clans/admin-reported-clans/dismiss-report-button";
import { UserInfoPopover } from "@/components/custom/admin/clans/admin-user-info-popover";
import CopyText from "@/components/custom/general-website/copy-text";
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
import { EnrichedClanReport } from "@/data-access/report";
import { useIsMobile } from "@/hooks/use-mobile";
import { useInfiniteQuery } from "@tanstack/react-query";
import {
  AlertCircle,
  CircleX,
  Copy,
  Ellipsis,
  Eye,
  Lock,
  RefreshCw,
  SquareArrowUpRight,
} from "lucide-react";
import Link from "next/link";
import { Fragment, SetStateAction, useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";

const ReportedClansData = () => {
  const { ref, inView } = useInView();
  const [hasNextPage, setHasNextPage] = useState(true);
  const [loading, setLoading] = useState("");
  const isMobile = useIsMobile();

  const fetchAppeals = async ({
    pageParam,
  }: {
    pageParam: number;
  }): Promise<APIResponse<EnrichedClanReport>> => {
    const res = await fetch(`/api/clans/reported/?offset=${pageParam}`);
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
    queryKey: ["clan_reported"],
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
          Something went wrong and we failed to retrieve reported clans.
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
        <p className="text-sm text-muted-foreground">No Reports</p>
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
          <TableCaption>List of all reported clans.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Name</TableHead>
              <TableHead>Tag</TableHead>
              <TableHead>Reported At</TableHead>
              <TableHead>Resolved</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="overflow-y-auto">
            {data.pages.map((page) => {
              return (
                <Fragment key={page.metadata?.offset}>
                  {page.items?.map((report) => (
                    <TableRow
                      key={report.id}
                      className={`${
                        loading === report.id ? "animate-pulse" : ""
                      }`}
                    >
                      <TableCell>{report.clan!.clan_name}</TableCell>
                      <TableCell>{report.clan!.clan_tag}</TableCell>
                      <TableCell>
                        {new Date(report.createdAt).toDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge>{report.resolved.toString()}</Badge>
                      </TableCell>
                      <TableCell>
                        <UserInfoPopover user={report.clan!.user} />
                      </TableCell>
                      <TableCell>
                        {isMobile ? (
                          <ActionsDrawer
                            loading={loading}
                            report={report}
                            setLoading={setLoading}
                          />
                        ) : (
                          <ActionsDropdown
                            loading={loading}
                            setLoading={setLoading}
                            report={report}
                          />
                        )}
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

const ActionsDropdown = ({
  report,
  loading,
  setLoading,
}: {
  report: EnrichedClanReport;
  loading: string;
  setLoading: React.Dispatch<SetStateAction<string>>;
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild disabled={loading === report.id}>
        <Button variant={"ghost"}>
          <Ellipsis />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Report</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <CopyText textToCopy={report.id}>
          <DropdownMenuItem>
            <Copy />
            Copy report ID
          </DropdownMenuItem>
        </CopyText>
        <ViewReportDialog
          report={report}
          dropdownMenuItem={
            <Button
              className="w-full justify-start !p-2"
              variant="ghost"
              onSelect={(e) => e.stopPropagation()}
            >
              <Eye />
              View Report
            </Button>
          }
        />
        <DismissReportButton
          reportId={report.id}
          setLoading={setLoading}
          dropdownItem={true}
        />
        <DropdownMenuLabel>Clan</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Link
            href={`/clan/${report.clan!.id}`}
            target="_blank"
            className="flex gap-2 items-center w-full h-full"
          >
            <SquareArrowUpRight size={15} />
            Open Clan
          </Link>
        </DropdownMenuItem>
        {report.clan!.banned === false && (
          <BanClanForm
            clan={report.clan! as unknown as ClanWithClanOwnerInfoAndBasicData}
            dropdownMenuItem={
              <Button
                className="text-red-500 w-full justify-start !p-2"
                variant="ghost"
                onSelect={(e) => e.stopPropagation()}
              >
                <Lock />
                Ban Clan
              </Button>
            }
          />
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const ActionsDrawer = ({
  report,
  loading,
  setLoading,
}: {
  report: EnrichedClanReport;
  loading: string;
  setLoading: React.Dispatch<SetStateAction<string>>;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild disabled={loading === report.id}>
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
          <DrawerDescription>
            Make changes or view clan reports.
          </DrawerDescription>
        </DrawerHeader>
        <div
          className="flex flex-col gap-4 p-4 flex-1 overflow-y-scroll"
          style={{
            WebkitOverflowScrolling: "touch",
          }}
        >
          <Card className="flex flex-col gap-4 p-4">
            <CardHeader>
              <CardTitle>Report</CardTitle>
              <CardDescription>Actions for Report</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                <CopyText textToCopy={report.id}>
                  <Button variant="outline">
                    <Copy />
                    Copy report ID
                  </Button>
                </CopyText>
                <ViewReportDialog report={report} />
                <DismissReportButton
                  reportId={report.id}
                  setLoading={setLoading}
                />
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
                    href={`/clan/${report.clan!.id}`}
                    target="_blank"
                    className="flex gap-2 items-center w-full h-full"
                  >
                    <SquareArrowUpRight size={15} />
                    Open Clan
                  </Link>
                </Button>
                {report.clan!.banned === false && (
                  <BanClanForm
                    clan={
                      report.clan! as unknown as ClanWithClanOwnerInfoAndBasicData
                    }
                    setOpenCallback={setOpen}
                  />
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default ReportedClansData;
