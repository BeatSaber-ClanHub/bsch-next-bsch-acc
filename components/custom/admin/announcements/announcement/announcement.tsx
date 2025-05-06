"use client";

import DeleteAnnouncementDialog from "@/components/custom/admin/announcements/delete-announcement-dialog/delete-announcement-dialog";
import EditAnnouncementDialog from "@/components/custom/admin/announcements/edit-announcement/edit-announcement-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { WebsiteAnnouncementWithPosterUserData } from "@/data-access/website-announcement";
import { PenBox, Trash } from "lucide-react";

const Announcement = ({
  announcement,
}: {
  announcement: WebsiteAnnouncementWithPosterUserData;
}) => {
  const showAt = new Date(announcement?.showAt ? announcement.showAt : "");
  const hideAt = new Date(announcement?.hideAt ? announcement.hideAt : "");

  const now = new Date();
  let showActiveBadge = false;
  if (announcement.visible) {
    showActiveBadge = true;
  } else if (now >= showAt && now <= hideAt) {
    showActiveBadge = true;
  }
  return (
    <div className="border rounded-lg p-4 flex flex-col gap-4">
      <div className="flex flex-col-reverse sm:flex-row sm:justify-between gap-2">
        <div>
          <p className="text-3xl font-bold">{announcement.title}</p>
          {!isNaN(showAt.getTime()) ? (
            <p className="text-sm text-muted-foreground">
              {showAt.toUTCString()} - {hideAt.toUTCString()}
            </p>
          ) : null}
        </div>
        {showActiveBadge && (
          <div>
            {}
            <Badge variant="outline">Active</Badge>
          </div>
        )}
      </div>
      <div>
        <p className="text-sm">{announcement.announcement}</p>
      </div>
      <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between ">
        <DeleteAnnouncementDialog announcementId={announcement.id} />
        <EditAnnouncementDialog announcement={announcement} />
      </div>
    </div>
  );
};

export default Announcement;
