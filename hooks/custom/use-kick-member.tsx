import { APIResponse } from "@/app/api/types/core/api";
import { KickRequest } from "@/components/custom/clan/admin-members-table/types";
import { EnrichedClanMember } from "@/data-access/member";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const useKickMember = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const mutation = useMutation<
    APIResponse<EnrichedClanMember>,
    Error,
    KickRequest
  >({
    mutationFn: async ({ clanId, userId }: KickRequest) => {
      const response = await fetch(
        `/api/clan/${clanId}/member/${userId}/kick`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const responseJSON: APIResponse<EnrichedClanMember> =
        await response.json();
      if (!response.ok) {
        throw responseJSON;
      }
      return responseJSON;
    },
    onSuccess: (kickedMember, vars) => {
      const updateMembersPage = async () => {
        const allQueries = queryClient.getQueryCache().getAll();
        allQueries.forEach(({ queryKey }) => {
          if (
            Array.isArray(queryKey) &&
            queryKey[0] === "members" &&
            queryKey[1] === vars.clanId
          ) {
            queryClient.setQueryData(
              queryKey,
              (oldData: APIResponse<EnrichedClanMember>) => {
                if (!oldData) return oldData;
                const updatedItems = oldData.items?.filter((member) => {
                  if (member.user.id !== kickedMember.data?.userId) {
                    return member;
                  }
                });
                return { ...oldData, items: updatedItems };
              }
            );
          }
        });
      };

      updateMembersPage();

      const { onSuccess } = vars;
      if (onSuccess !== undefined) {
        onSuccess();
      }
      toast({
        title: "User kicked!",
        description: "This user has been kicked.",
      });
    },
    onError: (error) => {
      let errorMessage = "Failed to kick member!";
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

export default useKickMember;
