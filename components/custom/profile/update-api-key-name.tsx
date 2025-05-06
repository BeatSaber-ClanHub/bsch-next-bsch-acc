"use client";
import { APIResponse } from "@/app/api/types/core/api";
import newAPIKeySchema from "@/app/validation-schemas/api-key/new-api-key-schema";
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
import { PenBox } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const UpdateAPIKeyName = ({ apiKey }: { apiKey: APIKeyWithDecrypt }) => {
  const [open, setOpen] = useState(false);

  const { toast } = useToast();
  const router = useRouter();
  const schema = newAPIKeySchema.omit({ expireAt: true });

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: apiKey.name,
    },
  });

  async function updateName(data: z.infer<typeof schema>) {
    try {
      const response = await fetch(`/api/profile/keys/rename/${apiKey.id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
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
      let errorMessage = "Failed to update key!";
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
          onClick={(e) => {
            e.preventDefault();
            setOpen(true);
          }}
        >
          <PenBox /> Rename
        </DropdownMenuItem>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change Key Name</DialogTitle>
          <DialogDescription>
            Change the name of your API key.
          </DialogDescription>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(updateName)}
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
                        New name for your API key.
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

export default UpdateAPIKeyName;
