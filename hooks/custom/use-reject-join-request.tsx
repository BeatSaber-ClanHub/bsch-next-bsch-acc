import { APIResponse } from "@/app/api/types/core/api";
import { ClanJoinRequestWithUserData } from "@/data-access/clan-join-request";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface Props {
  clanId: string;
  requestId: string;
  onSuccess: (params?: unknown) => void;
  allowAnotherApplication: boolean;
}
const useRejectJoinRequest = (clanId: string) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const mutation = useMutation<
    APIResponse<ClanJoinRequestWithUserData>,
    Error,
    Props
  >({
    mutationFn: async ({
      clanId,
      requestId,
      allowAnotherApplication,
    }: Props) => {
      const response = await fetch(
        `/api/clan/${clanId}/join/request/${requestId}/reject`,
        {
          method: "POST",
          body: JSON.stringify({
            allowAnotherApplication: allowAnotherApplication,
          }),
        }
      );
      const responseJSON: APIResponse<ClanJoinRequestWithUserData> =
        await response.json();
      if (!response.ok) {
        throw responseJSON;
      }
      return responseJSON;
    },
    onSuccess: (newMember, vars) => {
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
      if (!newMember.data?.allowAnotherApplication) {
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
                  const updatedPages = oldData.pages.map((page, index) => {
                    if (index !== 0) return;
                    const updatedItems = [
                      newMember.data,
                      ...(page.items ?? []),
                    ];
                    return { ...page, items: updatedItems };
                  });

                  return { ...oldData, pages: updatedPages };
                }
              );
            }
          });
        };

        updateBlockedMembersPage();
      }
      updateJoinRequestsPage();
      toast({
        title: "Request Rejected!",
        description: "This request has been rejected.",
      });
      if (vars.onSuccess !== undefined) {
        vars.onSuccess();
      }
    },
    onError: (error) => {
      let errorMessage = "Failed to accept reject request!";
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

export default useRejectJoinRequest;
