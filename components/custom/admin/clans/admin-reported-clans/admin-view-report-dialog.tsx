"use client";
import BanForm from "@/components/custom/admin/ban-clan-form/ban-form";
import DismissReportButton from "@/components/custom/admin/clans/admin-reported-clans/dismiss-report-button";
import { Spinner } from "@/components/minimal-tiptap/components/spinner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { ClanWithClanOwnerInfoAndBasicData } from "@/data-access/clan";
import { EnrichedClanReport } from "@/data-access/report";
import { Ban, Eye, Flag, SquareArrowOutUpRight, User } from "lucide-react";
import Link from "next/link";
import { ReactNode, useState } from "react";

const ViewReportDialog = ({
  report,
  dropdownMenuItem = null,
}: {
  report: EnrichedClanReport;
  dropdownMenuItem?: ReactNode;
}) => {
  const [open, setOpen] = useState(false);
  const [showBanForm, setShowBanForm] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {dropdownMenuItem !== null ? (
          dropdownMenuItem
        ) : (
          <Button>
            <Eye />
            View Report
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:!w-[75vw] sm:!max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Report for {report.clan!.clan_name}</DialogTitle>
          <DialogDescription>
            Review the report details and take appropriate action
          </DialogDescription>
        </DialogHeader>
        <div className="bg-muted/50 p-4 w-full rounded-lg">
          <p className="text-xlg font-bold pb-4">{report.clan!.clan_name}</p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <User className="h-4 w-4" />
            <span>Owner:</span>
            <div className="flex items-center gap-1.5">
              <Avatar className="h-5 w-5">
                <AvatarImage src={report.clan!.user.image} />
                <AvatarFallback>
                  <Spinner />
                </AvatarFallback>
              </Avatar>
              <span className="font-medium text-foreground">
                {report.clan!.user.name}
              </span>
            </div>
          </div>
        </div>
        <div className="space-y-3">
          <h4 className="font-medium flex items-center gap-2">
            <Flag className="h-4 w-4 text-red-500" />
            Report Details
          </h4>

          <div className="grid grid-cols-[100px_1fr] gap-y-2 text-sm">
            <span className="text-muted-foreground">Reported by:</span>
            <div className="flex items-center gap-1.5">
              <Avatar className="h-5 w-5">
                <AvatarImage
                  src={
                    report.reportedByUser?.image
                      ? report.reportedByUser.image
                      : ""
                  }
                />
                <AvatarFallback>
                  <Spinner />
                </AvatarFallback>
              </Avatar>
              <span>
                {report.reportedByUser?.name
                  ? report.reportedByUser?.name
                  : "Deleted user"}
              </span>
            </div>

            <span className="text-muted-foreground">Date:</span>
            <span>{new Date(report.createdAt).toDateString()}</span>

            <span className="text-muted-foreground">Reason:</span>
            <span className="col-span-1">{report.reason}</span>
          </div>
        </div>

        <Separator />
        {showBanForm && (
          <BanForm
            clan={report.clan as unknown as ClanWithClanOwnerInfoAndBasicData}
            setOpen={setShowBanForm}
            setOpenCallback={() => setOpen(false)}
          />
        )}
        <DialogFooter className="flex flex-col sm:justify-between sm:flex-row gap-2 w-full">
          <div className="flex gap-2 w-full sm:w-fit">
            <Link href={`/clan/${report.clanId}`} className="w-full">
              <Button variant="outline" className="gap-1 w-full">
                Open Clan
                <SquareArrowOutUpRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="flex gap-2 w-full flex-col sm:flex-row sm:w-fit">
            <DismissReportButton reportId={report.id} />

            {!showBanForm && (
              <Button
                variant="destructive"
                className="gap-1"
                onClick={() => setShowBanForm(true)}
              >
                <Ban className="h-4 w-4" />
                Ban Clan
              </Button>
            )}
          </div>
        </DialogFooter>
        {/* <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row md:gap-2 gap-4">
            <div className="flex flex-col gap-2 w-full md:w-1/2">
              <p className="text-muted-foreground text-sm">Report Info</p>
              <div className="border-border border-[1px] rounded-md p-4 flex flex-col gap-2">
                <p className="text-muted-foreground text-sm">Reported By</p>
                <div className="flex items-center gap-2">
                  <Avatar>
                    <AvatarFallback>
                      <Spinner />
                    </AvatarFallback>
                    <AvatarImage
                      src={
                        report.reportedByUser ? report.reportedByUser.image : ""
                      }
                    />
                  </Avatar>
                  <p>
                    {report.reportedByUser
                      ? report.reportedByUser.name
                      : "Deleted Account"}
                  </p>
                </div>
              </div>
              <div
                className="max-h-[300px] max-w-[571px] w-full overflow-y-auto overflow-x-hidden"
                style={{
                  whiteSpace: "pre-wrap",
                  wordWrap: "break-word",
                  overflowWrap: "break-word",
                }}
              >
                {report.reason}
              </div>
            </div>
            <div className="flex flex-col gap-2 w-full md:w-1/2">
              <p className="text-muted-foreground text-sm">Clan Info</p>
              <div className="border-border border-[1px] rounded-md p-4 flex flex-col gap-2">
                <p className="text-muted-foreground text-sm">Clan Owner</p>
                <div className="flex items-center gap-2">
                  <Avatar>
                    <AvatarFallback>
                      <Spinner />
                    </AvatarFallback>
                    <AvatarImage src={report.clan!.user.image} />
                  </Avatar>
                  <p>{report.clan!.user.name}</p>
                </div>
              </div>
              <div className="max-h-[300px] overflow-y-auto">
                <p></p>
              </div>
            </div>
          </div>

          <div className="border-border border-[1px] rounded-md p-4 flex flex-col gap-4">
            <Link href={`/clan/${report.clanId}`} target="_blank">
              <Button>
                <SquareArrowOutUpRight />
                View Clan
              </Button>
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-sm text-muted-foreground">Actions</p>
            <Card>
              <CardHeader>
                <CardTitle>Dismiss Report</CardTitle>
                <CardDescription>
                  You can dismiss this report to remove this report from the
                  Reports queue
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DismissReportButton reportId={report.id} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Ban Clan</CardTitle>
                <CardDescription>Can this clan from BSCH</CardDescription>
              </CardHeader>
              <CardContent>
                <BanForm
                  clan={
                    report.clan as unknown as ClanWithClanOwnerInfoAndBasicData
                  }
                  setOpen={setOpen}
                />
              </CardContent>
            </Card>
          </div>
        </div> */}
      </DialogContent>
    </Dialog>
  );
};

export default ViewReportDialog;
