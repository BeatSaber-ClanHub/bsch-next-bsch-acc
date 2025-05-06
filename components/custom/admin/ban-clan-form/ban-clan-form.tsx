"use client";
import BanForm from "@/components/custom/admin/ban-clan-form/ban-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ClanWithClanOwnerInfoAndBasicData } from "@/data-access/clan";
import { Lock } from "lucide-react";
import React, { ReactNode, useState } from "react";

const BanClanForm = ({
  clan,
  dropdownMenuItem = null,
  setOpenCallback,
}: {
  clan: ClanWithClanOwnerInfoAndBasicData;
  dropdownMenuItem?: ReactNode;
  setOpenCallback?: React.Dispatch<React.SetStateAction<boolean>> | undefined;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {dropdownMenuItem !== null ? (
          dropdownMenuItem
        ) : (
          <Button variant="destructive">
            <Lock />
            Ban Clan
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ban Clan</DialogTitle>
          <DialogDescription>
            Banning a clan will submit a ban record and set the banned status to
            true.
          </DialogDescription>
        </DialogHeader>
        <BanForm
          setOpen={setOpen}
          clan={clan}
          setOpenCallback={setOpenCallback}
        />
      </DialogContent>
    </Dialog>
  );
};

export default BanClanForm;
