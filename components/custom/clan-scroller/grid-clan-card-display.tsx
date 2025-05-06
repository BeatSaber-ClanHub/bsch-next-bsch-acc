"use client";

import { APIResponse } from "@/app/api/types/core/api";
import ClanCard from "@/components/custom/clan-card/clan-card";
import ClanCardsLoading from "@/components/custom/clan-card/clan-cards-loading/clan-cards-loading";
import ClansLoadingError from "@/components/custom/clans/clans-loading-error";
import NoClansFound from "@/components/custom/no-clans-found";
import { ClanWithClanOwnerInfoAndBasicData } from "@/data-access/clan";
import generateUrl from "@/utils/generateUrl";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";

const GridClanCardDisplay = ({
  apiHost = process.env.NEXT_PUBLIC_SERVER_URL,
  apiRoute,
  queryKey,
  queryParams = null,
}: {
  apiHost?: string;
  apiRoute: string;
  queryKey: Array<string>;
  queryParams?: Record<string, string | Array<string>> | null;
}) => {
  const { ref, inView } = useInView();
  const [hasNextPage, setHasNextPage] = useState(true);

  const fetchClans = async ({
    pageParam,
  }: {
    pageParam: number;
  }): Promise<APIResponse<ClanWithClanOwnerInfoAndBasicData>> => {
    const url = generateUrl(apiHost + apiRoute, {
      offset: pageParam,
      ...queryParams,
    });
    const res = await fetch(url);
    return await res.json();
  };

  const { data, fetchNextPage, isFetchingNextPage, status, isFetching } =
    useInfiniteQuery({
      queryKey: queryKey,
      queryFn: fetchClans,
      initialPageParam: 0,
      getNextPageParam: (lastPage) => {
        const nextOffset = lastPage.metadata!.offset + lastPage.metadata!.limit;
        return nextOffset < lastPage.metadata!.count ? nextOffset : undefined;
      },
    });

  useEffect(() => {
    if (data?.pages) {
      const lastPage = data.pages[data.pages.length - 1];
      setHasNextPage(lastPage.metadata?.pagination.next ?? false);
    }
  }, [data]);

  useEffect(() => {
    if (inView && hasNextPage && !isFetching && hasNextPage) {
      fetchNextPage();
    }
  }, [fetchNextPage, inView, hasNextPage, isFetching]);

  if (status === "error") {
    return <ClansLoadingError />;
  }
  if (status === "pending") {
    return (
      <div className="flex flex-row flex-wrap gap-4 justify-center">
        <ClanCardsLoading orientation="vertical" />
      </div>
    );
  }
  if (!data.pages[0].items || data.pages[0].items.length === 0) {
    return <NoClansFound />;
  }

  return (
    <div className="flex sm:gap-4 flex-col mb-[400px]">
      {data.pages.map((page) => (
        <div
          key={page.metadata?.offset}
          className="flex sm:gap-4 flex-wrap justify-center gap-y-4 w-full"
        >
          {page.items!.map((clan) => (
            <ClanCard
              key={clan.id}
              clan={clan}
              className="w-full sm:w-[300px]"
            />
          ))}
        </div>
      ))}
      {isFetchingNextPage && (
        <div className="flex gap-4 justify-center w-full">
          <ClanCardsLoading />
        </div>
      )}
      <div ref={ref} />
    </div>
  );
};

export default GridClanCardDisplay;
