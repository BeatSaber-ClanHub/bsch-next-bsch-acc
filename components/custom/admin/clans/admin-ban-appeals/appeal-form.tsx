"use client";

import { APIResponse } from "@/app/api/types/core/api";
import {
  appealActionsSchema,
  reviewStates,
} from "@/app/validation-schemas/ban-appeal/ban-appeal";
import { Spinner } from "@/components/minimal-tiptap/components/spinner";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { EnrichedBanAppeal } from "@/data-access/types/types";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { Checkbox } from "@radix-ui/react-checkbox";
import { useQueryClient } from "@tanstack/react-query";
import { Dispatch, SetStateAction } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const AppealForm = ({
  appeal,
  setOpen,
}: {
  appeal: EnrichedBanAppeal;
  setOpen: Dispatch<SetStateAction<boolean>>;
}) => {
  const queryProvider = useQueryClient();
  const { toast } = useToast();
  const form = useForm<z.infer<typeof appealActionsSchema>>({
    resolver: zodResolver(appealActionsSchema),
    defaultValues: {
      comments: appeal.comments || "",
      status: appeal.status,
      allowAnotherAppeal: appeal.allowAnotherAppeal,
    },
  });

  async function submit(data: z.infer<typeof appealActionsSchema>) {
    try {
      const response = await fetch(
        `/api/clan/${appeal.clanId}/ban/appeal/actions`,
        {
          method: "POST",
          body: JSON.stringify(data),
        }
      );

      const responseJSON: APIResponse<EnrichedBanAppeal> =
        await response.json();
      if (!response.ok) throw responseJSON;

      toast({
        title: "Appeal updated!",
        description: "Changes to this appeal have been applied!",
      });
      setOpen(false);
      queryProvider.setQueryData(
        ["clan_ban_appeals"],
        (oldData: {
          pageParams: Array<number>;
          pages: Array<APIResponse<EnrichedBanAppeal>>;
        }) => {
          if (!oldData) return undefined;
          const updatedPages = oldData.pages.map((page) => {
            // Remove the appeal from cache if its been denied or approved
            if (data.status === "Approved" || data.status === "Denied") {
              const updatedItems = page.items?.filter((appeal) => {
                if (appeal.id !== responseJSON.data!.id) {
                  // return responseJSON.data;
                  return appeal;
                }
              });
              return { ...page, items: updatedItems };
            }

            // Otherwise just update whatever changed
            const updatedItems = page.items?.map((appeal) => {
              if (appeal.id === responseJSON.data!.id) {
                return responseJSON.data;
              }
              return appeal;
            });
            return { ...page, items: updatedItems };
          });

          return { ...oldData, pages: updatedPages };
        }
      );

      // Remove the banned clan from the banned clans cache
      if (data.status === "Approved") {
        queryProvider.setQueryData(
          ["clan_banned"],
          (oldData: {
            pageParams: Array<number>;
            pages: Array<APIResponse<EnrichedBanAppeal>>;
          }) => {
            if (!oldData) return undefined;
            const updatedPages = oldData.pages.map((page) => {
              // Return all the clans that are not unbanned
              const updatedItems = page.items?.filter((bannedClan) => {
                if (bannedClan.id !== responseJSON.data!.clanId) {
                  return bannedClan;
                }
              });
              return { ...page, items: updatedItems };
            });

            return { ...oldData, pages: updatedPages };
          }
        );
      }
    } catch (error) {
      let errorMessage = "Failed to apply changes to appeal.";

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
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(submit)}
        className="flex flex-col gap-4"
      >
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <FormControl>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    {reviewStates.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status.replace("_", " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormDescription>
                Set the status of this appeal. Setting the status to approved or
                denied will prevent future edits to this ticket.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="allowAnotherAppeal"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Allow another appeal</FormLabel>
              <FormControl>
                <div>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </div>
              </FormControl>
              <FormDescription>
                Allows the clan to submit another appeal if the previous one was
                denied. Setting this to false when denying the appeal is
                equivalent to a permanent ban.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="comments"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Comments</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormDescription>
                Comments for the clan, visible to the appeal submitter.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex gap-4 w-full justify-end">
          <Button
            variant="outline"
            type="button"
            onClick={() => {
              setOpen(false);
              form.reset();
            }}
          >
            Close
          </Button>
          <Button
            type="submit"
            disabled={
              form.formState.isSubmitting ||
              !(form.formState.isValid && form.formState.isDirty)
            }
          >
            {form.formState.isSubmitting && <Spinner />}Save
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default AppealForm;
