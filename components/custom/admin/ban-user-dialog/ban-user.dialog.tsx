"use client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import banFromClanSchema from "@/app/validation-schemas/ban/ban-from-clan";
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
import { Textarea } from "@/components/ui/textarea";
import useBanUser from "@/hooks/custom/use-ban-user";
import { Role } from "@/prisma/generated/prisma/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Ban } from "lucide-react";
import { ReactNode } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { BasicUser } from "../../../../data-access/user";
import canManage from "@/utils/can-manage";

const BanUserDialog = ({
  user,
  open,
  setOpen,
}: {
  user: BasicUser;
  open: boolean;
  setOpen: (open: boolean) => void;
}) => {
  const form = useForm({
    resolver: zodResolver(banFromClanSchema),
    defaultValues: {
      justification: "",
    },
  });

  const { mutateAsync } = useBanUser();

  async function banUser(data: z.infer<typeof banFromClanSchema>) {
    try {
      await mutateAsync({
        justification: data.justification,
        userId: user.id,
        onSuccess: () => setOpen(false),
      });
    } catch (error) {}
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* <DialogTrigger asChild>{trigger}</DialogTrigger> */}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ban User</DialogTitle>
          <DialogDescription>
            Banning a user from BSCH will prevent them from having access to
            protected routes.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(banUser)} className="space-y-8">
            <FormField
              control={form.control}
              name="justification"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Justification</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Violated BSCH ToS" {...field} />
                  </FormControl>
                  <FormDescription>
                    Tell the user why you banned them.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="w-full flex gap-4 items-center justify-end">
              <Button variant="outline">Close</Button>
              <Button
                type="submit"
                variant="destructive"
                disabled={
                  form.formState.isSubmitting || !form.formState.isValid
                }
              >
                {form.formState.isSubmitting && <Spinner />}
                <Ban />
                Submit
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default BanUserDialog;
