"use client";
import JoinClanDialog from "@/components/custom/clan/join-clan-dialog";
import RecallJoinRequestButton from "@/components/custom/clan/recall-join-request-button";
import { Button } from "@/components/ui/button";
import { Clan, ClanJoinRequest } from "@/prisma/generated/prisma/client";
import { Plus } from "lucide-react";

const JoinSection = ({
  banned,
  request,
  clan,
}: {
  banned: boolean;
  request: ClanJoinRequest | null;
  clan: Clan;
}) => {
  let content = null;
  if (banned) {
    content = <p>You have been banned. You can not request to join it.</p>;
  } else if (request?.allowAnotherApplication === false) {
    content = (
      <p>
        Seems like you&apos;ve already applied and recieved a rejection. This
        clan owner is not allowing you to request to join again.
      </p>
    );
  } else if (request?.status === "Denied") {
    content = (
      <div className="flex flex-col gap-2 w-full">
        <JoinClanDialog clan={clan} />
        <p>
          Your previous application was declined. While you are welcome to
          reapply, we advise waiting to avoid repeated rejections.
        </p>
      </div>
    );
  } else if (request) {
    content = (
      <div className="flex flex-col gap-2 w-full">
        <div className="flex gap-4 flex-wrap">
          <RecallJoinRequestButton clanId={clan.id} />
          <Button disabled={true} className="w-fit">
            <Plus />
            Join Clan
          </Button>
        </div>
        <p>Your request to join has been submitted!.</p>
      </div>
    );
  } else {
    content = <JoinClanDialog clan={clan} />;
  }

  return (
    <div className="w-full border p-4 rounded-lg flex flex-col gap-8">
      <div className="flex flex-col">
        <p className="text-[calc(30px+1vw)]">Interested in joining?</p>
        <p className="text-muted-foreground">
          Hit that button to get things rolling! Just a heads up -{" "}
          {clan.clan_name} makes the final call on who joins.
        </p>
      </div>

      {content}
    </div>
  );
};

export default JoinSection;
