"use client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Copy } from "lucide-react";
import React, { ReactNode, isValidElement } from "react";

interface CopyTextProps {
  children?: ReactNode;
  textToCopy: string;
}

const CopyText = ({ children, textToCopy }: CopyTextProps) => {
  const { toast } = useToast();

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      copyAlert();
    } catch (err) {
      console.error("Failed to copy text: ", err);
      toast({
        title: "Failed to copy text",
        description: "This browser may not support the required API!",
        variant: "destructive", // Or another appropriate variant
      });
    }
  };

  function copyAlert() {
    toast({
      title: "Text copied to clipboard!",
    });
  }

  if (children) {
    // Ensure children is a valid React element
    if (isValidElement(children)) {
      return React.cloneElement(
        children as React.ReactElement,
        {
          onClick: async (e: React.MouseEvent<HTMLElement>) => {
            e.preventDefault();
            await copyToClipboard();
          },
        } as any
      );
    } else {
      console.warn("CopyText: children is not a valid React element.");
      return null;
    }
  }

  return (
    <Button variant="outline" onClick={copyToClipboard}>
      <Copy />
      Copy
    </Button>
  );
};

export default CopyText;
