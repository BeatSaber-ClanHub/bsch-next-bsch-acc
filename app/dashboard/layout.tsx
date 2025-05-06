import WidthCalc from "@/app/dashboard/width-calc";
import { VisitorsChart } from "@/components/custom/dashboard/admin/visitors-chart";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { getClanCount } from "@/data-access/clan";
import { getVerificationApplicationsCount } from "@/data-access/clan-verification-application";
import { getReportedClanCount } from "@/data-access/report";
import { getMaintenanceModeStatus } from "@/data-access/website";
import { Role } from "@/prisma/generated/prisma/client";
import { checkAuth } from "@/utils/check-auth";
import getRole from "@/utils/get-role";
import {
  Bot,
  CircleAlert,
  Flag,
  Home,
  LucideProps,
  Megaphone,
  Monitor,
  MonitorIcon,
  Shield,
  User,
  Users,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ForwardRefExoticComponent,
  ReactElement,
  ReactNode,
  RefAttributes,
} from "react";

// Main layout for the page
const DashboardLayout = async ({ children }: { children: ReactNode }) => {
  const session = await checkAuth();
  if (!session) redirect("/login");
  if (session?.user.banned) redirect("/profile");
  const { role: userRole } = await getRole();
  const [maintenanceErr, isMaintenance] = await getMaintenanceModeStatus();
  if (isMaintenance && !userRole) redirect("/maintenance");
  if (userRole)
    return (
      <SidebarLayout role={userRole}>
        <WidthCalc>{children}</WidthCalc>
      </SidebarLayout>
    );

  return (
    <div className="max-w-[1600px] ml-auto mr-auto px-4 pt-4">{children}</div>
  );
};

