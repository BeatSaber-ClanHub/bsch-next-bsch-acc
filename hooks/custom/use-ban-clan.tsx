import { APIResponse } from "@/app/api/types/core/api";
import { banClanSchema } from "@/app/validation-schemas/ban/ban-clan";
import { EnrichedClanBan } from "@/data-access/clan-ban";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { useToast } from "../use-toast";
import { ClanWithClanOwnerInfoAndBasicData } from "@/data-access/clan";
import { ClanVerificationApplicationWithUsersAndClan } from "@/data-access/clan-verification-application";

export interface UseBanClanProps extends z.infer<typeof banClanSchema> {
  clanId: string;
  onSuccess?: (params?: unknown) => void;
}

const useBanClan = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const mutation = useMutation<
    APIResponse<EnrichedClanBan>,
    Error,
    UseBanClanProps
  >({
    mutationFn: async ({
      clanId,
      justification,
      allowAppealAt,
      permanent,
    }: UseBanClanProps) => {
      const response = await fetch(`/api/clan/${clanId}/ban`, {
        method: "POST",
        body: JSON.stringify({
          justification: justification,
          permanent: permanent,
          allowAppealAt: allowAppealAt,
        }),
      });

      const responseJSON: APIResponse<EnrichedClanBan> = await response.json();

      if (!response.ok) throw responseJSON;

      return responseJSON;
    },
    onSuccess: (bannedClan, { clanId, onSuccess }) => {
      const allQueries = queryClient.getQueryCache().getAll();
      const addToBannedClansCache = async () => {
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
                  if (index === 0) {
                    return {
                      ...page,
                      items: [...(page.items || []), bannedClan.data],
                    };
                  }
                  return page;
                });
                return { ...oldData, pages: updatedPages };
              }
            );
          }
        });
      };
      const removeFromClanReports = async () => {
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
                  // const updatedItems = page.items?.map((report) => {
                  //   if (report.clanId === bannedClan.data?.clanId) {
                  //     return {
                  //       ...report,
                  //       clan: {
                  //         ...report.clan,
                  //         banned: true,
                  //       },
                  //     };
                  //   }
                  //   return report;
                  // });
                  const updatedItems = page.items?.filter((report) => {
                    if (report.clanId !== clanId) {
                      return report;
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
                  if (clan.id === bannedClan.data?.clanId) {
                    return {
                      ...clan,
                      banned: true,
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
                    if (applicationClan.clan.id !== clanId) {
                      return bannedClan.data;
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
      addToBannedClansCache();
      removeFromClanReports();
      updateAllClans();
      removeFromVerificationApplications();

      if (onSuccess !== undefined) {
        onSuccess();
      }
      toast({
        title: "Clan banned!",
        description: "This clan has been banned.",
      });
    },
    onError: (error) => {
      let errorMessage = "Failed to ban clan!";
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

export default useBanClan;
