"use client";
import { useToast as ut } from "@/hooks/use-toast";
import { ReactNode } from "react";

const useToast = () => {
  const { toast } = ut();

  return (message: ReactNode) => {
    toast({
      title: "Success!",
      description: message,
    });
  };
};

export default useToast;
