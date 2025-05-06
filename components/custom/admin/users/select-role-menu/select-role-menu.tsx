"use client";
import {
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BasicUser } from "@/data-access/user";
import useSiteRoleAssignment from "@/hooks/custom/use-site-role-assignment";
import useSiteRoleUnassignment from "@/hooks/custom/use-site-role-unassignment";
import { Role } from "@/prisma/generated/prisma/client";
import canManage from "@/utils/can-manage";
import { Shield, User, UserCog, Search, Code, Users } from "lucide-react";
import { useState } from "react";

const SelectRoleMenu = ({
  user,
  activeUserRole,
  type = "select",
}: {
  user: BasicUser;
  activeUserRole: Role;
  type?: "dropdown" | "select";
}) => {
  const userRole = user.staff?.role || "User";
  const canMangeUser = canManage({ activeUserRole, otherUserRole: userRole });
  if (!canMangeUser) return null;

  let siteRoles: Array<Role | "User"> = [
    "User",
    "Currator",
    "Moderator",
    "Administrator",
    "Developer",
  ];

  if (activeUserRole === "Moderator") {
    siteRoles = ["Currator", "Moderator"];
  } else if (activeUserRole == "Administrator") {
    siteRoles = ["Currator", "Moderator", "Administrator"];
  }
  const [loading, setLoading] = useState(false);
  const { mutateAsync } = useSiteRoleAssignment();
  const { mutateAsync: unassign } = useSiteRoleUnassignment();

  const onSubmit = async (value: Role | "User") => {
    try {
      setLoading(true);
      if (value === "User") {
        if (userRole === "User") return;
        await unassign({ userId: user.id });
      } else {
        if (userRole === value) return;
        await mutateAsync({ newRole: value, userId: user.id });
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  if (type === "dropdown") {
    return (
      <DropdownMenuSub>
        <DropdownMenuSubTrigger>
          <Shield />
          Role
        </DropdownMenuSubTrigger>
        <DropdownMenuPortal>
          <DropdownMenuSubContent>
            {siteRoles.map((value: Role | "User", index) => {
              return (
                <DropdownMenuItem
                  key={index}
                  onClick={() => onSubmit(value)}
                  className={userRole === value ? "bg-accent" : ""}
                >
                  {value === "User" && <User />}
                  {value === "Administrator" && <UserCog />}
                  {value === "Currator" && <Search />}
                  {value === "Developer" && <Code />}
                  {value === "Moderator" && <Users />}
                  {value}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuSubContent>
        </DropdownMenuPortal>
      </DropdownMenuSub>
    );
  }
  return (
    <Select
      onValueChange={(value: string) => {
        onSubmit(value as Role);
      }}
      disabled={loading}
      defaultValue={userRole}
    >
      <SelectTrigger className={loading ? "animate-pulse" : ""}>
        <SelectValue placeholder="Select a role" />
      </SelectTrigger>
      <SelectContent>
        {siteRoles.map((value: Role | "User", index) => {
          return (
            <SelectItem key={index} value={value}>
              <p className="flex items-center gap-2">
                {value === "User" && <User />}
                {value === "Administrator" && <UserCog />}
                {value === "Currator" && <Search />}
                {value === "Developer" && <Code />}
                {value === "Moderator" && <Users />}
                {value}
              </p>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
};

export default SelectRoleMenu;
