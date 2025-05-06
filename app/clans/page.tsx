"use client";
import GridClanCardDisplay from "@/components/custom/clan-scroller/grid-clan-card-display";
import { ValidClanSpecialties } from "@/components/types/clan-types";
import { Input } from "@/components/ui/input";
import { Toggle } from "@/components/ui/toggle";
import { Search as SearchIcon } from "lucide-react";
import { Dispatch, SetStateAction, useMemo, useState } from "react";
type SetQueryParams = Dispatch<
  SetStateAction<Record<string, string | string[]> | null>
>;

const ClansPage = () => {
  const [filterQueryParams, setFilterQueryParams] = useState<Record<
    string,
    string | Array<string>
  > | null>(null);

  const stableQueryParams = useMemo(
    () => filterQueryParams ?? {},
    [filterQueryParams]
  );

  return (
    <div className="flex flex-col gap-4">
      <section className="relative py-12 overflow-hidden min-h-[300px]">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-t from-transparent to-purple-950/50"></div>
        </div>

        <div className="container mx-auto px-4 relative z-1">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Discover the Best Beat Saber Clans
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Join forces with elite players and those just enjoying the game!
            </p>

            <div className="flex flex-col gap-4 items-center w-full">
              <div className="relative flex-1 w-full">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  onChange={(e) => {
                    setFilterQueryParams((prev) => {
                      return { ...prev, search: e.target.value };
                    });
                  }}
                  placeholder="Search clans..."
                  className="pl-10 bg-gray-900/60 border-gray-700 h-12 w-full"
                />
              </div>
              <Filters setQueryParams={setFilterQueryParams} />
            </div>
          </div>
        </div>
      </section>
      <GridClanCardDisplay
        apiRoute="/api/clans"
        queryParams={{ ...stableQueryParams, orderBy: "application_status" }}
        queryKey={["clans", JSON.stringify(stableQueryParams)]}
      />
    </div>
  );
};

const Filters = ({ setQueryParams }: { setQueryParams: SetQueryParams }) => {
  const filterOptions = ValidClanSpecialties;

  function logic(val: string) {
    setQueryParams((prev) => {
      const curr = prev ?? {};

      const existingSpecialties: string[] = Array.isArray(curr.specialties)
        ? curr.specialties
        : typeof curr.specialties === "string"
        ? [curr.specialties]
        : [];

      const updatedSpecialties = existingSpecialties.includes(val)
        ? existingSpecialties.filter((item) => item !== val)
        : [...existingSpecialties, val];

      return {
        ...curr,
        specialties: updatedSpecialties,
      };
    });
  }

  return (
    <div className="flex gap-2 flex-wrap">
      {filterOptions.map((option) => {
        return <Filter key={option} filter={option} logic={logic} />;
      })}
    </div>
  );
};

const Filter = ({
  filter,
  logic,
}: {
  filter: string;
  logic: (e: string) => void;
}) => {
  return <Toggle onPressedChange={() => logic(filter)}>{filter}</Toggle>;
};

export default ClansPage;
