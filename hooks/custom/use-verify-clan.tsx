import { APIResponse } from "@/app/api/types/core/api";
import { ClanWithClanOwnerInfoAndBasicData } from "@/data-access/clan";
import { ClanVerificationApplicationWithUsersAndClan } from "@/data-access/clan-verification-application";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useToast } from "../use-toast";

export interface UseVerifyClanProps {
  clanId: string;
  onSuccess?: (params?: unknown) => void;
}

const useVerifyClan = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const router = useRouter();
  const mutation = useMutation<
    APIResponse<ClanWithClanOwnerInfoAndBasicData>,
    Error,
    UseVerifyClanProps
  >({
    mutationFn: async ({ clanId }: UseVerifyClanProps) => {
      const response = await fetch(`/api/clan/${clanId}/verification/verify`, {
        method: "POST",
      });
      const responseJSON: APIResponse<ClanWithClanOwnerInfoAndBasicData> =
        await response.json();

      if (!response.ok) throw responseJSON;

      return responseJSON;
    },
    onSuccess: (verifiedClan, { clanId, onSuccess }) => {
      const allQueries = queryClient.getQueryCache().getAll();
      const removeFromVerificationApplications = async () => {
        allQueries.forEach(({ queryKey }) => {
          if (Array.isArray(queryKey) && queryKey[0] === "clan_applications") {
            queryClient.setQueryData(
              queryKey,
              (oldData: {
                pageParams: Array<number>;
                pages: Array<
                  APIResponse<ClanVerificationApplicationWithUsersAndClan>
                >;
              }) => {
                if (!oldData) return oldData;
                const updatedPages = oldData.pages.map((page, index) => {
                  const updatedItems = page.items?.filter((applicationClan) => {
                    if (applicationClan.clan.id !== verifiedClan.data!.id) {
                      return verifiedClan.data;
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
                      application_status: "Approved",
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
      removeFromVerificationApplications();
      updateAllClans();

      if (onSuccess !== undefined) {
        onSuccess();
      }
      toast({
        title: "Clan verified!",
        description: "This clan has been verified.",
      });
      router.refresh();
    },
    onError: (error) => {
      let errorMessage = "Failed to verify clan!";
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

export default useVerifyClan;
