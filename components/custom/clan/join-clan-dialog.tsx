"use client";
import { Spinner } from "@/components/minimal-tiptap/components/spinner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Clan } from "@/prisma/generated/prisma/client";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const JoinClanDialog = ({ clan }: { clan: Clan }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  async function submitRequest() {
    try {
      setLoading(true);
      const response = await fetch(`/api/clan/${clan.id}/join`, {
        method: "POST",
      });

      const responseJSON = await response.json();

      if (!response.ok) throw responseJSON;

      setOpen(false);

      toast({
        title: "Request submitted!",
        description: "Your request has been sent!",
      });
      router.refresh();
    } catch (error) {
      let errorMessage = "Failed to submit join request!";
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

      toast({
        title: "Uh Oh!",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }
  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <Button className="w-fit">
          <Plus />
          Join Clan
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Request to join?</DialogTitle>
          <DialogDescription>
            Interested in joining {clan.clan_name}? Click the Request to Join
            button below to submit a request for the clan owner to review!
          </DialogDescription>
        </DialogHeader>
        <div className="flex gap-4 w-full justify-end">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Close
          </Button>
          <Button onClick={submitRequest} disabled={loading}>
            {loading && <Spinner />}Request to Join
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default JoinClanDialog;
