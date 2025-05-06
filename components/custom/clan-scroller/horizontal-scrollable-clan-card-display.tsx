"use client";

import { APIResponse } from "@/app/api/types/core/api";
import ClanCard from "@/components/custom/clan-card/clan-card";
import ClanCardsLoading from "@/components/custom/clan-card/clan-cards-loading/clan-cards-loading";
import ClansLoadingError from "@/components/custom/clans/clans-loading-error";
import NoClansFound from "@/components/custom/no-clans-found";
import { ClanWithClanOwnerInfoAndBasicData } from "@/data-access/clan";
import { Clan } from "@/prisma/generated/prisma/client";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";

const HorizontalScrollableClanCardDisplay = ({
  apiRoute,
  queryKey,
  callback = null,
  target = "_parent",
}: {
  apiRoute: string;
  queryKey: Array<string>;
  callback?: ((response: APIResponse<Clan>) => void) | null;
  target?: React.HTMLAttributeAnchorTarget | undefined;
}) => {
  const { ref, inView } = useInView();

  const fetchClans = async ({
    pageParam,
  }: {
    pageParam: number;
  }): Promise<APIResponse<ClanWithClanOwnerInfoAndBasicData>> => {
    const res = await fetch(`${apiRoute}?offset=${pageParam}`);
    if (!res.ok) {
      throw new Error(`HTTP error! Status: ${res.status}`);
    }
    const data = await res.json();
    if (callback !== null) callback(data);
    return data;
  };

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } =
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
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [fetchNextPage, inView, hasNextPage]);

  if (status === "error") {
    return <ClansLoadingError />;
  }
  if (status === "pending") {
    return <ClanCardsLoading />;
  }
  if (!data.pages[0].items || data.pages[0].items.length === 0) {
    return <NoClansFound />;
  }

  return (
    <div className="flex gap-4">
      {data.pages.map((page) => (
        <div key={page.metadata?.offset} className="flex gap-4 overflow-x-auto">
          {page.items!.map((clan) => (
            <ClanCard key={clan.id} clan={clan} target={target} />
          ))}
        </div>
      ))}
      {isFetchingNextPage && (
        <div className="flex gap-4">
          <ClanCardsLoading />
        </div>
      )}
      <div ref={ref} />
    </div>
  );
};

export default HorizontalScrollableClanCardDisplay;
