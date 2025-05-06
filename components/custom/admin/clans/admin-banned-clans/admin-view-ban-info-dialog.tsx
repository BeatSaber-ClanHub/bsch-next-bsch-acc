"use client";
import UnbanClanButton from "@/components/custom/clan/unban-clan-button";
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
import { ClanWithClanOwnerInfoAndBasicData } from "@/data-access/clan";
import { EnrichedClanBan } from "@/data-access/clan-ban";
import { SquareArrowOutUpRight } from "lucide-react";
import Link from "next/link";
import { ReactNode, useState } from "react";

const ViewBanInfoDialog = ({
  ban,
  dropdownMenuItem = false,
}: {
  ban: EnrichedClanBan;
  dropdownMenuItem?: ReactNode;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {dropdownMenuItem !== null ? (
          dropdownMenuItem
        ) : (
          <Button>View Ban</Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:!w-[75vw] sm:!max-w-[1000px]">
        <DialogHeader>
          <DialogTitle>Ban for {ban.clan.clan_name}</DialogTitle>
          <DialogDescription className="sr-only">
            Ban Info dialog.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 w-full">
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
                    <AvatarImage src={ban.user ? ban.user.image : ""} />
                  </Avatar>
                  <p>{ban.user ? ban.user.name : "Deleted user"}</p>
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
                {ban.justification}
              </div>
            </div>
            <div className="flex flex-col gap-2 w-full md:w-1/2">
              <p className="text-muted-foreground text-sm">Clan Info</p>
              <div className="border-border border-[1px] rounded-md p-4 flex flex-col gap-2">
                <p className="text-muted-foreground text-sm">Owned by</p>
                <div className="flex items-center gap-2">
                  <Avatar>
                    <AvatarFallback>
                      <Spinner />
                    </AvatarFallback>
                    <AvatarImage src={ban.clan.user.image} />
                  </Avatar>
                  <p>{ban.clan.user.name}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="border-border border-[1px] rounded-md p-4 flex flex-col gap-4">
            <div>
              <Link href={`/clan/${ban.clanId}`} target="_blank">
                <Button>
                  <SquareArrowOutUpRight />
                  View Clan
                </Button>
              </Link>
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-sm text-muted-foreground">Actions</p>
              <UnbanClanButton
                clan={ban.clan as unknown as ClanWithClanOwnerInfoAndBasicData}
              />
              <Button variant="outline" onClick={() => setOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewBanInfoDialog;
