"use client";

import { APIResponse } from "@/app/api/types/core/api";
import deleteClanSchema from "@/app/validation-schemas/clan/delete-clan";
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
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { Clan } from "@/prisma/generated/prisma/client";
import { Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const DeleteClanDialog = ({
  clan,
  buttonText = "Continue to confirmation",
}: {
  clan: Clan;
  buttonText?: string;
}) => {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof deleteClanSchema>>({
    resolver: zodResolver(deleteClanSchema),
    defaultValues: {
      confirmationPhrase: "",
    },
  });

  async function deleteClan(data: z.infer<typeof deleteClanSchema>) {
    try {
      const response = await fetch(`/api/clan/${clan.id}`, {
        method: "DELETE",
        body: JSON.stringify(data),
      });

      const responseJSON: APIResponse<Clan> = await response.json();
      if (!response.ok) throw responseJSON;

      toast({
        title: "Clan deleted!",
        description: "This clan has been deleted.",
      });

      router.push("/dashboard");
    } catch (error) {
      let errorMessage = "Failed to delete clan!";
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
        <Button variant="destructive">
          <Trash />
          {buttonText}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you absolutely sure?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete your clan
            and remove all members from it.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(deleteClan)}>
            <FormField
              control={form.control}
              name="confirmationPhrase"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Enter <span className="font-bold">Delete this clan</span> to
                    continue
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Delete this clan"
                      {...field}
                      autoComplete="off"
                    />
                  </FormControl>
                  <FormDescription>
                    Enter the bolded confirmation phrase
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
                {form.formState.isSubmitting && <Spinner />}Delete
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteClanDialog;
