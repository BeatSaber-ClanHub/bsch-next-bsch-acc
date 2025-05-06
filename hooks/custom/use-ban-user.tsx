import { APIResponse } from "@/app/api/types/core/api";
import { BasicUser } from "@/data-access/user";
import { UserBan } from "@/prisma/generated/prisma/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useToast } from "../use-toast";

type BanRequest = {
  userId: string;
  justification: string;
  onSuccess?: () => void;
};

const useBanUser = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const mutation = useMutation<APIResponse<UserBan>, Error, BanRequest>({
    mutationFn: async ({ justification, userId }: BanRequest) => {
      const response = await fetch(`/api/user/${userId}/ban`, {
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
          if (Array.isArray(queryKey) && queryKey[0] === "all_users") {
            queryClient.setQueryData(
              queryKey,
              (oldData: APIResponse<BasicUser>) => {
                if (!oldData) return oldData;
                const updatedItems = oldData.items?.map((user) => {
                  if (user.id === bannedUser.data!.userId) {
                    return {
                      ...user,
                      banned: true,
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
      router.refresh();
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
      let errorMessage = "Failed to ban user!";
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

export default useBanUser;
