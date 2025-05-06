import AnnouncementBanners from "@/components/custom/general-website/announcement-banners";
import { BSCH_NavigationMenu } from "@/components/custom/general-website/navigation/navigation";
import { getVisibleAnnouncements } from "@/data-access/website-announcement";
import { auth } from "@/lib/auth";
import { cookies, headers } from "next/headers";

type Session = typeof auth.$Infer.Session;

const Navigation = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const announcementIdsToHide = (await cookies()).get(
    "bsch-announcement-ids-to-hide"
  )?.value;
  const arr = announcementIdsToHide?.split(";");

  const [, announcements] = await getVisibleAnnouncements();
  const sendToClient = announcements?.filter((announcement) => {
    if (!arr?.includes(announcement.id)) return announcement;
  });

  return (
    <div>
      <AnnouncementBanners announcements={sendToClient || []} />
      <BSCH_NavigationMenu session={session as Session} />
    </div>
  );
};

export default Navigation;
