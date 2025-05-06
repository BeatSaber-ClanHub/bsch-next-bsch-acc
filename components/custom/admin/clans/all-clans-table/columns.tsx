"use client";

import { UserInfoPopover } from "@/components/custom/admin/clans/admin-user-info-popover";
import DrawerActions from "@/components/custom/admin/clans/all-clans-table/drawer-actions";
import Dropdown from "@/components/custom/admin/clans/all-clans-table/dropdown";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ClanWithClanOwnerInfoAndBasicData } from "@/data-access/clan";
import useUnverifyClan from "@/hooks/custom/use-unverify-clan";
import useVerifyClan from "@/hooks/custom/use-verify-clan";
import { useIsMobile } from "@/hooks/use-mobile";
import { Role, User } from "@/prisma/generated/prisma/client";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { useState } from "react";

export const columns: ColumnDef<ClanWithClanOwnerInfoAndBasicData>[] = [
  {
    accessorKey: "clan_name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Clan Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    filterFn: (row, columnId, filterValue) => {
      const clan = row.original;
      const name = clan.clan_name;
      return name.toLowerCase().includes(filterValue.toLowerCase());
    },
    cell: ({ row }) => {
      const name = row.original.clan_name;
      return (
        <div className="flex items-center gap-4">
          <p>{name}</p>
        </div>
      );
    },
  },
  {
    accessorKey: "visibility",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Visibility
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "application_status",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Application Status
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "banned",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Banned
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const user = row.original;

      return (
        <Badge variant={user.banned === true ? "destructive" : "default"}>
          {user.banned === true ? "Banned" : "Not banned"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "_count.Member",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Members
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "clan_owner",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Owner
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const owner = row.original.user as Omit<User, "email" | "email_verified">;

      return <UserInfoPopover user={owner} />;
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Joined
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const date = row.original.createdAt;
      const formattedDate = new Date(date).toDateString();
      return <p>{formattedDate}</p>;
    },
  },
  {
    id: "actions",
    cell: ({ row, table }) => {
      const role = (table.options.meta as { role: Role })?.role;
      return <ActionsMenu clan={row.original} role={role} />;
    },
  },
];

const ActionsMenu = ({
  clan,
  role,
}: {
  clan: ClanWithClanOwnerInfoAndBasicData;
  role: Role;
}) => {
  const isMobile = useIsMobile();
  const { mutateAsync: mutateAsyncVerifyClan } = useVerifyClan();
  const { mutateAsync: mutateAsyncUnverifyClan } = useUnverifyClan();

  const [verifyLoading, setVerifyLoading] = useState(false);
  const [unverifyLoading, setUnverifyLoading] = useState(false);
  async function verifyClan() {
    try {
      setVerifyLoading(true);
      await mutateAsyncVerifyClan({ clanId: clan.id });
      setVerifyLoading(false);
    } catch (error) {
      setVerifyLoading(false);
    }
  }
  async function unverifyClan() {
    try {
      setUnverifyLoading(true);
      await mutateAsyncUnverifyClan({ clanId: clan.id });
      setUnverifyLoading(false);
    } catch (error) {
      setUnverifyLoading(false);
    }
  }
  return (
    <>
      {isMobile ? (
        <DrawerActions
          clan={clan}
          verifyClan={verifyClan}
          unverifyClan={unverifyClan}
          verifyLoading={verifyLoading}
          unverifyLoading={unverifyLoading}
          role={role}
        />
      ) : (
        <Dropdown
          clan={clan}
          verifyClan={verifyClan}
          unverifyClan={unverifyClan}
          verifyLoading={verifyLoading}
          unverifyLoading={unverifyLoading}
          role={role}
        />
      )}
    </>
  );
};
