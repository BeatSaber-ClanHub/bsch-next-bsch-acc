import { APIResponse } from "@/app/api/types/core/api";
import announcementSchema from "@/app/validation-schemas/announcement/announcement-schema";
import { WebsiteAnnouncementWithPosterUserData } from "@/data-access/website-announcement";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

type AnnouncementEditProps = {
  id: string;
  data: z.infer<typeof announcementSchema>;
  callback?: () => void;
};
const useUpdateAnnouncement = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const mutation = useMutation<
    APIResponse<WebsiteAnnouncementWithPosterUserData>,
    Error,
    AnnouncementEditProps
  >({
    mutationFn: async (data: AnnouncementEditProps) => {
      const response = await fetch(`/api/website/announcement/${data.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data.data),
      });

      const responseJSON: APIResponse<WebsiteAnnouncementWithPosterUserData> =
        await response.json();
      if (!response.ok) {
        throw responseJSON;
      }
      return responseJSON;
    },
    onSuccess: (updatedAnnouncement, vars) => {
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
                  const updatedItems = page.items?.map((announcement) => {
                    if (announcement.id === updatedAnnouncement.data!.id) {
                      return updatedAnnouncement.data;
                    }
                    return announcement;
                  });
                  return { ...page, items: updatedItems };
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
        title: "Announcement updated!",
        description: "This announcement has been updated.",
      });
    },

    onError: (error, vars) => {
      let errorMessage = "Failed to update announcement!";
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

export default useUpdateAnnouncement;
