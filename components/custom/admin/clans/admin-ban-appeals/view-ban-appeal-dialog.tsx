"use client";
import AppealForm from "@/components/custom/admin/clans/admin-ban-appeals/appeal-form";
import { Spinner } from "@/components/minimal-tiptap/components/spinner";
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
import { EnrichedBanAppeal } from "@/data-access/types/types";
import { Eye, SquareArrowOutUpRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const ViewBanAppealDialog = ({ appeal }: { appeal: EnrichedBanAppeal }) => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Eye />
          View
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:!w-[75vw] sm:!max-w-[1000px]">
        <DialogHeader>
          <DialogTitle>Appeal for {appeal.clan.clan_name}</DialogTitle>
          <DialogDescription className="sr-only">
            Appeal Info dialog.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row md:gap-2 gap-4">
            <div className="flex flex-col gap-2 w-full md:w-1/2">
              <p className="text-muted-foreground text-sm">Ban Info</p>
              <div className="border-border border-[1px] rounded-md p-4 flex flex-col gap-2">
                <p className="text-muted-foreground text-sm">Banned By</p>
                <div className="flex items-center gap-2">
                  <Avatar>
                    <AvatarFallback>
                      <Spinner />
                    </AvatarFallback>
                    <AvatarImage src={appeal.ban.user.image} />
                  </Avatar>
                  <p>{appeal.ban.user.name}</p>
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
                {appeal.ban.justification}
              </div>
            </div>
            <div className="flex flex-col gap-2 w-full md:w-1/2">
              <p className="text-muted-foreground text-sm">Appeal Info</p>
              <div className="border-border border-[1px] rounded-md p-4 flex flex-col gap-2">
                <p className="text-muted-foreground text-sm">Appealed By</p>
                <div className="flex items-center gap-2">
                  <Avatar>
                    <AvatarFallback>
                      <Spinner />
                    </AvatarFallback>
                    <AvatarImage src={appeal.submittedBy.image} />
                  </Avatar>
                  <p>{appeal.submittedBy.name}</p>
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
                {appeal.justification}
              </div>
            </div>
          </div>

          <div className="border-border border-[1px] rounded-md p-4 flex flex-col gap-4">
            <div>
              <Link href={`/clan/${appeal.clanId}`} target="_blank">
                <Button>
                  <SquareArrowOutUpRight />
                  View Clan
                </Button>
              </Link>
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-sm text-muted-foreground">Actions</p>
              <AppealForm appeal={appeal} setOpen={setOpen} />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewBanAppealDialog;
