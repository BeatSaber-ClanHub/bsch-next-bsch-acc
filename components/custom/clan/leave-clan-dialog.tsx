"use client";
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
import useLeaveClan from "@/hooks/custom/use-leave-clan";
import { DoorOpen } from "lucide-react";
import { useState } from "react";

const LeaveClan = ({ clanId }: { clanId: string }) => {
  const [loading, setLoading] = useState(false);
  const { mutateAsync } = useLeaveClan();
  const [open, setOpen] = useState(false);

  async function handleLeaveClan() {
    try {
      setLoading(true);
      await mutateAsync({ clanId: clanId, onSuccess: () => setOpen(false) });
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  }

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <Button>
          <DoorOpen /> Leave Clan
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you sure you want to leave?</DialogTitle>
          <DialogDescription>
            Leaving the clan will remove all your permissions and you will no
            longer be considered a member on BSCH.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline">Close</Button>
          <Button
            variant="destructive"
            disabled={loading}
            onClick={handleLeaveClan}
          >
            {loading && <Spinner />}Leave
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LeaveClan;
