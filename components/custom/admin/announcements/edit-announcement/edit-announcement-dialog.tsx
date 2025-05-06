"use client";
import announcementSchema from "@/app/validation-schemas/announcement/announcement-schema";
import DateTimePicker from "@/components/custom/date-time-picker";
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { WebsiteAnnouncementWithPosterUserData } from "@/data-access/website-announcement";
import useUpdateAnnouncement from "@/hooks/custom/use-update-announcement";
import { zodResolver } from "@hookform/resolvers/zod";
import { PenBox } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const EditAnnouncementDialog = ({
  announcement,
}: {
  announcement: WebsiteAnnouncementWithPosterUserData;
}) => {
  const [open, setOpen] = useState(false);

  const now = new Date();

  const { mutateAsync } = useUpdateAnnouncement();

  const form = useForm<z.infer<typeof announcementSchema>>({
    resolver: zodResolver(announcementSchema),
    defaultValues: {
      title: announcement.title,
      announcement: announcement.announcement,
      hideAt: announcement.hideAt ? new Date(announcement.hideAt) : null,
      showAt: announcement.showAt ? new Date(announcement.showAt) : null,
      visible: announcement.visible,
    },
  });

  async function onSubmit(data: z.infer<typeof announcementSchema>) {
    try {
      await mutateAsync({
        id: announcement.id,
        data: data,
        callback: () => setOpen(false),
      });
    } catch (error) {}
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PenBox /> Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="!min-w-fit">
        <DialogHeader>
          <DialogTitle>Edit Announcement</DialogTitle>
          <DialogDescription>
            Announcements are banners at the top of the webpage.
          </DialogDescription>
        </DialogHeader>
        <div>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-8 w-full"
            >
              <div className="flex flex-col justify-start items-start gap-4 sm:flex-row sm:justify-between  w-full">
                <FormField
                  control={form.control}
                  name="showAt"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Show at</FormLabel>
                      <FormControl>
                        <div>
                          <DateTimePicker
                            field={field}
                            disabled={form.getValues("visible")}
                          />
                        </div>
                      </FormControl>
                      <FormDescription>
                        When the announcement show display.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="hideAt"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Hide at</FormLabel>
                      <FormControl>
                        <div>
                          <DateTimePicker
                            field={field}
                            disabled={form.getValues("visible")}
                          />
                        </div>
                      </FormControl>
                      <FormDescription>
                        When the announcement should stop showing.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="border rounded-lg p-4">
                <FormField
                  control={form.control}
                  name="visible"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Visible</FormLabel>
                      <FormControl>
                        <div>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </div>
                      </FormControl>
                      <FormDescription>
                        Sets the announcement as visible and will override the
                        show at and hide at dates.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div>
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <div>
                          <Input placeholder="Title" {...field} />
                        </div>
                      </FormControl>
                      <FormDescription>
                        For organizational purposes. Won&apos;t be displayed on
                        the client side but is available via API.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="announcement"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Announcement</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Announcement"
                        {...field}
                        maxLength={300}
                      />
                    </FormControl>
                    <FormDescription>
                      Text displayed in the banner.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
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
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditAnnouncementDialog;
