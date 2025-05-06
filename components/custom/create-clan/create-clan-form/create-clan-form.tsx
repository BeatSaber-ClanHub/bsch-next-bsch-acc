"use client";

import { APIResponse } from "@/app/api/types/core/api";
import ClanSpecialtySelection from "@/components/custom/create-clan/create-clan-form/clan-specialty-selection";
import { Spinner } from "@/components/minimal-tiptap/components/spinner";
import {
  _client_createClanSchema,
  Clan,
  colorClasses,
} from "@/components/types/clan-types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ClanWithClanOwnerInfoAndBasicData } from "@/data-access/clan";
import useAddClanToPage from "@/hooks/custom/use-add-clan-to-page";
import { useToast } from "@/hooks/use-toast";
import { ClanSpecialties } from "@/prisma/generated/prisma/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, Shield, Stars, Sword } from "lucide-react";
import { Dispatch, ReactNode, SetStateAction, useState } from "react";
import { FormProvider, useForm, useFormContext } from "react-hook-form";
import { z } from "zod";

const CreateClanForm = ({
  setOpen,
}: {
  setOpen: Dispatch<SetStateAction<boolean>>;
}) => {
  const { toast } = useToast();
  const addClanToPage = useAddClanToPage();

  const form = useForm({
    resolver: zodResolver(_client_createClanSchema),
    defaultValues: {
      clan_name: "",
      clan_tag: "",
      discord_invite_link: "",
      clan_specialties: [],
      clan_short_description: "",
    },
    mode: "onChange",
  });

  function handleSelection(specialty: ClanSpecialties) {
    // Get the current list of selected clans
    const current_selected_clan_specialties =
      form.getValues("clan_specialties");

    // If the clan is in the list, remove it
    if (current_selected_clan_specialties.includes(specialty)) {
      const new_list = current_selected_clan_specialties.filter(
        (val) => val !== specialty
      );

      form.setValue("clan_specialties", new_list);
      return;
    }

    // If the specialty is not in the current list, add it
    const new_list = [...current_selected_clan_specialties, specialty];
    form.setValue("clan_specialties", new_list);
    return;
  }

  async function submit_createClan(data: Clan) {
    try {
      const response = await fetch("/api/clan", {
        method: "POST",
        body: JSON.stringify(data),
      });

      const responseJSON: APIResponse<ClanWithClanOwnerInfoAndBasicData> =
        await response.json();
      if (!response.ok) throw responseJSON;

      // Display success toast and add to the horizontal scroll componet
      toast({
        title: "Success!",
        description: responseJSON.message,
      });

      addClanToPage({
        queryKey: ["your_clans"],
        newClan: responseJSON.data as ClanWithClanOwnerInfoAndBasicData,
      });
      setOpen(false);
      return;
    } catch (error: unknown) {
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

  type Sections = "identity" | "specialties" | "details" | "review";
  const [activeIndex, setActiveIndex] = useState(0);
  const order: Sections[] = ["identity", "details", "specialties", "review"];

  function handlePrevious() {
    const prevIndex = activeIndex > 0 ? activeIndex - 1 : 0;
    setActiveIndex(prevIndex);
  }

  function handleNext() {
    const nextIndex =
      activeIndex < order.length - 1 ? activeIndex + 1 : order.length - 1;
    setActiveIndex(nextIndex);
  }

  return (
    <FormProvider {...form}>
      <form
        className="flex flex-col gap-4 pb-8"
        onSubmit={form.handleSubmit(submit_createClan)}
      >
        <div>
          {activeIndex === 0 && <ClanIdentitySection handleNext={handleNext} />}
          {activeIndex === 1 && (
            <ClanDetailsSection
              handleNext={handleNext}
              handlePrevious={handlePrevious}
            />
          )}
          {activeIndex === 2 && (
            <ClanSpecialtiesSection
              handleNext={handleNext}
              handlePrevious={handlePrevious}
              handleSelection={handleSelection}
            />
          )}
          {activeIndex === 3 && (
            <ClanReviewSection handlePrevious={handlePrevious} />
          )}
        </div>
      </form>
    </FormProvider>
  );
};

const ClanIdentitySection = ({ handleNext }: { handleNext: () => void }) => {
  const { control, formState, watch } =
    useFormContext<z.infer<typeof _client_createClanSchema>>();

  const name = watch("clan_name");
  const tag = watch("clan_tag");

  const schema = _client_createClanSchema.pick({
    clan_name: true,
    clan_tag: true,
  });

  const errors = schema.safeParse({
    clan_name: name,
    clan_tag: tag,
  });

  return (
    <Section>
      <div className="w-full h-full flex flex-col justify-center gap-4">
        <div className="flex flex-col w-full p-4 py-8 justify-center items-center rounded-lg from-primary/30 to-chart-5/30 bg-gradient-to-r gap-2">
          <div className="flex items-center justify-center">
            <Shield className="h-12 w-12 text-primary" />
          </div>
          <p className="text-xl font-bold text-center text-xlg">
            Clan Identity
          </p>
        </div>
        <div className="flex flex-col gap-4">
          <FormField
            control={control}
            name="clan_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Clan Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Clan name"
                    maxLength={20}
                    autoComplete="off"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  What&apos;s the name of your clan?
                </FormDescription>
                {formState.touchedFields.clan_name && <FormMessage />}
              </FormItem>
            )}
          />
          {/* Clan tag */}
          <FormField
            control={control}
            name="clan_tag"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Clan Tag</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Tag"
                    maxLength={6}
                    autoComplete="off"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  A 2 - 6 character tag used to identify your clan!
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
      <div className="flex items-center justify-end">
        <Button onClick={handleNext} type="button" disabled={!errors.success}>
          Next
        </Button>
      </div>
    </Section>
  );
};

