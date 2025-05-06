import AnnouncementsStream from "@/components/custom/admin/announcements/announcements-stream/announcements-stream";
import CreateAnnouncementDialog from "@/components/custom/admin/announcements/create-announcement-dialog/create-announcement-dialog";
import { Spinner } from "@/components/minimal-tiptap/components/spinner";
import { Separator } from "@/components/ui/separator";
import getRole from "@/utils/get-role";
import { redirect } from "next/navigation";
import { Suspense } from "react";

const AnnouncementsPage = async () => {
  const { role: userRole } = await getRole();
  if (userRole !== "Developer" && userRole !== "Administrator")
    redirect("/dashboard");
  return (
    <div className="flex flex-col gap-4">
      <div className="w-full flex flex-col justify-start gap-4 sm:justify-between sm:flex-row sm:items-center">
        <p className="text-3xl">Announcements</p>
        <CreateAnnouncementDialog />
      </div>
      <Separator />
      <Suspense fallback={<Spinner />}>
        <AnnouncementsStream />
      </Suspense>
    </div>
  );
};

export default AnnouncementsPage;
