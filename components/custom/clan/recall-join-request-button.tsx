"use client";
import { Spinner } from "@/components/minimal-tiptap/components/spinner";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const RecallJoinRequestButton = ({
  clanId,
  onSuccess,
}: {
  clanId: string;
  onSuccess?: () => void;
}) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  async function recall() {
    try {
      setLoading(true);
      const response = await fetch(`/api/clan/${clanId}/join/request/recall`, {
        method: "POST",
      });

      const responseJSON = await response.json();

      if (!response.ok) throw responseJSON;

      toast({
        title: "Join request recalled!",
        description:
          "Your request to join this clan has been recalled. You can always request again.",
      });

      router.refresh();
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      let errorMessage = "Failed to recall join request!";
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
    } finally {
      setLoading(false);
    }
  }
  return (
    <Button variant="destructive" disabled={loading} onClick={recall}>
      {loading && <Spinner />}
      <X />
      Recall Join Request
    </Button>
  );
};

export default RecallJoinRequestButton;
