"use client";
import { Spinner } from "@/components/minimal-tiptap/components/spinner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { auth } from "@/lib/auth";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";

type Session = typeof auth.$Infer.Session;

const AccountDropdown = ({
  session,
  showName,
}: {
  session: Session;
  showName?: "show" | "hide";
}) => {
  const [loading, setLoading] = useState(false);

  async function logOut() {
    try {
      setLoading(true);
      await authClient.signOut({
        fetchOptions: {
          onSuccess: async () => {
            window.location.reload();
          },
        },
      });
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  }

  return (
    <DropdownMenu>
      <div className="flex gap-4 items-center">
        <DropdownMenuTrigger>
          <Avatar>
            <AvatarFallback>
              <Skeleton className="w-10 h-10 rounded-md" />
            </AvatarFallback>
            <AvatarImage src={session.user.image!} />
          </Avatar>
        </DropdownMenuTrigger>
        {showName === "show" && <p>{session.user.name}</p>}
      </div>
      <DropdownMenuContent>
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Link href="/profile" className="w-full h-full">
            Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Link href="/dashboard" className="w-full h-full">
            Dashboard
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Button
            variant="destructive"
            className="w-full"
            onClick={logOut}
            disabled={loading}
          >
            Log out {loading && <Spinner />}
          </Button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default AccountDropdown;
