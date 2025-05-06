"use client";
import { AdminMembersTable } from "@/components/custom/clan/admin-members-table/members-table";
import ApplicationsTable from "@/components/custom/clan/applications-table/applications-table";
import BlockedUsersTable from "@/components/custom/clan/permanently-blocked-users/applications-table";
import { RegularMembersTable } from "@/components/custom/clan/regular-members-table/members-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clan, ClanStaffRole } from "@/prisma/generated/prisma/client";
import { User } from "better-auth";
import { useState } from "react";

const MembersTableAndApplicationsTableSection = ({
  clanRole,
  sessionUser,
  clan,
}: {
  clanRole: ClanStaffRole | null;
  sessionUser: User | null;
  clan: Clan;
}) => {
  const [activeTab, setActiveTab] = useState("members");
  // If the user is a clan administrator/mod, they can view both the admin table and the join requests
  if (
    clanRole === "Administrator" ||
    clanRole === "Creator" ||
    (clanRole === "Moderator" && !clan.banned)
  ) {
    return (
      <Tabs defaultValue={activeTab}>
        <TabsList>
          <TabsTrigger value="members" onClick={() => setActiveTab("members")}>
            Members
          </TabsTrigger>
          <TabsTrigger
            value="requests"
            onClick={() => setActiveTab("requests")}
          >
            Join Requests
          </TabsTrigger>
          <TabsTrigger
            value="permanently"
            onClick={() => setActiveTab("permanently")}
          >
            Blocked Users
          </TabsTrigger>
        </TabsList>
        <TabsContent
          value="members"
          forceMount
          className={activeTab === "members" ? "block" : "hidden"}
        >
          <div className="flex flex-col gap-4">
            <p className="text-[calc(30px+1vw)]">Members</p>
            <AdminMembersTable
              id={clan.id}
              viewingUserRole={clanRole}
              viewingUser={{
                id: sessionUser!.id,
                image: sessionUser!.image!,
                name: sessionUser!.name,
              }}
            />
          </div>
        </TabsContent>
        <TabsContent
          value="requests"
          forceMount
          className={activeTab === "requests" ? "block" : "hidden"}
        >
          <div className="flex flex-col gap-4">
            <p className="text-[calc(30px+1vw)]">Join Requests</p>
            <ApplicationsTable clanId={clan.id} />
          </div>
        </TabsContent>
        <TabsContent
          value="permanently"
          forceMount
          className={activeTab === "permanently" ? "block" : "hidden"}
        >
          <div className="flex flex-col gap-4">
            <p className="text-[calc(30px+1vw)]">Blocked Users</p>
            <BlockedUsersTable clanId={clan.id} />
          </div>
        </TabsContent>
      </Tabs>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-[calc(30px+1vw)]">Members</p>
      <RegularMembersTable
        id={clan.id}
        viewingUserId={sessionUser?.id || undefined}
      />
    </div>
  );
};

export default MembersTableAndApplicationsTableSection;
