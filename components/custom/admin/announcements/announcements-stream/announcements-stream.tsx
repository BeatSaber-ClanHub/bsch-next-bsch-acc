"use client";
import { APIResponse } from "@/app/api/types/core/api";
import Announcement from "@/components/custom/admin/announcements/announcement/announcement";
import { Spinner } from "@/components/minimal-tiptap/components/spinner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { WebsiteAnnouncementWithPosterUserData } from "@/data-access/website-announcement";
import { useIsMobile } from "@/hooks/use-mobile";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";

const AnnouncementsStream = () => {
  const { ref, inView } = useInView();
  const [hasNextPage, setHasNextPage] = useState(true);
  const [loading, setLoading] = useState("");
  const isMobile = useIsMobile();

  const fetchAnnouncements = async ({
    pageParam,
  }: {
    pageParam: number;
  }): Promise<APIResponse<WebsiteAnnouncementWithPosterUserData>> => {
    const res = await fetch(
      `/api/website/announcements?offset=${pageParam}&limit=2`
    );
    if (!res.ok) throw await res.json();
    return await res.json();
  };

  const {
    data,
    fetchNextPage,
    isFetchingNextPage,
    status,
    isFetching,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["announcements"],
    queryFn: fetchAnnouncements,
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      const nextOffset = lastPage.metadata!.offset + lastPage.metadata!.limit;
      return nextOffset < lastPage.metadata!.count ? nextOffset : undefined;
    },
    refetchOnWindowFocus: false,
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
    return (
      <Alert>
        <AlertCircle />
        <AlertTitle>There was an issue.</AlertTitle>
        <AlertDescription>
          Something went wrong and we failed to retrieve banned clans.
        </AlertDescription>
      </Alert>
    );
  }

  if (isFetching && !isFetchingNextPage) {
    return (
      <div className="w-full flex items-center justify-center">
        <Spinner className="w-[15px]" />
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-4">
      {data?.pages.map((page) => {
        return (
          <div className="flex flex-col gap-4" key={page.metadata?.offset}>
            {page.items?.map((announcement) => {
              return (
                <Announcement
                  announcement={announcement}
                  key={announcement.id}
                />
              );
            })}
          </div>
        );
      })}
      <div />
      <div ref={ref}></div>
      {isFetchingNextPage && (
        <div className="w-full flex items-center justify-center">
          <Spinner className="w-[15px]" />
        </div>
      )}
    </div>
  );
};

export default AnnouncementsStream;
