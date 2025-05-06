"use client";

import BanAppealsData from "@/components/custom/admin/clans/admin-ban-appeals/admin-ban-appeals";
import BannedClansData from "@/components/custom/admin/clans/admin-banned-clans/admin-banned-clans";
import ReportedClansData from "@/components/custom/admin/clans/admin-reported-clans/admin-reported-clans";
import ClanApplicationsTable from "@/components/custom/admin/clans/admin-verification-applications/admin-verification-table";
import { AllClansTable } from "@/components/custom/admin/clans/all-clans-table/all-clans-table";
import { Spinner } from "@/components/minimal-tiptap/components/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Role, Staff } from "@/prisma/generated/prisma/client";
import { Suspense, useState } from "react";

const AdminTabs = ({ role }: { role: Role }) => {
  const [activeTab, setActiveTab] = useState("all");

  return (
    <Tabs defaultValue={activeTab}>
      <TabsList className="max-w-full flex-wrap h-auto justify-start">
        <TabsTrigger value="all" onClick={() => setActiveTab("all")}>
          All Clans
        </TabsTrigger>
        <TabsTrigger value="ver_apps" onClick={() => setActiveTab("ver_apps")}>
          Verify Requests
        </TabsTrigger>
        {role !== "Currator" && (
          <>
            <TabsTrigger
              value="reports"
              onClick={() => setActiveTab("reports")}
            >
              Reported
            </TabsTrigger>
            <TabsTrigger value="banned" onClick={() => setActiveTab("banned")}>
              Banned
            </TabsTrigger>
            <TabsTrigger
              value="appeals"
              onClick={() => setActiveTab("appeals")}
            >
              Appeals
            </TabsTrigger>
          </>
        )}
      </TabsList>
      <TabsContent
        value="all"
        forceMount
        className={activeTab === "all" ? "block" : "hidden"}
      >
        <AllClans role={role} />
      </TabsContent>
      <TabsContent
        value="ver_apps"
        forceMount
        className={activeTab === "ver_apps" ? "block" : "hidden"}
      >
        <ClanApplications />
      </TabsContent>
      {role !== "Currator" && (
        <>
          <TabsContent
            value="reports"
            forceMount
            className={activeTab === "reports" ? "block" : "hidden"}
          >
            <ReportsTimeline />
          </TabsContent>
          <TabsContent
            value="banned"
            forceMount
            className={activeTab === "banned" ? "block" : "hidden"}
          >
            <BannedClans />
          </TabsContent>
          <TabsContent
            value="appeals"
            forceMount
            className={activeTab === "appeals" ? "block" : "hidden"}
          >
            <BanAppeals />
          </TabsContent>
        </>
      )}
    </Tabs>
  );
};

const ClanApplications = () => {
  return (
    <div className="flex flex-col border-border border-[1px] rounded-md w-full  h-[516px] min-h-[516px] p-4">
      <Suspense fallback={<Load />}>
        <ClanApplicationsTable />
      </Suspense>
    </div>
  );
};

const ReportsTimeline = () => {
  return (
    <div className="flex flex-col border-border border-[1px] rounded-md w-full  h-[516px] min-h-[516px] p-4">
      <Suspense fallback={<Load />}>
        <ReportedClansData />
      </Suspense>
    </div>
  );
};

const Load = () => {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <Spinner className="w-[15px]" />
    </div>
  );
};

const BannedClans = () => {
  return (
    <div className="flex flex-col border-border border-[1px] rounded-md w-full h-[516px] min-h-[516px] p-4">
      <Suspense fallback={<Load />}>
        <BannedClansData />
      </Suspense>
    </div>
  );
};

const BanAppeals = () => {
  return (
    <div className="flex flex-col border-border border-[1px] rounded-md w-full h-[516px] min-h-[516px] p-4">
      <Suspense fallback={<Load />}>
        <BanAppealsData />
      </Suspense>
    </div>
  );
};

const AllClans = ({ role }: { role: Role }) => {
  return (
    <div className="w-full ">
      <div className="h-[60px]">
        <p className="text-lg">All Clans</p>
        <p className="text-sm text-muted-foreground">
          All clans on BSCH are listed.
        </p>
      </div>
      <div className="">
        <Suspense fallback={<Load />}>
          <AllClansTable role={role} />
        </Suspense>
      </div>
    </div>
  );
};

export default AdminTabs;
