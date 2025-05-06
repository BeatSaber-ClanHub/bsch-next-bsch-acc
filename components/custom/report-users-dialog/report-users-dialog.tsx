"use client";

import { reportUserSchema } from "@/app/validation-schemas/report/report-user-schema";
import { Spinner } from "@/components/minimal-tiptap/components/spinner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dispatch, SetStateAction } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const ReportUserDialog = ({
  reportDialog,
  setReportDialog,
  userId,
}: {
  reportDialog: boolean;
  setReportDialog: Dispatch<SetStateAction<boolean>>;
  userId: string;
}) => {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof reportUserSchema>>({
    resolver: zodResolver(reportUserSchema),
    defaultValues: {
      reason: "",
    },
  });

  async function reportUser(data: z.infer<typeof reportUserSchema>) {
    try {
      const response = await fetch(`/api/user/${userId}/report`, {
        method: "POST",
        body: JSON.stringify(data),
      });

      const responseJSON = await response.json();

      if (!response.ok) throw responseJSON;

      setReportDialog(false);
      toast({
        title: "User Reported!",
        description:
          "This user has been reported. BSCH will investigate this shortly.",
      });
    } catch (error) {
      let errorMessage = "Failed to report user!";
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
    }
  }

  return (
    <Dialog open={reportDialog} onOpenChange={setReportDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Report User</DialogTitle>
          <DialogDescription>
            If you believe that someone has violated the TOS, please report
            them.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(reportUser)}
            className="flex flex-col gap-4"
          >
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Violated ToS"
                      className="max-h-[400px]"
                    />
                  </FormControl>
                  <FormDescription>
                    Provide an explaination as to why you&apos;re reporting this
                    user. If you believe a user has violated Discord&apos;s ToS,
                    please report them on Discord as well.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex gap-4 w-full justify-end">
              <Button
                onClick={() => setReportDialog(false)}
                type="button"
                variant="outline"
              >
                Close
              </Button>
              <Button
                variant="destructive"
                type="submit"
                disabled={
                  !form.formState.isValid || form.formState.isSubmitting
                }
              >
                {form.formState.isSubmitting && <Spinner />}Report
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ReportUserDialog;
