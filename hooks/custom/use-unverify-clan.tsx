import { APIResponse } from "@/app/api/types/core/api";
import { ClanWithClanOwnerInfoAndBasicData } from "@/data-access/clan";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "../use-toast";
import { useRouter } from "next/navigation";

export interface UseUnverifyClanProps {
  clanId: string;
  onSuccess?: (params?: unknown) => void;
}

const useUnverifyClan = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const router = useRouter();
  const mutation = useMutation<
    APIResponse<ClanWithClanOwnerInfoAndBasicData>,
    Error,
    UseUnverifyClanProps
  >({
    mutationFn: async ({ clanId }: UseUnverifyClanProps) => {
      const response = await fetch(
        `/api/clan/${clanId}/verification/unverify`,
        {
          method: "POST",
        }
      );
      const responseJSON: APIResponse<ClanWithClanOwnerInfoAndBasicData> =
        await response.json();

      if (!response.ok) throw responseJSON;

      return responseJSON;
    },
    onSuccess: (unverifiedClan, { clanId, onSuccess }) => {
      const allQueries = queryClient.getQueryCache().getAll();

      const updateAllClans = async () => {
        allQueries.forEach(({ queryKey }) => {
          if (Array.isArray(queryKey) && queryKey[0] === "all_clans") {
            queryClient.setQueryData(
              queryKey,
              (oldData: APIResponse<ClanWithClanOwnerInfoAndBasicData>) => {
                if (!oldData) return oldData;
                const updatedClans = oldData.items?.map((clan, index) => {
                  if (clan.id === clanId) {
                    return {
                      ...clan,
                      application_status: "None",
                    };
                  }
                  return clan;
                });
                return { ...oldData, items: updatedClans };
              }
            );
          }
        });
      };
      updateAllClans();

      if (onSuccess !== undefined) {
        onSuccess();
      }
      toast({
        title: "Clan unverified!",
        description: "This clan has been unverified.",
      });
      router.refresh();
    },
    onError: (error) => {
      let errorMessage = "Failed to unverify clan!";
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

export default useUnverifyClan;
