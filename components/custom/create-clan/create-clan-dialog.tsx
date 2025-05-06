"use client";

import CreateClanForm from "@/components/custom/create-clan/create-clan-form/create-clan-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";

const CreateClanDialog = () => {
  const [open, setOpen] = useState(false);
  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <Button>Create</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[95vh] w-[95vw] sm:max-w-[500px] ">
        <DialogHeader>
          <DialogTitle>Create your clan!</DialogTitle>
          <DialogDescription>
            Fill out the form to get started! This information can be changed
            later!
          </DialogDescription>
        </DialogHeader>
        <CreateClanForm setOpen={setOpen} />
      </DialogContent>
    </Dialog>
  );
};

export default CreateClanDialog;
