"use client";

import { banClanSchema } from "@/app/validation-schemas/ban/ban-clan";
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ClanWithClanOwnerInfoAndBasicData } from "@/data-access/clan";
import useBanClan from "@/hooks/custom/use-ban-clan";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { SetStateAction } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const BanForm = ({
  clan,
  setOpen = null,
  setOpenCallback,
}: {
  clan: ClanWithClanOwnerInfoAndBasicData;
  setOpen?: React.Dispatch<SetStateAction<boolean>> | null;
  setOpenCallback?: React.Dispatch<React.SetStateAction<boolean>> | undefined;
}) => {
  const router = useRouter();
  const { mutateAsync } = useBanClan();
  const form = useForm<z.infer<typeof banClanSchema>>({
    resolver: zodResolver(banClanSchema),
    defaultValues: {
      justification: "",
      permanent: false,
      allowAppealAt: new Date(
        Date.now() + 7 * 24 * 60 * 60 * 1000
      ).toISOString() as unknown as Date,
    },
  });

  async function submit(data: z.infer<typeof banClanSchema>) {
    try {
      await mutateAsync({ clanId: clan.id, ...data });
      router.refresh();
      if (setOpenCallback !== undefined) {
        setOpenCallback(false);
      }
    } catch (error) {}
  }

  return (
    <div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(submit)}
          className="space-y-4 max-h-[1000px] overflow-y-auto"
        >
          <FormField
            control={form.control}
            name="justification"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Justification</FormLabel>
                <FormControl>
                  <Textarea
                    className="max-h-[300px]"
                    placeholder="Justification here..."
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  A Justification is required to submit a ban. Briefly explain
                  what caused the ban.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="border-[1px] border-border rounded-md p-4 flex flex-col gap-4">
            <FormField
              control={form.control}
              name="permanent"
              render={({ field }) => (
                <FormItem className="flex-col">
                  <FormLabel>Permanet Ban</FormLabel>
                  <FormControl>
                    <div>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </div>
                  </FormControl>
                  <FormDescription>
                    Permanet bans do not allow appeals.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            {form.getValues("permanent") === false ? (
              <FormField
                control={form.control}
                name="allowAppealAt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Allow Appeal At</FormLabel>
                    <FormControl>
                      <div>
                        <DatePicker field={field} />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Pick a date to allow the clan to appeal their ban.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : null}
          </div>
          <div className="w-full flex gap-2 justify-end">
            <Button
              type="button"
              onClick={() => setOpen && setOpen(false)}
              variant="outline"
            >
              Close
            </Button>
            <Button
              type="submit"
              disabled={form.formState.isSubmitting || !form.formState.isValid}
            >
              {form.formState.isSubmitting && <Spinner />} Submit
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default BanForm;
