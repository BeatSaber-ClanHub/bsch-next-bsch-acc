import { APIResponse } from "@/app/api/types/core/api";
import { ClanJoinRequestWithUserData } from "@/data-access/clan-join-request";
import { EnrichedClanMember } from "@/data-access/member";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "../use-toast";

const useAcceptJoinRequest = (clanId: string) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const mutation = useMutation<
    APIResponse<EnrichedClanMember>,
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
      const response = await fetch(
        `/api/clan/${clanId}/join/request/${requestId}/accept`,
        {
          method: "POST",
        }
      );
      const responseJSON: APIResponse<EnrichedClanMember> =
        await response.json();
      if (!response.ok) {
        throw responseJSON;
      }
      return responseJSON;
    },
    onSuccess: (newMember, vars) => {
      const updateMembersPage = async () => {
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
                const items = oldData.items ?? [];
                const updatedItems = [...items, newMember.data];
                return { ...oldData, items: updatedItems };
              }
            );
          }
        });
      };

      const updateJoinRequestsPage = async () => {
        const allQueries = queryClient.getQueryCache().getAll();
        allQueries.forEach(({ queryKey }) => {
          if (
            Array.isArray(queryKey) &&
            queryKey[0] === "clan_join_requests" &&
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

      updateMembersPage();
      updateJoinRequestsPage();

      toast({
        title: "Request Accepted!",
        description: "This user is now a member of your clan.",
      });
      if (vars.onSuccess !== undefined) {
        vars.onSuccess();
      }
    },
    onError: (error) => {
      let errorMessage = "Failed to accept join request!";
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

export default useAcceptJoinRequest;
