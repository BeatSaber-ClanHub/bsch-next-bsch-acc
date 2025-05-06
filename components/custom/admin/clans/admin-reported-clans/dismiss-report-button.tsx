import { APIResponse } from "@/app/api/types/core/api";
import { Spinner } from "@/components/minimal-tiptap/components/spinner";
import { Button } from "@/components/ui/button";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { EnrichedClanReport } from "@/data-access/report";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Check } from "lucide-react";
import { SetStateAction, useState } from "react";

const DismissReportButton = ({
  reportId,
  setLoading = null,
  dropdownItem = false,
}: {
  reportId: string;
  setLoading?: React.Dispatch<SetStateAction<string>> | null;
  dropdownItem?: boolean;
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [load, setLoad] = useState(false);
  async function dismissReport(reportId: string) {
    try {
      if (setLoading !== null) setLoading(reportId);
      setLoad(true);
      const response = await fetch(`/api/report/clan/${reportId}/dismiss`, {
        method: "POST",
      });

      const responseJSON: APIResponse<EnrichedClanReport> =
        await response.json();

      if (!response.ok) throw responseJSON;

      toast({
        title: "Report dismissed!",
        description: responseJSON.message,
      });

      // Remove from reported clans cache if its banned
      queryClient.setQueryData(
        ["clan_reported"],
        (oldData: {
          pageParams: Array<number>;
          pages: Array<APIResponse<EnrichedClanReport>>;
        }) => {
          if (!oldData) return undefined;
          const updatedPages = oldData.pages.map((page) => {
            // Return all the clans that are not the reported one
            const updatedItems = page.items?.filter((report) => {
              if (report.id !== responseJSON.data!.id) {
                return responseJSON.data;
              }
            });
            return { ...page, items: updatedItems };
          });

          return { ...oldData, pages: updatedPages };
        }
      );
    } catch (error) {
      console.log(error);
      let errorMessage = "Failed to dismiss report!";
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
    } finally {
      if (setLoading !== null) setLoading("");
      setLoad(false);
    }
  }

  return dropdownItem ? (
    <DropdownMenuItem onClick={() => dismissReport(reportId)}>
      <Check />
      Dismiss
    </DropdownMenuItem>
  ) : (
    <Button onClick={() => dismissReport(reportId)} disabled={load}>
      {load && <Spinner />} <Check /> Dismiss
    </Button>
  );
};

export default DismissReportButton;
