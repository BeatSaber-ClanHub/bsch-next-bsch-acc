"use client";

import { APIResponse } from "@/app/api/types/core/api";
import { reportClanSchema } from "@/app/validation-schemas/report/report-clan-schema";
import { Spinner } from "@/components/minimal-tiptap/components/spinner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Clan, Report } from "@/prisma/generated/prisma/client";
import { AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const ReportClanDialog = ({
  clan,
  buttonText = "Continue to report",
}: {
  clan: Clan;
  buttonText?: string;
}) => {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof reportClanSchema>>({
    resolver: zodResolver(reportClanSchema),
    defaultValues: {
      reason: "",
    },
  });

  async function reportClan(data: z.infer<typeof reportClanSchema>) {
    try {
      const response = await fetch(`/api/clan/${clan.id}/report`, {
        method: "POST",
        body: JSON.stringify(data),
      });

      const responseJSON: APIResponse<Report> = await response.json();
      if (!response.ok) throw responseJSON;

      toast({
        title: "Clan reported!",
        description: "This clan has been reported.",
      });

      setOpen(false);
      form.reset();
      router.refresh();
    } catch (error) {
      let errorMessage = "Failed to report clan!";
      if (error instanceof TypeError) {
        errorMessage = "Something unexpected occurred!";
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary">
          <AlertCircle />
          {buttonText}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Report this clan</DialogTitle>
          <DialogDescription>
            If you believed this clan has violated ToS, fill this form out to
            report it. This report will be visible to BSCH staff only.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(reportClan)}
            className="max-h-[1000px] overflow-y-auto"
          >
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="What did they do..."
                      {...field}
                      autoComplete="off"
                    />
                  </FormControl>
                  <FormDescription>
                    Enter a reason as to why you&apos;re reporting this clan.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="w-full flex gap-4 justify-end">
              <Button
                type="button"
                onClick={() => {
                  form.reset();
                  setOpen(false);
                }}
                variant="outline"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="destructive"
                disabled={
                  form.formState.isSubmitting || !form.formState.isValid
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

export default ReportClanDialog;