const ClanDetailsSection = ({
  handleNext,
  handlePrevious,
}: {
  handleNext: () => void;
  handlePrevious: () => void;
}) => {
  const { control, formState, watch } =
    useFormContext<z.infer<typeof _client_createClanSchema>>();
  const invite = watch("discord_invite_link");
  const descr = watch("clan_short_description");

  const schema = _client_createClanSchema.pick({
    discord_invite_link: true,
    clan_short_description: true,
  });

  const errors = schema.safeParse({
    discord_invite_link: invite,
    clan_short_description: descr,
  });
  return (
    <Section>
      <div className="w-full h-full flex flex-col justify-center gap-4">
        <div className="flex flex-col w-full p-4 py-8 justify-center items-center rounded-lg from-primary/30 to-chart-5/30 bg-gradient-to-r gap-2">
          <div className="flex items-center justify-center">
            <Stars className="h-12 w-12 text-primary" />
          </div>
          <p className="text-xl font-bold text-center text-xlg">Details</p>
        </div>
        <div className="flex flex-col gap-4">
          <FormField
            control={control}
            name="discord_invite_link"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Discord Invite</FormLabel>
                <FormControl>
                  <Input
                    placeholder="https://discord.gg/invite"
                    autoComplete="off"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Permanent Discord invite link to you clans server!
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="clan_short_description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Short Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Short Description"
                    maxLength={150}
                    autoComplete="off"
                    className="max-h-[150px]"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  This is a description displayed on your clan card.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
      <div className="flex items-center justify-between">
        <Button onClick={handlePrevious} variant="outline" type="button">
          Previous
        </Button>
        <Button onClick={handleNext} type="button" disabled={!errors.success}>
          Next
        </Button>
      </div>
    </Section>
  );
};

const ClanSpecialtiesSection = ({
  handleNext,
  handlePrevious,
  handleSelection,
}: {
  handleNext: () => void;
  handlePrevious: () => void;
  handleSelection: (specialty: ClanSpecialties) => void;
}) => {
  return (
    <Section>
      <div className="w-full h-full flex flex-col justify-center gap-4">
        <div className="flex flex-col w-full p-4 py-8 justify-center items-center rounded-lg from-primary/30 to-chart-5/30 bg-gradient-to-r gap-2">
          <div className="flex items-center justify-center">
            <Sword className="h-12 w-12 text-primary" />
          </div>
          <p className="text-xl font-bold text-center text-xlg">Specialties</p>
        </div>
        <div className="flex flex-col gap-2">
          <ClanSpecialtySelection handleSelection={handleSelection} />
        </div>
      </div>
      <div className="flex items-center justify-between">
        <Button onClick={handlePrevious} variant="outline" type="button">
          Previous
        </Button>
        <Button onClick={handleNext} type="button">
          Next
        </Button>
      </div>
    </Section>
  );
};

const ClanReviewSection = ({
  handlePrevious,
}: {
  handlePrevious: () => void;
}) => {
  const { getValues, formState } =
    useFormContext<z.infer<typeof _client_createClanSchema>>();
  return (
    <Section>
      <div className="w-full h-full flex flex-col justify-center gap-4">
        <div className="flex flex-col w-full p-4 py-8 justify-center items-center rounded-lg from-primary/30 to-chart-5/30 bg-gradient-to-r gap-2">
          <div className="flex items-center justify-center">
            <Eye className="h-12 w-12 text-primary" />
          </div>
          <p className="text-xl font-bold text-center text-xlg">Review</p>
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <p className="text-[12px] text-muted-foreground">Name: </p>
            <p className="text-xl font-bold">{getValues("clan_name")}</p>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-[12px] text-muted-foreground">Tag: </p>
            <p className="text-md font-bold">{getValues("clan_tag")}</p>
          </div>
          <div className="p-4 bg-muted/50 rounded-lg mt-2 flex flex-col gap-1">
            <p className="text-[12px] text-muted-foreground">Description:</p>
            <p className="text-sm">{getValues("clan_short_description")}</p>
          </div>
        </div>
        <div className="w-full overflow-x-auto flex gap-2">
          {getValues("clan_specialties")?.map((specialty) => {
            return (
              <Badge
                variant="outline"
                className={`border-2 border-${colorClasses[specialty]} rounded-full`}
                key={specialty}
              >
                {specialty}
              </Badge>
            );
          })}
        </div>
      </div>
      <div className="flex items-center justify-between">
        <Button onClick={handlePrevious} variant="outline" type="button">
          Previous
        </Button>
        <Button disabled={formState.isSubmitting} type="submit">
          {formState.isSubmitting && <Spinner />} Create Clan
        </Button>
      </div>
    </Section>
  );
};

const Section = ({ children }: { children: ReactNode }) => {
  return <div className={`w-full h-full items-center`}>{children}</div>;
};

export default CreateClanForm;
