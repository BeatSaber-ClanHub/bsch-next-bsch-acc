import { APIResponse } from "@/app/api/types/core/api";
import { BasicUser } from "@/data-access/user";
import { Role, Staff } from "@/prisma/generated/prisma/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "../use-toast";

interface RoleUnssignmentRequest {
  userId: string;
  callback?: () => void;
}

const useSiteRoleUnassignment = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const mutation = useMutation<
    APIResponse<Staff>,
    Error,
    RoleUnssignmentRequest
  >({
    mutationFn: async ({ userId }: RoleUnssignmentRequest) => {
      const response = await fetch(`/api/user/${userId}/role/unassign`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const responseJSON: APIResponse<Staff> = await response.json();
      if (!response.ok) {
        throw responseJSON;
      }
      return responseJSON;
    },
    onSuccess: (updatedUser) => {
      const updateCacheForPages = async () => {
        const allQueries = queryClient.getQueryCache().getAll();
        allQueries.forEach(({ queryKey }) => {
          if (Array.isArray(queryKey) && queryKey[0] === "all_users") {
            queryClient.setQueryData(
              queryKey,
              (oldData: APIResponse<BasicUser>) => {
                if (!oldData) return oldData;
                console.log(oldData);
                const updatedItems = oldData.items?.map((user) => {
                  if (user.id === updatedUser.data?.userId) {
                    return {
                      ...user,
                      staff: {
                        role: updatedUser.data.role,
                      },
                    };
                  }
                  return user;
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

      let errorMessage = "Failed to update user!";
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

export default useSiteRoleUnassignment;
