"use client";
import { useToast } from "@/hooks/use-toast";

const useErrorToast = () => {
  const { toast } = useToast();

  return (error: unknown, defaultErrorMessage: string) => {
    let errorMessage = defaultErrorMessage;

    if (error instanceof TypeError) {
      errorMessage = "Network error. Please check your connection.";
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
  };
};

export default useErrorToast;
