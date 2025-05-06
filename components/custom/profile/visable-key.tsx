"use client";
import { Button } from "@/components/ui/button";
import { Eye, EyeClosed } from "lucide-react";
import { useState } from "react";

const VisableKey = ({ apiKey }: { apiKey: string }) => {
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => {
    setIsVisible((prev) => !prev);
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        onClick={toggleVisibility}
        variant={"ghost"}
        className="!w-[30px] !h-[30px]"
      >
        {isVisible ? <EyeClosed size={15} /> : <Eye size={15} />}
      </Button>
      <div className="p-[4px] border rounded-md flex max-w-[150px] w-[150px] overflow-hidden">
        <p className="text-[12px]">{isVisible ? apiKey : apiKey.slice(0, 3)}</p>
        {!isVisible && (
          <div className="flex">
            {/* Add spacing between dots */}
            {Array.from({ length: 17 }).map((_, i) => (
              <p key={i} className="text-[12px] tracking-tighter">
                &#9679;
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VisableKey;
