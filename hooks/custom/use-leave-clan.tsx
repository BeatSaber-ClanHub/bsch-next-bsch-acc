import { APIResponse } from "@/app/api/types/core/api";
import { EnrichedClanMember } from "@/data-access/member";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

const useLeaveClan = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const mutation = useMutation<
    APIResponse<EnrichedClanMember>,
    Error,
    { clanId: string; onSuccess?: () => void }
  >({
    mutationFn: async ({ clanId }: { clanId: string }) => {
      const response = await fetch(`/api/clan/${clanId}/leave`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

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
        title: "Left clan!",
        description: "You have left this clan!",
      });
      router.refresh();
    },
    onError: (error) => {
      let errorMessage = "Failed to leave clan!";
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

export default useLeaveClan;