const ReviewApplications = async () => {
  const [countErr, count] = await getVerificationApplicationsCount();

  if (countErr) {
    <Alert variant="destructive" className="flex-1 h-fit">
      <CircleAlert />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>There was an issue.</AlertDescription>
    </Alert>;
  }
  return (
    <Card className="w-full sm:w-[calc(50%-8px)]">
      <CardHeader>
        <CardTitle>Applications</CardTitle>
        <CardDescription>Review clan applications.</CardDescription>
      </CardHeader>
      <CardContent className="flex gap-2 flex-col min-h-[72px]">
        <p>There are {count} applications pending approval.</p>
      </CardContent>
      <CardFooter>
        <Link href="/dashboard/admin/clans" className="w-full">
          <Button className="w-full">Review</Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

const Reports = async () => {
  const [countErr, count] = await getReportedClanCount();

  if (countErr) {
    <Alert variant="destructive" className="flex-1 h-fit">
      <CircleAlert />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>There was an issue.</AlertDescription>
    </Alert>;
  }
  return (
    <Card className="w-full sm:w-[calc(50%-8px)]">
      <CardHeader>
        <CardTitle>Reports</CardTitle>
        <CardDescription>View reported clans.</CardDescription>
      </CardHeader>
      <CardContent className="flex gap-2 flex-col min-h-[72px]">
        <p>There are {count} clans pending review.</p>
      </CardContent>
      <CardFooter>
        <Link href="/dashboard/admin/clans" className="w-full">
          <Button className="w-full">Review</Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

const Visitors = () => {
  return (
    <Card className="w-full lg:w-[400px]">
      <CardHeader>
        <CardTitle>Visits</CardTitle>
        <CardDescription>Unique visitors</CardDescription>
      </CardHeader>
      <CardContent>
        <VisitorsChart />
      </CardContent>
    </Card>
  );
};

const Actions = () => {
  return (
    <div className="flex-1 sm:min-w-[500px] h-full">
      <Card className="h-full">
        <CardHeader>
          <div className="flex flex-col gap-2">
            <CardTitle>Actions</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <ReviewApplications />
            <Reports />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const ClanStats = async () => {
  const [clanCountErr, clanCount] = await getClanCount();
  const [approvedErr, approvedCount] = await getClanCount({
    where: { application_status: "Approved" },
  });
  const [awaitingErr, awaitingCount] = await getVerificationApplicationsCount();
  return (
    <div className="flex flex-col gap-4 w-full lg:w-fit">
      <div className="flex gap-4 flex-wrap">
        <Card className="w-full md:w-[calc(50%-8px)] lg:w-[250px] h-[190px]">
          <CardHeader>
            <CardTitle>Clans</CardTitle>
            <CardDescription>Total Clans</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-[calc(30px+1vw)]">
              {clanCountErr ? "Err" : clanCount}
            </p>
          </CardContent>
        </Card>
        <Card className="w-full md:w-[calc(50%-8px)] lg:w-[250px] h-[190px]">
          <CardHeader>
            <CardTitle>Approved</CardTitle>
            <CardDescription>
              Total number of approved clans regardless of ban status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-[calc(30px+1vw)]">
              {approvedErr ? "Err" : approvedCount}
            </p>
          </CardContent>
        </Card>
      </div>
      <Card className="h-[190px]">
        <CardHeader>
          <CardTitle>Awaiting Approval</CardTitle>
          <CardDescription>Approved clans</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-[calc(30px+1vw)]">
            {awaitingErr ? "Err" : awaitingCount}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

const AdministrativeActions = () => {
  return (
    <div className="flex flex-col gap-4">
      <p>Management</p>
      <div className="flex gap-4 flex-wrap">
        <ActionCard
          title="Users"
          description="View and Manage users."
          href={"/dashboard/admin/clans"}
          icon={<User />}
        />
        <ActionCard
          title="Clans"
          description="View and Manage clans."
          href={"/dashboard/admin/clans"}
          icon={<Flag />}
        />
        <ActionCard
          title="Website"
          description="Website settings."
          href={"/dashboard/admin/clans"}
          icon={<Monitor />}
          disabled={true}
        />
        <ActionCard
          title="Discord Bot"
          description="Discord bot settings."
          href={"/dashboard/admin/clans"}
          icon={<Bot />}
          disabled={true}
        />
      </div>
    </div>
  );
};

const ActionCard = ({
  title,
  description,
  href,
  icon,
  disabled,
}: {
  title: string;
  description: string;
  href: string;
  icon: ReactElement;
  disabled?: boolean;
}) => {
  return (
    <Card
      className={`w-full md:w-[calc(50%-8px)] lg:w-[250px] ${
        disabled && "opacity-75"
      }`}
    >
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="w-[40px] h-[40px] mb-4 ml-auto mr-auto rounded-md bg-secondary flex items-center justify-center">
          {icon}
        </div>
        {disabled ? (
          <Button disabled={true} className="w-full">
            Manage
          </Button>
        ) : (
          <Link href={href} className="w-full">
            <Button className="w-full">Manage</Button>
          </Link>
        )}
      </CardContent>
    </Card>
  );
};

interface LinkItem {
  title: string;
  url: string;
  icon: ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
  >;
  roles?: Array<Role>;
  disabled?: boolean;
}

const items: Array<LinkItem> = [
  {
    title: "Home",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Clans",
    url: "/dashboard/admin/clans",
    icon: Shield,
  },
  {
    title: "Users",
    url: "/dashboard/admin/users",
    icon: Users,
    roles: ["Moderator", "Administrator", "Developer"],
  },
  {
    title: "Website",
    url: "/dashboard/admin/website",
    icon: MonitorIcon,
    disabled: true,
    roles: ["Administrator", "Developer"],
  },
  {
    title: "Announcements",
    url: "/dashboard/admin/website/announcements",
    icon: Megaphone,
    disabled: true,
    roles: ["Administrator", "Developer"],
  },
  {
    title: "Discord Bot",
    url: "/dashboard/admin/discord",
    icon: Bot,
    roles: ["Administrator", "Developer"],
  },
];

const AppSidebar = ({ role }: { role: Role }) => {
  return (
    <Sidebar className="w-64">
      <SidebarContent className="!fixed w-[256px]">
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                let render = true;
                if (item.roles) {
                  render = item.roles.includes(role);
                }

                if (render) {
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild disabled={item?.disabled}>
                        <Link href={item.url}>
                          <item.icon />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                }
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

const SidebarLayout = ({
  children,
  role,
}: {
  children: React.ReactNode;
  role: Role;
}) => {
  return (
    <SidebarProvider>
      <div className="flex h-full relative">
        <AppSidebar role={role} />
        {children}
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
