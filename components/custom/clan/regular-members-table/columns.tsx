"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Copy, MoreHorizontal } from "lucide-react";

import CopyText from "@/components/custom/general-website/copy-text";
import { Spinner } from "@/components/minimal-tiptap/components/spinner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EnrichedClanMember } from "@/data-access/member";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export const columns: ColumnDef<EnrichedClanMember>[] = [
  {
    accessorKey: "user",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Username
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    filterFn: (row, columnId, filterValue) => {
      const user = row.original.user;
      const name = user?.name ?? "";
      return name.toLowerCase().includes(filterValue.toLowerCase());
    },
    cell: ({ row }) => {
      const user = row.original;
      const image = user.user.image;
      const name = user.user.name;

      return (
        <div className="flex items-center gap-4">
          <Avatar>
            <AvatarFallback>
              <Spinner />
            </AvatarFallback>
            <AvatarImage src={image} />
          </Avatar>
          <p>{name}</p>
        </div>
      );
    },
  },
  {
    accessorKey: "role",
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
      const user = row.original;
      const viewingUserId = (table.options.meta as { viewingUserId: string })
        ?.viewingUserId;

      const isSelf = user.user.id === viewingUserId;
      if (isSelf) return null;
      return <DropdownWithReport member={user} />;
    },
  },
];

export const DropdownWithReport = ({
  member,
}: {
  member: EnrichedClanMember;
}) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { toast } = useToast();

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const openReportDialog = () => {
    setIsDialogOpen(true);
  };

  const closeReportDialog = () => {
    setIsDialogOpen(false);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <CopyText textToCopy={member.user.id}>
            <DropdownMenuItem>
              <Copy />
              Copy user ID
            </DropdownMenuItem>
          </CopyText>
          <DropdownMenuItem onClick={openReportDialog}>
            Report User
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report User</DialogTitle>
            <DialogDescription>
              If you believe that someone has violated the TOS, please report
              them. All reports are viewed by BSCH staff.
            </DialogDescription>
          </DialogHeader>
          <Button onClick={closeReportDialog} type="button">
            Close
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
};
