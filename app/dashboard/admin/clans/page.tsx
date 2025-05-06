import AdminTabs from "@/components/custom/admin/clans/admin-tabs/admin-tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getClanCount } from "@/data-access/clan";
import { getVerificationApplicationsCount } from "@/data-access/clan-verification-application";
import { checkAuth } from "@/utils/check-auth";
import getRole from "@/utils/get-role";
import { redirect } from "next/navigation";

const AdminClanPage = async () => {
  const session = await checkAuth();
  if (!session) redirect("/login");

  const { role } = await getRole();
  if (role === null || !role) redirect("/dashboard");
  if (session.user.banned) redirect("/dashboard");

  return (
    <div className="w-full h-auto flex gap-8 flex-col">
      <Stats />
      <AdminTabs role={role} />
    </div>
  );
};

const Stats = async () => {
  const [, totalClans] = await getClanCount({
    where: { banned: false },
  });
  const [, totalVerified] = await getClanCount({
    where: { application_status: "Approved", banned: false },
  });
  const [, totalApplications] = await getVerificationApplicationsCount();
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-white">Total Clans</CardTitle>
          <CardDescription>Total number of unbanned clans</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-white">{totalClans}</div>
        </CardContent>
      </Card>
      <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-white">Verified Clans</CardTitle>
          <CardDescription>Total number of verified clans</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-white">{totalVerified}</div>
        </CardContent>
      </Card>
      <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-white">Applications</CardTitle>
          <CardDescription>
            Total number of verification applications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-white">
            {totalApplications}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminClanPage;
