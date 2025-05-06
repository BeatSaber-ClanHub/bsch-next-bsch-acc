import { APIResponse } from "@/app/api/types/core/api";
import announcementSchema from "@/app/validation-schemas/announcement/announcement-schema";
import { WebsiteAnnouncementWithPosterUserData } from "@/data-access/website-announcement";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

const useCreateAnnouncement = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const mutation = useMutation<
    APIResponse<WebsiteAnnouncementWithPosterUserData>,
    Error,
    z.infer<typeof announcementSchema> & { callback?: () => void }
  >({
    mutationFn: async (data: z.infer<typeof announcementSchema>) => {
      const response = await fetch(`/api/website/announcement`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const responseJSON: APIResponse<WebsiteAnnouncementWithPosterUserData> =
        await response.json();
      if (!response.ok) {
        throw responseJSON;
      }
      return responseJSON;
    },
    onSuccess: (newAnnouncement, vars) => {
      const updateAdminAnnouncementsPage = async () => {
        const allQueries = queryClient.getQueryCache().getAll();
        allQueries.forEach(({ queryKey }) => {
          if (Array.isArray(queryKey) && queryKey[0] === "announcements") {
            queryClient.setQueryData(
              queryKey,
              (oldData: {
                pageParams: Array<number>;
                pages: Array<
                  APIResponse<WebsiteAnnouncementWithPosterUserData>
                >;
              }) => {
                if (!oldData) return oldData;
                const updatedPages = oldData.pages?.map((page, i) => {
                  if (i > 0) return page;
                  const newAnnouncementData =
                    newAnnouncement.data as WebsiteAnnouncementWithPosterUserData;

                  const updatedItems: Array<WebsiteAnnouncementWithPosterUserData> =
                    [newAnnouncementData, ...(page?.items ? page.items : [])];

                  return {
                    ...page,
                    items: updatedItems,
                  };
                });
                return { ...oldData, pages: updatedPages };
              }
            );
          }
        });
      };

      updateAdminAnnouncementsPage();
      const { callback } = vars;
      if (callback !== undefined) {
        callback();
      }

      toast({
        title: "Announcement created!",
        description: "This announcement has been added.",
      });
    },

    onError: (error, vars) => {
      let errorMessage = "Failed to create announcement!";
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

export default useCreateAnnouncement;
