import { Spinner } from "@/components/minimal-tiptap/components/spinner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { User } from "@/prisma/generated/prisma/client";

export const UserInfoPopover = ({
  user,
}: {
  user: Omit<User, "email" | "emailVerified">;
}) => {
  const joinedAt = new Date(user.createdAt);
  return (
    <Popover>
      <PopoverTrigger className="hover:bg-muted rounded-md p-4">
        <div className="flex items-center gap-2">
          <Avatar className="w-[20px] h-[20px]">
            <AvatarFallback>
              <Spinner />
            </AvatarFallback>
            <AvatarImage src={user.image} />
          </Avatar>
          <p>{user.name}</p>
        </div>
      </PopoverTrigger>
      <PopoverContent>
        <div className="flex gap-4">
          <Avatar className="h-[50px] w-[50px]">
            <AvatarFallback>
              <Spinner />
            </AvatarFallback>
            <AvatarImage src={user.image} />
          </Avatar>
          <div className="flex flex-col gap-4">
            <div>
              <p>{user.name}</p>
              {!user.banned ? (
                <Badge className="bg-green-500 hover:bg-green-700">
                  Not Banned
                </Badge>
              ) : (
                <Badge className="bg-red-500 hover:bg-red-700">Banned</Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              Joined{" "}
              {joinedAt.toDateString().split(" ")[1] +
                " " +
                joinedAt.getDate() +
                " " +
                joinedAt.getFullYear()}{" "}
            </p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
