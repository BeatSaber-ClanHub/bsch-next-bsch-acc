"use client";
import { Button } from "@/components/ui/button";
import { ClanStaffRole } from "@/prisma/generated/prisma/client";
import { Notebook } from "lucide-react";
import { Dispatch, SetStateAction } from "react";

const NoDescription = ({
  clanRole,
  setDisplayEditor,
}: {
  clanRole: ClanStaffRole | null;
  setDisplayEditor: Dispatch<SetStateAction<boolean>>;
}) => {
  return (
    <div className="w-full h-[calc(300px-96px)] flex flex-col gap-4 items-center justify-center text-muted-foreground">
      <Notebook />
      <p>No Description</p>
      {clanRole === "Administrator" || clanRole === "Creator" ? (
        <Button onClick={() => setDisplayEditor((prev) => !prev)}>
          Add one!
        </Button>
      ) : null}
    </div>
  );
};

export default NoDescription;
