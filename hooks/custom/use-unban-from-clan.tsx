import { APIResponse } from "@/app/api/types/core/api";
import { UnbanRequest } from "@/components/custom/clan/admin-members-table/types";
import { EnrichedClanMember } from "@/data-access/member";
import { UserBan } from "@/prisma/generated/prisma/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "../use-toast";

const useUnbanFromClan = (clanId: string) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const mutation = useMutation<APIResponse<UserBan>, Error, UnbanRequest>({
    mutationFn: async ({ clanId, userId }: UnbanRequest) => {
      const response = await fetch(
        `/api/clan/${clanId}/member/${userId}/unban`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const responseJSON: APIResponse<UserBan> = await response.json();
      if (!response.ok) {
        throw responseJSON;
      }
      return responseJSON;
    },
    onSuccess: (bannedUser) => {
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
                      banned: false,
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
        title: "User Unbanned!",
        description: "This user has been unbanned!",
      });
    },
    onError: (error) => {
      let errorMessage = "Failed to ban member!";
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
    },
  });

  return mutation;
};

export default useUnbanFromClan;
