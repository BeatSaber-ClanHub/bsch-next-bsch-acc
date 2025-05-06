"use client";

import {
  colorClasses,
  ValidClanSpecialties,
} from "@/components/types/clan-types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ClanSpecialties } from "@/prisma/generated/prisma/client";
import { Plus, X } from "lucide-react";
import { useState } from "react";

const EditSpecialtiesSection = ({
  selectedSpecialties,
  clanId,
}: {
  selectedSpecialties: ClanSpecialties[];
  clanId: string;
}) => {
  const [specialties, setSpecialties] =
    useState<ClanSpecialties[]>(selectedSpecialties);
  const { toast } = useToast();

  async function addSpecialty(specialty: ClanSpecialties) {
    try {
      setSpecialties((prev) => [specialty, ...prev]);
      const data: { clan_specialties: ClanSpecialties[] } = {
        clan_specialties: [specialty],
      };
      const response = await fetch(`/api/clan/${clanId}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });

      const responseJSON = await response.json();

      if (!response.ok) throw responseJSON;
    } catch (error) {
      let errorMessage = "Failed to add specialty!";
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
      const newVals: ClanSpecialties[] = specialties.filter(
        (val) => val !== specialty
      );
      setSpecialties(newVals);
    }
  }

  async function removeSpecialty(specialty: ClanSpecialties) {
    try {
      const newVals: ClanSpecialties[] = specialties.filter(
        (val) => val !== specialty
      );
      setSpecialties(newVals);
      const data: { remove_clan_specialties: ClanSpecialties[] } = {
        remove_clan_specialties: [specialty],
      };
      const response = await fetch(`/api/clan/${clanId}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });

      const responseJSON = await response.json();

      if (!response.ok) throw responseJSON;
    } catch (error) {
      let errorMessage = "Failed to remove specialty!";
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
      setSpecialties((prev) => [specialty, ...prev]);
    }
  }

  return (
    <div className="w-full p-4 border-border border-[1px] rounded-md overflow-x-auto no-scrollbar flex gap-4">
      {ValidClanSpecialties.map((specialty) => {
        const color = colorClasses[specialty];
        if (!specialties.includes(specialty)) return null;
        return (
          <Badge
            key={specialty}
            className={`text-lg flex gap-2 items-center border-[2px] border-${color} group cursor-pointer select-none`}
            variant="outline"
          >
            {specialty}
            <Button
              className="hidden group-hover:flex w-[25px] h-[25px] rounded-full"
              variant="ghost"
              onClick={() => removeSpecialty(specialty)}
            >
              <X />
            </Button>
          </Badge>
        );
      })}
      {ValidClanSpecialties.map((specialty) => {
        const color = colorClasses[specialty];
        if (specialties.includes(specialty)) return null;
        return (
          <Badge
            key={specialty}
            className={`text-lg border-[2px] border-${color} border-dashed cursor-pointer select-none gap-2`}
            variant="outline"
          >
            {specialty}
            <Button
              className="w-[25px] h-[25px] rounded-full"
              variant="ghost"
              onClick={() => addSpecialty(specialty)}
            >
              <Plus />
            </Button>
          </Badge>
        );
      })}
    </div>
  );
};

export default EditSpecialtiesSection;
