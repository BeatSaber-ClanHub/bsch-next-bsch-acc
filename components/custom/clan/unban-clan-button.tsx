"use client";
import { Spinner } from "@/components/minimal-tiptap/components/spinner";
import { Button } from "@/components/ui/button";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { ClanWithClanOwnerInfoAndBasicData } from "@/data-access/clan";
import useUnbanClan from "@/hooks/custom/use-unban-clan";
import { Unlock } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { SetStateAction, useState } from "react";

const UnbanClanButton = ({
  clan,
  setParentLoading = null,
  dropdownMenuItem = false,
}: {
  clan: ClanWithClanOwnerInfoAndBasicData;
  setParentLoading?: React.Dispatch<SetStateAction<string>> | null;
  dropdownMenuItem?: boolean;
}) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { mutateAsync } = useUnbanClan();

  async function unbanClan(
    e: React.MouseEvent<HTMLDivElement | HTMLButtonElement>
  ) {
    try {
      e.preventDefault();
      setLoading(true);
      if (setParentLoading !== null) setParentLoading(clan.id);
      await mutateAsync({ clanId: clan.id });
      setLoading(false);
      if (setParentLoading !== null) setParentLoading("");
      router.refresh();
    } catch (error) {
      setLoading(false);
      if (setParentLoading !== null) setParentLoading("");
    }
  }

  if (dropdownMenuItem) {
    return (
      <DropdownMenuItem
        onClick={unbanClan}
        disabled={loading}
        className="text-red-500"
      >
        {loading && <Spinner />}
        <Unlock /> Unban Clan
      </DropdownMenuItem>
    );
  }
  return (
    <Button onClick={unbanClan} disabled={loading} variant="destructive">
      {loading && <Spinner />}
      <Unlock /> Unban Clan
    </Button>
  );
};

export default UnbanClanButton;
