"use client";
import { APIResponse } from "@/app/api/types/core/api";
import deleteAPIKeySchema from "@/app/validation-schemas/api-key/delete-api-key-schema";
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
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
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
import { Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const DeleteAPIKey = ({ apiKey }: { apiKey: APIKeyWithDecrypt }) => {
  const [open, setOpen] = useState(false);

  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof deleteAPIKeySchema>>({
    resolver: zodResolver(deleteAPIKeySchema),
    defaultValues: {
      confirmationPhrase: "",
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async function deleteKey(data: z.infer<typeof deleteAPIKeySchema>) {
    try {
      const response = await fetch(`/api/profile/keys/delete/${apiKey.id}`, {
        method: "DELETE",
      });

      const responseJSON: APIResponse<{ name: string }> = await response.json();
      if (!response.ok) throw responseJSON;

      toast({
        title: "Success!",
        description: responseJSON.message,
      });

      router.refresh();
      setOpen(false);
      form.reset();
    } catch (error) {
      let errorMessage = "Failed to delete key!";
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
        <DropdownMenuItem
          className="text-red-500"
          onClick={(e) => {
            e.preventDefault();
            setOpen(true);
          }}
        >
          <Trash /> Delete
        </DropdownMenuItem>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete API Key</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this key? This action can not be
            undone. All services using this key will no longer function.
          </DialogDescription>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(deleteKey)}
              className="flex flex-col gap-4 w-full"
            >
              <div className="flex flex-col gap-4 w-full">
                <FormField
                  control={form.control}
                  name="confirmationPhrase"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Type <span className="font-bold">Delete this key</span>{" "}
                        to delete
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="New Key"
                          {...field}
                          autoComplete="off"
                        />
                      </FormControl>
                      <FormDescription>
                        Enter the bolded phrase to delete this key.
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
                <Button
                  type="submit"
                  variant="destructive"
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting && <Spinner />}
                  Delete
                </Button>
              </div>
            </form>
          </Form>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteAPIKey;
