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
import { WebsiteAnnouncementWithPosterUserData } from "@/data-access/website-announcement";
import useDeleteAnnouncement from "@/hooks/custom/use-delete-announcement";
import { Trash } from "lucide-react";
import { useState } from "react";

const DeleteAnnouncementDialog = ({
  announcementId,
}: {
  announcementId: string;
}) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const { mutateAsync } = useDeleteAnnouncement();

  async function deleteAnnouncement() {
    try {
      setLoading(true);
      await mutateAsync({
        id: announcementId,
        callback: () => setOpen(false),
      });
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive">
          <Trash /> Delete
        </Button>
      </DialogTrigger>
      <DialogContent className="!min-w-fit">
        <DialogHeader>
          <DialogTitle>Delete Announcement</DialogTitle>
          <DialogDescription>Delete this announcement.</DialogDescription>
        </DialogHeader>
        <div>
          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Close
            </Button>
            <Button
              onClick={deleteAnnouncement}
              disabled={loading}
              variant="destructive"
            >
              {loading && <Spinner />}
              <Trash />
              Delete
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteAnnouncementDialog;
