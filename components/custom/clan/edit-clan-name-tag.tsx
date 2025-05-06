"use client";
import { APIResponse } from "@/app/api/types/core/api";
import clanSchema from "@/app/validation-schemas/clan/clanSchema";
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
import { Edit } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Textarea } from "@/components/ui/textarea";

const schema = clanSchema.pick({
  clan_tag: true,
  clan_name: true,
  clan_short_description: true,
});

const EditClanNameTag = ({
  clanId,
  clanName,
  clanTag,
  shortDescription,
}: {
  clanId: string;
  clanName: string;
  clanTag: string;
  shortDescription: string;
}) => {
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      clan_name: clanName,
      clan_tag: clanTag,
      clan_short_description: shortDescription,
    },
  });
  const { toast } = useToast();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function onSubmit(data: z.infer<typeof schema>) {
    try {
      const response = await fetch(`/api/clan/${clanId}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });

      const responseJSON: APIResponse<Clan> = await response.json();

      if (!response.ok) throw responseJSON;

      setOpen(false);
      toast({
        title: "Updated!",
        description: responseJSON.message,
      });
      router.refresh();
    } catch (error) {
      console.log(error);
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
        <Button
          variant="outline"
          className="rounded-full w-[40px] h-[40px] flex items-center justify-center"
        >
          <Edit size="10px" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Name and Tag</DialogTitle>
          <DialogDescription className="sr-only">
            Edit the Name and Tag of your clan.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            <FormField
              control={form.control}
              name="clan_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Clan Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Clan name" {...field} />
                  </FormControl>
                  <FormDescription>
                    This is the name of your clan.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="clan_tag"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Clan Tag</FormLabel>
                  <FormControl>
                    <Input placeholder="TAG" {...field} />
                  </FormControl>
                  <FormDescription>
                    This is the tag of your clan. It can be between 2-6
                    characters.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="clan_short_description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Short Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Short description"
                      {...field}
                      maxLength={150}
                    />
                  </FormControl>
                  <FormDescription>
                    Short description displayed on your clan card.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting && <Spinner />}Update
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditClanNameTag;
