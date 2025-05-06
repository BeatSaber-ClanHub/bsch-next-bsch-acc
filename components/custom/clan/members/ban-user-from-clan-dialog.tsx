"use client";

import banFromClanSchema from "@/app/validation-schemas/ban/ban-from-clan";
import { Spinner } from "@/components/minimal-tiptap/components/spinner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
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
import { zodResolver } from "@hookform/resolvers/zod";
import { Dispatch, SetStateAction } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const BanUserFromClanDialog = ({
  banDialog,
  setBanDialog,
  handleBanMutation,
}: {
  banDialog: boolean;
  setBanDialog: Dispatch<SetStateAction<boolean>>;
  handleBanMutation: (data: z.infer<typeof banFromClanSchema>) => Promise<void>;
}) => {
  const banUserForm = useForm({
    resolver: zodResolver(banFromClanSchema),
    defaultValues: {
      justification: "",
    },
  });

  return (
    <Dialog open={banDialog} onOpenChange={setBanDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ban User</DialogTitle>
        </DialogHeader>
        <Form {...banUserForm}>
          <form
            onSubmit={banUserForm.handleSubmit(handleBanMutation)}
            className="w-full space-y-6"
          >
            <FormField
              control={banUserForm.control}
              name="justification"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Justification</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Violated TOS..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Tell the user why you banned them.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex gap-4 justify-end ml-auto">
              <Button
                onClick={() => setBanDialog(false)}
                variant="outline"
                type="button"
              >
                Close
              </Button>
              <Button
                type="submit"
                disabled={
                  banUserForm.formState.isSubmitting ||
                  !banUserForm.formState.isValid
                }
              >
                {banUserForm.formState.isSubmitting && <Spinner />}Submit
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default BanUserFromClanDialog;
