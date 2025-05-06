"use client";
import { APIResponse } from "@/app/api/types/core/api";
import newAPIKeySchema from "@/app/validation-schemas/api-key/new-api-key-schema";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components//ui/dialog";
import DatePicker from "@/components/custom/date-picker";
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
import { Input } from "@/components/ui/input";
import { APIKeyWithDecrypt } from "@/data-access/types/types";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const NewAPIKeyDialog = ({ numOfKeys }: { numOfKeys: number }) => {
  const [open, setOpen] = useState(false);

  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof newAPIKeySchema>>({
    resolver: zodResolver(newAPIKeySchema),
    defaultValues: {
      name: "",
      expireAt: null,
    },
  });

  async function submitNewKey(data: z.infer<typeof newAPIKeySchema>) {
    try {
      const response = await fetch("/api/profile/keys/new", {
        method: "POST",
        body: JSON.stringify(data),
      });

      const responseJSON: APIResponse<APIKeyWithDecrypt> =
        await response.json();
      if (!response.ok) throw responseJSON;

      toast({
        title: "Success!",
        description: responseJSON.message,
      });

      router.refresh();
      setOpen(false);
      form.reset();
    } catch (error) {
      let errorMessage = "Failed to generate new API key!";
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
        <Button className="w-full sm:w-fit" disabled={numOfKeys >= 20}>
          <Plus /> Create New Key
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a New API Key</DialogTitle>
          <DialogDescription>
            API Keys are used to authenticate your identity when making external
            requests. Treat them with the same level of care as your password—do
            not share them with anyone. They provide full access to your
            account&apos;s functionality and data, so keeping them secure is
            essential.
          </DialogDescription>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(submitNewKey)}
              className="flex flex-col gap-4 w-full"
            >
              <div className="flex flex-col gap-4 w-full">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="New Key"
                          {...field}
                          autoComplete="off"
                        />
                      </FormControl>
                      <FormDescription>
                        Name your API key to easily identify it.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="expireAt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expire At</FormLabel>
                      <FormControl>
                        <div>
                          <DatePicker field={field} />
                        </div>
                      </FormControl>
                      <FormDescription>
                        Pick a date to invalidate the key. If left empty, the
                        key will remain valid indefinitely.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex gap-4 w-full justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                >
                  Close
                </Button>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting && <Spinner />}
                  Submit
                </Button>
              </div>
            </form>
          </Form>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default NewAPIKeyDialog;
