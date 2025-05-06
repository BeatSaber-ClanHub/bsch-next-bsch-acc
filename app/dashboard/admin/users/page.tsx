import { AllUsersTable } from "@/components/custom/admin/users/all-users-table/all-users-table";
import { Spinner } from "@/components/minimal-tiptap/components/spinner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getUniqueClanOwnerCount } from "@/data-access/clan";
import { getStaffCount } from "@/data-access/staff";
import { getUserCount } from "@/data-access/user";
import getRole from "@/utils/get-role";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

const UsersPage = async () => {
  const { role: userRole } = await getRole();
  if (userRole === "Currator") redirect("/dashboard");

  return (
    <div className="w-full h-auto flex gap-8 flex-col">
      <Stats />
      <Suspense fallback={<Spinner className="w-[15px]" />}>
        <AllUsersTable role={userRole!} />
      </Suspense>
    </div>
  );
};

const Stats = async () => {
  const [userCountErr, userCount] = await getUserCount();
  const [bannedUserCountErr, bannedUserCount] = await getUserCount({
    banned: true,
  });
  const [staffCountErr, staffCount] = await getStaffCount({
    where: { user: { banned: false } },
  });
  const [clanOwnerCountErr, clanOwnerCount] = await getUniqueClanOwnerCount();
  let clanOwnerPercentage =
    typeof userCount === "number" &&
    typeof clanOwnerCount === "number" &&
    clanOwnerCount !== 0
      ? Math.round((clanOwnerCount / userCount) * 100)
      : 0;
  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-sm col-span-1 sm:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-white">User Management</CardTitle>
          <CardDescription>
            Howdy staff person! For questions regarding user management, please
            refer to the{" "}
            <Link href="/" className="text-primary underline">
              docs!
            </Link>
          </CardDescription>
        </CardHeader>
        <CardContent></CardContent>
      </Card>
      <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-white">Total Users</CardTitle>
          <CardDescription>Total number all users</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-white">
            {userCountErr ? "Err" : userCount}
          </div>
        </CardContent>
      </Card>
      <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-white">Banned Users</CardTitle>
          <CardDescription>Total number of banned users</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-white">
            {bannedUserCountErr ? "Err" : bannedUserCount}
          </div>
        </CardContent>
      </Card>
      <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-white">Staff</CardTitle>
          <CardDescription>Total number of BSCH staff</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-white">
            {staffCountErr ? "Err" : staffCount}
          </div>
        </CardContent>
      </Card>
      <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-white">Clan Owner %</CardTitle>
          <CardDescription>
            Percentage of users who own a clan. Includes banned users and banned
            clans
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-white">
            {clanOwnerPercentage}%
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UsersPage;
