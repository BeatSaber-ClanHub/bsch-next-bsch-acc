"use client";
import { APIResponse } from "@/app/api/types/core/api";
import { editClanSchema } from "@/app/validation-schemas/clan/clanSchema";
import DeleteClanDialog from "@/components/custom/clan/delete-clan-dialog";
import { Spinner } from "@/components/minimal-tiptap/components/spinner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { Clan, ClanStaffRole } from "@/prisma/generated/prisma/client";
import { Cog } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const EditClanExtra = ({
  clan,
  clanRole,
}: {
  clan: Clan;
  clanRole: ClanStaffRole;
}) => {
  const [open, setOpen] = useState(false);
  const [updatedClan, setUpdatedClan] = useState<Clan>(clan);
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof editClanSchema>>({
    resolver: zodResolver(editClanSchema),
    defaultValues: {
      discord_invite_link: updatedClan.discord_invite_link!,
      visibility: updatedClan.visibility,
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        discord_invite_link: updatedClan.discord_invite_link!,
        visibility: updatedClan.visibility,
      });
    }
  }, [open, updatedClan, form]);

  async function edit(data: z.infer<typeof editClanSchema>) {
    try {
      const response = await fetch(`/api/clan/${updatedClan.id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });

      const responseJSON: APIResponse<Clan> = await response.json();
      if (!response.ok) throw responseJSON;

      setUpdatedClan(responseJSON.data as Clan);

      toast({
        title: "Updated!",
        description: responseJSON.message,
      });

      router.refresh();
      setOpen(false);
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
        <Button className="w-[36px] h-[36px]" variant="secondary">
          <Cog />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Additional Settings</DialogTitle>
          <DialogDescription>
            Make additional changes to your clan.
          </DialogDescription>
        </DialogHeader>
        <div className="w-full flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Additional Fields</CardTitle>
              <CardDescription>
                Edit the Discord Invite and Visibility
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(edit)}>
                  <FormField
                    control={form.control}
                    name="discord_invite_link"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Discord Invite Link</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="https://discord.gg/<code>"
                            {...field}
                            autoComplete="off"
                            autoFocus={false}
                          />
                        </FormControl>
                        <FormDescription>
                          This is the discord invite link to your clan&apos;s
                          Discord server.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="visibility"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Visibility</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select visibility" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Visible">Visible</SelectItem>
                            <SelectItem value="Hidden">Hidden</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Make your clan visible to the public or hide it.
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
                      Close
                    </Button>
                    <Button
                      type="submit"
                      disabled={
                        form.formState.isSubmitting || !form.formState.isValid
                      }
                    >
                      {form.formState.isSubmitting && <Spinner />}Submit
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
          {/* <Separator orientation="horizontal" /> */}
          {clanRole === "Creator" && (
            <Card>
              <CardHeader>
                <CardTitle>Delete this clan</CardTitle>
                <CardDescription>
                  Only the owner of the clan can delete it. Once deleted, your
                  clan cannot be recovered. This action will permanently remove
                  all records, scores, members, and any other data associated
                  with the clan.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DeleteClanDialog clan={clan} />
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditClanExtra;
