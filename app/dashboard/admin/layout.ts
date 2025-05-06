import { getMaintenanceModeStatus } from "@/data-access/website";
import { checkAuth } from "@/utils/check-auth";
import getRole from "@/utils/get-role";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

const AdminLayout = async ({ children }: { children: ReactNode }) => {
  const session = await checkAuth();
  if (!session) redirect("/login");
  if (session?.user.banned) redirect("/profile");
  const { role: userRole } = await getRole();
  const [maintenanceErr, isMaintenance] = await getMaintenanceModeStatus();
  if (isMaintenance && !userRole) redirect("/maintenance");

  return children;
};

export default AdminLayout;
