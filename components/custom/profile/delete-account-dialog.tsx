"use client";
import deleteAccountSchema from "@/app/validation-schemas/user/delete-account";
import HorizontalScrollableClanCardDisplay from "@/components/custom/clan-scroller/horizontal-scrollable-clan-card-display";
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
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const DeleteAccountButton = ({ hasOwnedClans }: { hasOwnedClans: boolean }) => {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof deleteAccountSchema>>({
    resolver: zodResolver(deleteAccountSchema),
    defaultValues: {
      confirmationPhrase: "",
    },
  });

  async function deleteAccount(data: z.infer<typeof deleteAccountSchema>) {
    try {
      const response = await fetch("/api/profile/actions/delete", {
        method: "DELETE",
        body: JSON.stringify(data),
      });

      const responseJSON = await response.json();
      if (!response.ok) throw responseJSON;

      router.refresh();

      toast({
        title: "Account deleted!",
        description: "This account has been deleted!",
      });
      setOpen(false);
    } catch (error) {
      let errorMessage = "Failed to create clan!";
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive">Delete my account</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you absolutely sure?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. All clans owned by you will be
            removed. Consider transfering ownership before removing your
            account.
          </DialogDescription>
        </DialogHeader>
        {hasOwnedClans && (
          <div className="flex flex-col gap-2 w-full overflow-auto">
            <p className="mb-2 text-red-500">These clans will be deleted.</p>
            <div className="flex gap-4">
              <HorizontalScrollableClanCardDisplay
                apiRoute="api/clans/owned"
                queryKey={["owned_clans"]}
                target="_blank"
              />
            </div>
          </div>
        )}
        <div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(deleteAccount)}>
              <FormField
                control={form.control}
                name="confirmationPhrase"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Enter <span className="font-bold">Delete my account</span>{" "}
                      to proceed
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Delete my account"
                        {...field}
                        autoComplete="off"
                      />
                    </FormControl>
                    <FormDescription>
                      Enter the comfirmation phrase.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex gap-4 w-full justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    form.reset();
                    setOpen(false);
                  }}
                >
                  Close
                </Button>
                <Button
                  type="submit"
                  variant="destructive"
                  disabled={
                    form.formState.isSubmitting || !form.formState.isValid
                  }
                >
                  {form.formState.isSubmitting && <Spinner />}
                  Submit
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteAccountButton;
