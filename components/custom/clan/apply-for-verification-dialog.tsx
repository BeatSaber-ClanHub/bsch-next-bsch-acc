"use client";
import { APIResponse } from "@/app/api/types/core/api";
import { Spinner } from "@/components/minimal-tiptap/components/spinner";
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
import { ClanWithClanOwnerInfoAndBasicData } from "@/data-access/clan";
import { ClanWithMemberCount } from "@/data-access/types/types";
import useErrorToast from "@/hooks/custom/use-error-toast";
import { useToast } from "@/hooks/use-toast";
import { Check, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

const ApplyForVerificationDialog = ({
  clan,
}: {
  clan: ClanWithMemberCount;
}) => {
  const errorToast = useErrorToast();
  const { toast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const [standards, setStandards] = useState<
    Array<{ title: string; met: boolean }>
  >([]);
  const [standardsMet, setStandardsMet] = useState(false);

  const evaluateStandards = useCallback(async () => {
    const validInvite = clan.discord_invite_link !== null;
    const targetDays = 30;

    const currentDate = new Date();
    const createdAtDate = new Date(clan.createdAt);

    const diffInTime = currentDate.getTime() - createdAtDate.getTime();
    const diffInDays = Math.round(diffInTime / (1000 * 60 * 60 * 24));

    const remainingDays = targetDays - diffInDays;

    const standards: Array<{ title: string; met: boolean }> = [
      {
        title: "At least 10 members",
        met: clan.memberCount >= 10,
      },
      {
        title: "Discord Invite",
        met: validInvite,
      },
      {
        title: "1 month listing on BSCH Site",
        met: remainingDays <= 0,
      },
    ];

    if (standardsMet !== true)
      setStandardsMet(
        clan.memberCount >= 10 && validInvite && remainingDays <= 0
      );

    return standards;
  }, [
    clan.createdAt,
    clan.discord_invite_link,
    clan.memberCount,
    standardsMet,
  ]);

  useEffect(() => {
    (async () => {
      const standards = await evaluateStandards();
      setStandards(standards);
    })();
  }, [evaluateStandards]);

  async function apply() {
    try {
      setLoading(true);
      const response = await fetch(`/api/clan/${clan.id}/verification/apply`, {
        method: "POST",
      });
      const responseJSON: APIResponse<ClanWithClanOwnerInfoAndBasicData> =
        await response.json();

      if (!response.ok) throw responseJSON;

      toast({
        title: "Application submitted!",
        description: responseJSON.message,
      });
      router.refresh();
      setOpen(false);
    } catch (error) {
      let errorMessage = "Failed to submit verification!";
      console.log(error);
      if (error instanceof TypeError) {
        errorMessage = "Something unexpected occured!";
      } else if (
        typeof error === "object" &&
        error !== null &&
        "message" in error
      ) {
        errorMessage = error.message as string;
      }

      errorToast("Failed to submit verification!", errorMessage);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Apply for Verification</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Clan Verification Application</DialogTitle>
          <DialogDescription>
            Getting verified is a breeze! Check out the list below to see how
            you&apos;re stacking up against our criteria. Once verified, your
            clan will earn that extra badge of trust, helping you build even
            stronger connections within the community!
          </DialogDescription>
        </DialogHeader>
        <div className="w-full p-4 pb-0 border-[1px] border-border flex flex-col gap-4 min-h-[200px] rounded-md pt-0 justify-center">
          {standards.map((standard) => {
            return (
              <Standard
                met={standard.met}
                title={standard.title}
                key={standard.title}
              />
            );
          })}
        </div>
        <DialogFooter>
          <div className="flex gap-4">
            <Button variant={"outline"} onClick={() => setOpen(false)}>
              Close
            </Button>
            <Button disabled={loading || !standardsMet} onClick={apply}>
              {loading && <Spinner />} Apply
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const Standard = ({ title, met }: { title: string; met: boolean }) => {
  return (
    <div className="flex border-b-[1px] border-border gap-4 items-center pb-4 last:border-none last:pb-0">
      <div
        className={`flex items-center justify-center rounded-full p-1 ${
          met ? "bg-green-500" : "bg-red-500"
        }`}
      >
        {met ? <Check size={15} /> : <X size={15} />}
      </div>
      <p className="text-sm text-muted-foreground">{title}</p>
    </div>
  );
};

export default ApplyForVerificationDialog;
