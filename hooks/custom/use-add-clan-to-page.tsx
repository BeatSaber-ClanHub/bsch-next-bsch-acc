import { APIResponse } from "@/app/api/types/core/api";
import { ClanWithClanOwnerInfoAndBasicData } from "@/data-access/clan";
import { useQueryClient } from "@tanstack/react-query";

type InfiniteData<T> = {
  pages: T[];
  pageParams: unknown[];
};

const useAddClanToPage = () => {
  const queryClient = useQueryClient();

  return ({
    queryKey,
    newClan,
  }: {
    queryKey: string[];
    newClan: ClanWithClanOwnerInfoAndBasicData;
  }) => {
    queryClient.setQueryData<
      InfiniteData<APIResponse<ClanWithClanOwnerInfoAndBasicData>>
    >(queryKey, (oldData) => {
      if (!oldData) return oldData;
      return {
        ...oldData,
        pages: oldData.pages.map((page, i) => {
          if (i !== 0) return page;
          return {
            ...page,
            items: [newClan, ...(page.items ?? [])],
          };
        }),
      };
    });
  };
};

export default useAddClanToPage;
