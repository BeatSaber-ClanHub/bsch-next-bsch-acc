"use client";

import BanClanForm from "@/components/custom/admin/ban-clan-form/ban-clan-form";
import { ActionsMenuChildrenProps } from "@/components/custom/admin/clans/all-clans-table/types";
import UnbanClanButton from "@/components/custom/clan/unban-clan-button";
import CopyText from "@/components/custom/general-website/copy-text";
import { Spinner } from "@/components/minimal-tiptap/components/spinner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Check,
  Copy,
  Lock,
  MoreHorizontal,
  SquareArrowOutUpRight,
  X,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const Dropdown = ({
  clan,
  verifyClan,
  verifyLoading,
  unverifyClan,
  unverifyLoading,
  role,
}: ActionsMenuChildrenProps) => {
  const [loading, setLoading] = useState(false);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <CopyText textToCopy={clan.id}>
          <DropdownMenuItem>
            <Copy />
            Copy clan ID
          </DropdownMenuItem>
        </CopyText>
        <Link href={`/clan/${clan.id}`} target="_blank">
          <DropdownMenuItem>
            <SquareArrowOutUpRight />
            Open Clan
          </DropdownMenuItem>
        </Link>
        {!clan!.banned && role !== "Currator" ? (
          <BanClanForm
            clan={clan!}
            setOpenCallback={() => setLoading(false)}
            dropdownMenuItem={
              <Button
                className="text-red-500 w-full justify-start !p-2"
                variant="ghost"
                onSelect={(e) => e.stopPropagation()}
                disabled={loading}
              >
                {loading && <Spinner />} <Lock />
                Ban Clan
              </Button>
            }
          />
        ) : null}
        {/* Unban button */}
        {clan!.banned && role !== "Currator" ? (
          <UnbanClanButton clan={clan} dropdownMenuItem={true} />
        ) : null}

        {/* Verify button */}
        {clan.visibility === "Visible" &&
        !clan.banned &&
        clan.application_status !== "Approved" ? (
          <DropdownMenuItem onClick={verifyClan} disabled={verifyLoading}>
            {verifyLoading && <Spinner />}
            <Check /> Verify
          </DropdownMenuItem>
        ) : null}

        {/* Unverify button */}
        {clan.application_status === "Approved" ? (
          <DropdownMenuItem onClick={unverifyClan} disabled={unverifyLoading}>
            {unverifyLoading && <Spinner />}
            <X /> Unverify
          </DropdownMenuItem>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default Dropdown;
