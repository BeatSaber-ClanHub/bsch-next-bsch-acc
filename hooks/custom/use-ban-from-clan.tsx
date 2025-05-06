import { APIResponse } from "@/app/api/types/core/api";
import { BanRequest } from "@/components/custom/clan/admin-members-table/types";
import { EnrichedClanMember } from "@/data-access/member";
import { UserBan } from "@/prisma/generated/prisma/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "../use-toast";

const useBanFromClan = (clanId: string) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const mutation = useMutation<APIResponse<UserBan>, Error, BanRequest>({
    mutationFn: async ({ justification, clanId, userId }: BanRequest) => {
      const response = await fetch(`/api/clan/${clanId}/member/${userId}/ban`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ justification: justification }),
      });

      const responseJSON: APIResponse<UserBan> = await response.json();
      if (!response.ok) {
        throw responseJSON;
      }
      return responseJSON;
    },
    onSuccess: (bannedUser, vars) => {
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
                  if (member.user.id === bannedUser.data?.userId) {
                    return {
                      ...member,
                      banned: true,
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

      const { onSuccess } = vars;
      if (onSuccess !== undefined) {
        onSuccess();
      }
      toast({
        title: "User banned!",
        description: "This user has been banned.",
      });
    },
    onError: (error) => {
      let errorMessage = "Failed to ban member!";
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
    },
  });

  return mutation;
};

export default useBanFromClan;
