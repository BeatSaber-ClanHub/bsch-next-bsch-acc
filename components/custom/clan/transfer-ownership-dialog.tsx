"use client";
import { APIResponse } from "@/app/api/types/core/api";
import { Spinner } from "@/components/minimal-tiptap/components/spinner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { ClanWithClanOwnerInfo } from "@/data-access/clan";
import { EnrichedClanMember } from "@/data-access/member";
import { useToast } from "@/hooks/use-toast";
import { User } from "@/prisma/generated/prisma/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowDown, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { Dispatch, SetStateAction, useState } from "react";

const TransferOwnershipDialog = ({
  setOpen,
  open,
  newOwner,
  currentOwner,
  clanId,
}: {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  currentOwner: Pick<User, "id" | "name" | "image">;
  newOwner: Pick<User, "id" | "name" | "image">;
  clanId: string;
}) => {
  const [isChecked, setIsChecked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const queryClient = useQueryClient();
  // Update members cache
  const mutation = useMutation<APIResponse<ClanWithClanOwnerInfo>, Error>({
    mutationFn: async () => {
      setIsLoading(true);
      const response = await fetch(
        `/api/clan/${clanId}/transferownership/${newOwner.id}`,
        {
          method: "POST",
        }
      );
      const responseJSON: APIResponse<ClanWithClanOwnerInfo> =
        await response.json();

      if (!response.ok) throw responseJSON;

      return responseJSON;
    },
    onSuccess: (updatedClan) => {
      const updateCacheForPages = async () => {
        const allQueries = queryClient.getQueryCache().getAll();
        allQueries.forEach(({ queryKey }) => {
          if (
            Array.isArray(queryKey) &&
            queryKey[0] === "members" &&
            queryKey[1] === clanId
          ) {
            queryClient.setQueryData(
              queryKey,
              (oldData: APIResponse<EnrichedClanMember>) => {
                if (!oldData) return oldData;
                const updatedItems = oldData.items?.map((member) => {
                  if (member.user.id === currentOwner.id) {
                    return {
                      ...member,
                      role: "Administrator",
                    };
                  } else if (member.user.id === updatedClan.data?.clan_owner) {
                    return {
                      ...member,
                      role: "Creator",
                    };
                  }
                  return member;
                });
                return { ...oldData, items: updatedItems };
              }
            );
          }
        });
      };

      updateCacheForPages();

      toast({
        title: "Ownership Transfered!",
        description: "Ownership has been transfered successfully!",
      });

      setOpen(false);
      setIsLoading(false);
      router.refresh();
    },
    onError: (error) => {
      let errorMessage = "Failed to transfer ownership!";
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
      setIsLoading(false);
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Transfer Clan Ownership</DialogTitle>
          <DialogDescription>
            Granting ownership gives the selected member complete control of the
            clan. This action is irreversible, and you must be certain of your
            choice. After the transfer, you will have administrative privileges.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-8 items-center justify-center">
          <div className="flex flex-col gap-4 sm:flex-row items-center justify-center">
            <div className="p-4 flex flex-col gap-4 border rounded-lg min-w-[150px] aspect-square items-center justify-center">
              <Avatar className="w-[80px] h-[80px]">
                <AvatarFallback>
                  <Skeleton className="w-[80px] h-[80px]" />
                </AvatarFallback>
                <AvatarImage src={currentOwner.image} />
              </Avatar>
              <div className="flex flex-col items-center">
                <p className="text-sm text-muted-foreground">Current Owner</p>
                <p>{currentOwner.name}</p>
              </div>
            </div>
            <div className="flex sm:hidden">
              <ArrowDown />
            </div>
            <div className="hidden sm:flex">
              <ArrowRight />
            </div>
            <div className="p-4 flex flex-col gap-4 border rounded-lg min-w-[150px] aspect-square items-center justify-center">
              <Avatar className="w-[80px] h-[80px]">
                <AvatarFallback>
                  <Skeleton className="w-[80px] h-[80px]" />
                </AvatarFallback>
                <AvatarImage src={newOwner.image} />
              </Avatar>
              <div className="flex flex-col items-center">
                <p className="text-sm text-muted-foreground">New Owner</p>
                <p>{newOwner.name}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="confirmation"
              onCheckedChange={(v: boolean) => setIsChecked(v)}
            />
            <label
              htmlFor="confirmation"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              I understand I am transfering ownership to{" "}
              <span className="font-extrabold">{newOwner.name}</span>
            </label>
          </div>
          <div className="flex gap-4 justify-end w-full items-end">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Close
            </Button>
            <Button
              variant="destructive"
              disabled={isLoading || !isChecked}
              onClick={() => mutation.mutateAsync()}
            >
              {isLoading && <Spinner />}Transfer
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TransferOwnershipDialog;
