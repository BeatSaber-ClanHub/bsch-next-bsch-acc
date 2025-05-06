import { APIResponse } from "@/app/api/types/core/api";
import { EnrichedClanMember } from "@/data-access/member";
import { ClanStaff, ClanStaffRole } from "@/prisma/generated/prisma/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "../use-toast";

interface RoleUnassignmentRequest {
  userId: string;
  callback?: () => void;
}

const useClanRoleUnassignment = (clanId: string) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const mutation = useMutation<
    APIResponse<ClanStaff>,
    Error,
    RoleUnassignmentRequest
  >({
    mutationFn: async ({ userId }: RoleUnassignmentRequest) => {
      const response = await fetch(
        `/api/clan/${clanId}/member/${userId}/role/unassign`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const responseJSON: APIResponse<ClanStaff> = await response.json();
      if (!response.ok) {
        throw responseJSON;
      }
      return responseJSON;
    },
    onSuccess: (updatedUser) => {
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
                  if (member.user.id === updatedUser.data?.userId) {
                    return {
                      ...member,
                      role: updatedUser.data.role,
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
    },
    onError: (error, vars) => {
      const { callback } = vars;
      if (callback !== undefined) {
        callback();
      }

      let errorMessage = "Failed to update member!";
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

export default useClanRoleUnassignment;
