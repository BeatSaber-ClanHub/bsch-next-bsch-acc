"use client";

import { ClanMember } from "@/data-access/types/types";
import { ColumnDef } from "@tanstack/react-table";
import { AlertCircle, ArrowUpDown, Copy, MoreHorizontal } from "lucide-react";

import banFromClanSchema from "@/app/validation-schemas/ban/ban-from-clan";
import { Spinner } from "@/components/minimal-tiptap/components/spinner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { ClanStaffRole, UserBan } from "@/prisma/generated/prisma/client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { APIResponse } from "../../../app/api/types/core/api";
import CopyText from "../general-website/copy-text";

export const columns: ColumnDef<ClanMember>[] = [
  {
    accessorKey: "name",
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
    filterFn: "auto",
    cell: ({ row }) => {
      const user = row.original;
      const image = user.image;
      const name = user.name;

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
      const viewingUserRole = (
        table.options.meta as { viewingUserRole: ClanStaffRole }
      )?.viewingUserRole;
      const viewingUserId = (table.options.meta as { viewingUserId: string })
        ?.viewingUserId;
      const clanId = (table.options.meta as { clanId: string })?.clanId;
      const queryKey = (
        table.options.meta as { queryKey: Array<string | number> }
      )?.queryKey;

      const updateCache = (
        table.options.meta as {
          updateCache: ({
            newData,
            queryKey,
          }: {
            newData: { id: string; banned: boolean };
            queryKey: Array<unknown>;
          }) => void;
        }
      )?.updateCache;

      const isSelf = user.id === viewingUserId;

      let canBan = false;

      if (viewingUserRole === "Creator") {
        // Creator can ban anyone
        canBan = true;
      } else if (viewingUserRole === "Administrator") {
        // Admin can ban Moderators or Members, but not other Admins or Creator
        if (user.role === "Moderator" || user.role === "Member") {
          canBan = true;
        } else {
          canBan = false;
        }
      } else {
        // Anyone else (including Moderators) cannot ban Admins or the Creator
        canBan = false;
      }

      return (
        <DropdownWithReport
          canBan={canBan}
          isSelf={isSelf}
          user={user}
          clanId={clanId}
          updateCache={updateCache}
          queryKey={queryKey}
        />
      );
    },
  },
];

export const DropdownWithReport = ({
  user,
  isSelf,
  canBan,
  clanId,
  updateCache,
  queryKey,
}: {
  user: ClanMember;
  isSelf: boolean;
  canBan: boolean;
  clanId: string;
  updateCache: ({
    newData,
    queryKey,
  }: {
    newData: { id: string; banned: boolean };
    queryKey: Array<string | number>;
  }) => void;
  queryKey: Array<string | number>;
}) => {
  const { toast } = useToast();

  const banUserForm = useForm({
    resolver: zodResolver(banFromClanSchema),
    defaultValues: {
      justification: "",
    },
  });

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [closeBanDialog_, setBanDialogOpen] = useState(false);

  const openReportDialog = () => {
    setIsDialogOpen(true);
  };

  const closeReportDialog = () => {
    setIsDialogOpen(false);
  };

  const openBanDialog = () => {
    setBanDialogOpen(true);
  };

  const closeBanDialog = () => {
    setBanDialogOpen(false);
  };

  async function banUser(data: z.infer<typeof banFromClanSchema>) {
    try {
      const response = await fetch(
        `/api/clan/${clanId}/member/${user.id}/ban`,
        {
          method: "POST",
          body: JSON.stringify(data),
        }
      );

      const responseJSON: APIResponse<UserBan> = await response.json();

      if (!response.ok) throw responseJSON;

      toast({
        title: "User Banned!",
        description: responseJSON.message,
      });

      updateCache({
        newData: {
          id: responseJSON.data!.userId as string,
          banned: true,
        },
        queryKey: queryKey,
      });

      closeBanDialog();
      banUserForm.reset();
    } catch (error) {
      let errorMessage = "Failed to ban user!";
      console.log(error);
      if (error instanceof TypeError) {
        errorMessage = "Something unexpected occured!";
      } else if (
        typeof error === "object" &&
        error !== null &&
        "message" in error
      ) {
        errorMessage = error.message as string;
      }

      toast({
        title: "Uh Oh!",
        description: errorMessage,
        variant: "destructive",
      });
    }
  }

  async function unbanUser() {
    try {
      const response = await fetch(
        `/api/clan/${clanId}/member/${user.id}/unban`,
        {
          method: "POST",
        }
      );
      console.log("unbanning user");

      const responseJSON: APIResponse<UserBan> = await response.json();

      if (!response.ok) throw responseJSON;

      updateCache({
        newData: {
          id: responseJSON.data!.userId as string,
          banned: false,
        },
        queryKey: queryKey,
      });
      toast({
        title: "User Unbanned!",
        description: responseJSON.message,
      });
    } catch (error) {
      let errorMessage = "Failed to unban user!";
      console.log(error);
      if (error instanceof TypeError) {
        errorMessage = "Something unexpected occured!";
      } else if (
        typeof error === "object" &&
        error !== null &&
        "message" in error
      ) {
        errorMessage = error.message as string;
      }

      toast({
        title: "Uh Oh!",
        description: errorMessage,
        variant: "destructive",
      });
    }
  }

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
          <CopyText textToCopy={user.id}>
            <DropdownMenuItem>
              <Copy />
              Copy user ID
            </DropdownMenuItem>
          </CopyText>
          <DropdownMenuSeparator />
          {!isSelf && canBan && user.banned === true && (
            <DropdownMenuItem onClick={unbanUser}>
              Unban Member
            </DropdownMenuItem>
          )}
          {!isSelf && canBan && user.banned === false && (
            <DropdownMenuItem onClick={openBanDialog}>
              Ban User
            </DropdownMenuItem>
          )}
          {!isSelf && <DropdownMenuItem>Remove from Clan</DropdownMenuItem>}
          {!isSelf && (
            <DropdownMenuItem onClick={openReportDialog}>
              <AlertCircle />
              Report User
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report User</DialogTitle>
            <DialogDescription>
              If you believe that someone has violated the TOS, please report
              them.
            </DialogDescription>
          </DialogHeader>
          <Button onClick={closeReportDialog} type="button">
            Close
          </Button>
        </DialogContent>
      </Dialog>

      <Dialog open={closeBanDialog_} onOpenChange={setBanDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ban User</DialogTitle>
          </DialogHeader>
          <Form {...banUserForm}>
            <form
              onSubmit={banUserForm.handleSubmit(banUser)}
              className="w-full space-y-6"
            >
              <FormField
                control={banUserForm.control}
                name="justification"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Justification</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Violated TOS..."
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Tell the user why you banned them.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex gap-4 justify-end ml-auto">
                <Button
                  onClick={closeBanDialog}
                  variant="outline"
                  type="button"
                >
                  Close
                </Button>
                <Button
                  type="submit"
                  disabled={banUserForm.formState.isSubmitting}
                >
                  {banUserForm.formState.isSubmitting && <Spinner />}Submit
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
};
