"use client";

import { APIResponse } from "@/app/api/types/core/api";
import { TipTapJson } from "@/components/custom/clan/clan-description/types";
import { MinimalTiptapEditor } from "@/components/minimal-tiptap";
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
import { useToast } from "@/hooks/use-toast";
import { Clan } from "@/prisma/generated/prisma/client";
import { Dispatch, SetStateAction } from "react";
import { useForm } from "react-hook-form";

const EditDescription = ({
  setDisplayEditor,
  setContent,
  clanId,
  description,
}: {
  setDisplayEditor: Dispatch<SetStateAction<boolean>>;
  setContent: Dispatch<SetStateAction<TipTapJson | null>>;
  clanId: string;
  description?: TipTapJson | null;
}) => {
  const { toast } = useToast();

  const form = useForm({
    defaultValues: {
      description: "",
    },
  });

  async function onSubmit(data: { description: string }) {
    try {
      const response = await fetch(`/api/clan/${clanId}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });

      const responseJSON: APIResponse<Clan> = await response.json();

      if (!response.ok) throw responseJSON;

      toast({
        title: "Description Added!",
        description: responseJSON.message,
      });
      const t: TipTapJson | null = responseJSON.data!.description as TipTapJson;
      setContent(t);
      setDisplayEditor(false);
    } catch (error) {
      console.log(error);
      let errorMessage = "Failed to edit description!";
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

  function cancel() {
    form.reset();
    setDisplayEditor(false);
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-4 w-full"
      >
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem className="!mt-0 !space-y-0">
              <FormLabel className="sr-only">Description Input</FormLabel>
              <FormControl>
                <MinimalTiptapEditor
                  // value={value}
                  // onChange={setValue}
                  {...field}
                  content={description}
                  className="w-full"
                  editorContentClassName="p-5"
                  output="json"
                  placeholder="Enter your description..."
                  autofocus={true}
                  editable={true}
                  editorClassName="focus:outline-none"
                />
              </FormControl>
              <FormDescription className="sr-only">
                This is the input for the clan description.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="ml-auto flex gap-4">
          <Button type="button" variant="outline" onClick={cancel}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={form.formState.isSubmitting || !form.formState.isDirty}
          >
            {form.formState.isSubmitting && <Spinner />}Submit
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default EditDescription;
