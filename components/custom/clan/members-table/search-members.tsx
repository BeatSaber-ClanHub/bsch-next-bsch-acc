"use client";

import { Input } from "@/components/ui/input";

const SearchMembers = ({
  tanstackTableSearchBarValue,
  setTanstackTableSearchBarValue,
}: {
  tanstackTableSearchBarValue: string | undefined;
  setTanstackTableSearchBarValue: (value: string) => void;
}) => {
  return (
    <Input
      placeholder="Search..."
      value={tanstackTableSearchBarValue || ""}
      onChange={(event) => {
        setTanstackTableSearchBarValue(event.target.value);
      }}
      className="max-w-sm"
    />
  );
};

export default SearchMembers;
