"use client";
import { useEffect, useLayoutEffect, useState } from "react";
import { WebsiteAnnouncementWithPosterUserData } from "../../../data-access/website-announcement";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import Cookies from "js-cookie";
import { usePathname } from "next/navigation";

const HIDE_ANNOUNCEMENTS_COOKIE = "bsch-announcement-ids-to-hide";

function getHiddenAnnouncementIdsFromCookie(): string[] {
  const cookieValue = Cookies.get(HIDE_ANNOUNCEMENTS_COOKIE);
  if (cookieValue) {
    try {
      return cookieValue.split(";");
    } catch (e) {
      console.error("Failed to parse cookie value:", e);
      return [];
    }
  }
  return [];
}

function setHiddenAnnouncementIdsInCookie(ids: string[]) {
  Cookies.set(HIDE_ANNOUNCEMENTS_COOKIE, ids.join(";"), { expires: 30 }); // Example: cookie expires in 365 days
}

const AnnouncementBanners = ({
  announcements,
}: {
  announcements: WebsiteAnnouncementWithPosterUserData[];
}) => {
  const pathname = usePathname();
  const showFooterRoutes = ["/", "/clans", "/docs", "/login"];
  const showFooter = showFooterRoutes.includes(pathname);

  return showFooter ? (
    <AnnouncementBannersContainer announcements={announcements} />
  ) : null;
};

const AnnouncementBannersContainer = ({
  announcements,
}: {
  announcements: WebsiteAnnouncementWithPosterUserData[];
}) => {
  const [renderTheseAnnouncements, setRenderTheseAnnouncements] =
    useState<Array<WebsiteAnnouncementWithPosterUserData>>(announcements);
  useEffect(() => {
    const hiddenIds = getHiddenAnnouncementIdsFromCookie();

    const render = announcements.filter(
      (announcement) => !hiddenIds.includes(announcement.id)
    );

    setRenderTheseAnnouncements(render);
  }, [announcements]);

  function addToRemoveList(id: string) {
    const existingHiddenIds = getHiddenAnnouncementIdsFromCookie();

    const updatedHiddenIds = Array.from(new Set([...existingHiddenIds, id]));

    setHiddenAnnouncementIdsInCookie(updatedHiddenIds);

    const render = announcements.filter(
      (announcement) => !updatedHiddenIds.includes(announcement.id)
    );

    setRenderTheseAnnouncements(render);
  }

  return renderTheseAnnouncements?.map((announcement) => {
    return (
      <AnnouncementBanner
        announcement={announcement}
        key={announcement.id}
        remove={addToRemoveList}
      />
    );
  });
};

const AnnouncementBanner = ({
  announcement,
  remove,
}: {
  announcement: WebsiteAnnouncementWithPosterUserData;
  remove: (id: string) => void;
}) => {
  return (
    <div
      className="w-full flex items-center justify-center p-4 bg-primary text-white relative"
      key={announcement.id}
    >
      <p>{announcement.announcement}</p>
      <Button
        variant="outline"
        className="rounded-full w-[30px] h-[30px] absolute right-4"
        onClick={() => remove(announcement.id)}
      >
        <X />
      </Button>
    </div>
  );
};

export default AnnouncementBanners;
