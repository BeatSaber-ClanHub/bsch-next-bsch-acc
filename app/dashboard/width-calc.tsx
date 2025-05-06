"use client";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { ReactNode } from "react";

const WidthCalc = ({ children }: { children: ReactNode }) => {
  const { open, isMobile } = useSidebar();

  return (
    <div
      className={`${
        open && !isMobile ? "w-[calc(100vw-266px)]" : "w-[calc(100vw-16px)]"
      }`}
    >
      <div className="w-full border-b p-4 fixed bg-background/30 backdrop-blur-md z-[11]">
        <SidebarTrigger />
      </div>
      <div className="max-w-[1600px] ml-auto mr-auto p-4 mt-[62px] w-full">
        {children}
      </div>
    </div>
  );
};

export default WidthCalc;
