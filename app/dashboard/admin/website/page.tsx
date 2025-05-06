import SiteStatus from "@/components/custom/admin/website/site-status/site-status";
import UserRegistrationManagement from "@/components/custom/admin/website/user-registration-management/user-registration-management";
import getRole from "@/utils/get-role";
import { redirect } from "next/navigation";

const WebsitePage = async () => {
  const { role: userRole } = await getRole();
  if (userRole !== "Developer" && userRole !== "Administrator")
    redirect("/dashboard");
  return (
    <div className="flex flex-col gap-4">
      <UserRegistrationManagement currentStatus={true} />
      <SiteStatus currentStatus={false} />
    </div>
  );
};

export default WebsitePage;
