"use client";
import { APIResponse } from "@/app/api/types/core/api";
import banFromClanSchema from "@/app/validation-schemas/ban/ban-from-clan";
import { Spinner } from "@/components/minimal-tiptap/components/spinner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { ClanBan } from "@/prisma/generated/prisma/client";
import { AlertCircleIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const ClanBanAppeal = ({ ban }: { ban: ClanBan }) => {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof banFromClanSchema>>({
    resolver: zodResolver(banFromClanSchema),
    defaultValues: {
      justification: "",
    },
  });

  async function submit(data: z.infer<typeof banFromClanSchema>) {
    try {
      const response = await fetch(`/api/clan/${ban.clanId}/ban/appeal`, {
        method: "POST",
        body: JSON.stringify({
          justification: data.justification,
        }),
      });

      const responseJSON: APIResponse<ClanBan> = await response.json();

      if (!response.ok) throw responseJSON;

      toast({
        title: "Appeal submitted!",
        description: responseJSON.message,
      });
      setOpen(false);
      router.refresh();
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
        <Button>Appeal Ban</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ban Appeal</DialogTitle>
          <DialogDescription>
            Your clan is eligible for appeal. You may still be within your
            timeout period. You must wait for this period to pass before you can
            submit the appeal form. If you believe the ban was a mistake, please
            contact BSCH Staff.
          </DialogDescription>
        </DialogHeader>
        <div>
          <Alert>
            <AlertCircleIcon />
            <AlertTitle>Not a guarantee!</AlertTitle>
            <AlertDescription>
              Not all ban appeals are approved. BSCH reserves the right to deny
              appeals.
            </AlertDescription>
          </Alert>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(submit)}
              className="flex flex-col gap-4 mt-4"
            >
              <FormField
                control={form.control}
                name="justification"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Justification</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="How you'll improve..."
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Why should be unban this clan? What changes will you make
                      going forward?
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex gap-4 justify-end">
                <Button
                  type="button"
                  onClick={() => setOpen(false)}
                  variant="outline"
                >
                  Close
                </Button>
                <Button
                  type="submit"
                  disabled={
                    !form.formState.isValid || form.formState.isSubmitting
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

export default ClanBanAppeal;
