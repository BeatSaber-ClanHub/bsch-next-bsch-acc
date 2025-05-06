"use client";
import BSCHLogo from "@/components/custom/general-website/bsch-logo";
import LoginButton from "@/components/custom/general-website/navigation/login-button";
import AccountDropdown from "@/components/custom/general-website/navigation/user-account-dropdown";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { auth } from "@/lib/auth";
import { Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type Session = typeof auth.$Infer.Session;

export default function MobileNavigationMenu({
  session,
}: {
  session: Session;
}) {
  const [open, setOpen] = useState(false);

  const path = usePathname();
  useEffect(() => {
    if (open) {
      setOpen(false);
    }
  }, [path]);

  return (
    <header className="flex p-4 w-full shrink-0 items-center px-4 bg-background/30 backdrop-blur-md md:px-6 border-b-[1px]">
      <Sheet onOpenChange={setOpen} open={open}>
        <div className="flex justify-between w-full">
          <BSCHLogo />
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="lg:hidden">
              <Menu />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
        </div>
        <SheetContent side="left">
          <div className="flex gap-4 items-center">
            <BSCHLogo />
            <SheetTitle>BSCH</SheetTitle>
          </div>
          <div className="grid gap-2 py-6">
            <Link
              href="/"
              className="flex w-full items-center py-2 text-lg"
              prefetch={false}
            >
              Home
            </Link>
            <Link
              href="/clans"
              className="flex w-full items-center py-2 text-lg"
              prefetch={false}
            >
              Clans
            </Link>
            <Link
              href="/docs"
              className="flex w-full items-center py-2 text-lg"
              prefetch={false}
            >
              Documentation
            </Link>
            <Link
              href="/"
              className="flex w-full items-center py-2 text-lg"
              prefetch={false}
            >
              Discord
            </Link>
            <div className="absolute bottom-0 pb-4 right-0 pl-4 pr-4 w-full">
              {session && <AccountDropdown session={session} showName="show" />}
              {!session && <LoginButton className="w-full" />}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
}
