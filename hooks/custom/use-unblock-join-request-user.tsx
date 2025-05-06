import { APIResponse } from "@/app/api/types/core/api";
import { ClanJoinRequestWithUserData } from "@/data-access/clan-join-request";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "../use-toast";

const useUnblockJoinRequestUser = (clanId: string) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const mutation = useMutation<
    APIResponse<ClanJoinRequestWithUserData>,
    Error,
    {
      clanId: string;
      requestId: string;
      onSuccess: (params?: unknown) => void;
    }
  >({
    mutationFn: async ({
      clanId,
      requestId,
    }: {
      clanId: string;
      requestId: string;
    }) => {
      try {
        const response = await fetch(
          `/api/clan/${clanId}/join/request/${requestId}/unblock`,
          {
            method: "POST",
          }
        );
        const responseJSON: APIResponse<ClanJoinRequestWithUserData> =
          await response.json();
        if (!response.ok) {
          // Throw a proper error with a meaningful message
          throw new Error(responseJSON.message || "Failed to unblock user");
        }

        return responseJSON;
      } catch (error) {
        throw error;
      }
    },
    onSuccess: (newMember, vars) => {
      const updateBlockedMembersPage = async () => {
        const allQueries = queryClient.getQueryCache().getAll();
        allQueries.forEach(({ queryKey }) => {
          if (
            Array.isArray(queryKey) &&
            queryKey[0] === "clan_blocked_join_requests" &&
            queryKey[1] === clanId
          ) {
            queryClient.setQueryData(
              queryKey,
              (oldData: {
                pageParams: Array<number>;
                pages: Array<APIResponse<ClanJoinRequestWithUserData>>;
              }) => {
                if (!oldData) return undefined;
                const updatedPages = oldData.pages.map((page) => {
                  const updatedItems = page.items?.filter((joinRequest) => {
                    if (joinRequest.userId !== newMember.data?.user.id) {
                      return joinRequest;
                    }
                  });
                  return { ...page, items: updatedItems };
                });

                return { ...oldData, pages: updatedPages };
              }
            );
          }
        });
      };
      updateBlockedMembersPage();

      toast({
        title: "User unblocked!",
        description: "This user can submit join requests again.",
      });
      if (vars.onSuccess !== undefined) {
        vars.onSuccess();
      }
    },
    onError: (error) => {
      let errorMessage = "Failed to unblock join request!";
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

export default useUnblockJoinRequestUser;
