import { APIResponse } from "@/app/api/types/core/api";
import { EnrichedClanBan } from "@/data-access/clan-ban";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "../use-toast";
import { EnrichedBanAppeal } from "@/data-access/types/types";
import { ClanWithClanOwnerInfoAndBasicData } from "@/data-access/clan";

export interface UseClanUnbanProps {
  clanId: string;
  onSuccess?: (params?: unknown) => void;
}

const useUnbanClan = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const mutation = useMutation<
    APIResponse<EnrichedClanBan>,
    Error,
    UseClanUnbanProps
  >({
    mutationFn: async ({ clanId }: UseClanUnbanProps) => {
      const response = await fetch(`/api/clan/${clanId}/unban`, {
        method: "POST",
      });

      const responseJSON: APIResponse<EnrichedClanBan> = await response.json();

      if (!response.ok) throw responseJSON;

      return responseJSON;
    },
    onSuccess: (unbannedClan, { clanId, onSuccess }) => {
      const allQueries = queryClient.getQueryCache().getAll();
      const removeFromBannedClans = async () => {
        allQueries.forEach(({ queryKey }) => {
          if (Array.isArray(queryKey) && queryKey[0] === "clan_banned") {
            queryClient.setQueryData(
              queryKey,
              (oldData: {
                pageParams: Array<number>;
                pages: Array<APIResponse<EnrichedClanBan>>;
              }) => {
                if (!oldData) return oldData;
                const updatedPages = oldData.pages.map((page, index) => {
                  const updatedItems = page.items?.filter((bannedClan) => {
                    if (bannedClan.clan.id !== unbannedClan.data!.id) {
                      return unbannedClan.data;
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
      const updateReportedClans = async () => {
        allQueries.forEach(({ queryKey }) => {
          if (Array.isArray(queryKey) && queryKey[0] === "clan_reported") {
            queryClient.setQueryData(
              queryKey,
              (oldData: {
                pageParams: Array<number>;
                pages: Array<APIResponse<EnrichedClanBan>>;
              }) => {
                if (!oldData) return undefined;
                const updatedPages = oldData.pages.map((page) => {
                  const updatedItems = page.items?.map((report) => {
                    if (report.clanId === unbannedClan.data!.id) {
                      return {
                        ...report,
                        clan: {
                          ...report.clan,
                          banned: false,
                        },
                      };
                    }
                    return report;
                  });
                  return { ...page, items: updatedItems };
                });

                return { ...oldData, pages: updatedPages };
              }
            );
          }
        });
      };
      const updateClanBanAppeals = async () => {
        allQueries.forEach(({ queryKey }) => {
          if (Array.isArray(queryKey) && queryKey[0] === "clan_ban_appeals") {
            queryClient.setQueryData(
              queryKey,
              (oldData: {
                pageParams: Array<number>;
                pages: Array<APIResponse<EnrichedBanAppeal>>;
              }) => {
                if (!oldData) return undefined;
                const updatedPages = oldData.pages.map((page) => {
                  // Return all the clans that are not unbanned
                  const updatedItems = page.items?.filter((appeal) => {
                    if (appeal.clan.id !== unbannedClan.data!.id) {
                      return appeal;
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
                      banned: false,
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
      removeFromBannedClans();
      updateReportedClans();
      updateClanBanAppeals();
      updateAllClans();

      if (onSuccess !== undefined) {
        onSuccess();
      }
      toast({
        title: "Clan unbanned!",
        description: "This clan has been unbanned.",
      });
    },
    onError: (error) => {
      let errorMessage = "Failed to unban clan!";
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

export default useUnbanClan;
