"use client";

import DrawerActions from "@/components/custom/admin/users/all-users-table/drawer-actions";
import Dropdown from "@/components/custom/admin/users/all-users-table/dropdown";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BasicUser } from "@/data-access/user";
import { useIsMobile } from "@/hooks/use-mobile";
import { Role } from "@/prisma/generated/prisma/client";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { useState } from "react";

export const columns: ColumnDef<BasicUser>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          User
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    filterFn: (row, columnId, filterValue) => {
      const user = row.original;
      const name = user.name;
      return name.toLowerCase().includes(filterValue.toLowerCase());
    },
    cell: ({ row }) => {
      const name = row.original.name;
      return (
        <div className="flex items-center gap-4">
          <Avatar>
            <AvatarFallback>
              <Skeleton className="w-[40px] h-[40px]" />
            </AvatarFallback>
            <AvatarImage src={row.original.image} />
          </Avatar>
          <p>{name}</p>
        </div>
      );
    },
  },
  {
    accessorKey: "staff.role",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Role
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const role = row.original.staff?.role ?? "User";

      return <p>{role}</p>;
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
      const banned = row.original.banned;

      return (
        <Badge
          className={
            banned
              ? "bg-red-500 hover:bg-red-700"
              : "bg-green-500 hover:bg-green-700"
          }
        >
          {banned ? "Banned" : "Not Banned"}
        </Badge>
      );
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
          Joined At
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const formattedDate = new Date(row.original.createdAt).toDateString();

      return <p>{formattedDate}</p>;
    },
  },
  {
    id: "actions",
    cell: ({ row, table }) => {
      const viewingUserRole = (table.options.meta as { activeUserRole: Role })
        ?.activeUserRole;
      return (
        <ActionsMenu user={row.original} activeUserRole={viewingUserRole} />
      );
    },
  },
];

const ActionsMenu = ({
  user,
  activeUserRole,
}: {
  user: BasicUser;
  activeUserRole: Role;
}) => {
  const isMobile = useIsMobile();

  return (
    <>
      {isMobile ? (
        <DrawerActions user={user} activeUserRole={activeUserRole} />
      ) : (
        <Dropdown user={user} activeUserRole={activeUserRole} />
      )}
    </>
  );
};
