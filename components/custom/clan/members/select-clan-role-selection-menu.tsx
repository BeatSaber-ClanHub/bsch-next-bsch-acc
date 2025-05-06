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
import { EnrichedClanMember } from "@/data-access/member";
import useClanRoleAssignment from "@/hooks/custom/use-clan-role-assignment";
import useClanRoleUnassignment from "@/hooks/custom/use-clan-role-unassignment";
import { ClanStaffRole } from "@/prisma/generated/prisma/client";
import { Shield, User, UserCog, Users } from "lucide-react";
import { useState } from "react";

const SelectClanRoleSelectionMenu = ({
  member,
  clanId,
  type = "select",
}: {
  member: EnrichedClanMember & { role: ClanStaffRole | "Member" };
  clanId: string;
  type?: "dropdown" | "select";
}) => {
  const clanStaffRoles: Array<ClanStaffRole | "Member"> = [
    "Member",
    "Moderator",
    "Administrator",
  ];
  const [loading, setLoading] = useState(false);

  const { mutateAsync } = useClanRoleAssignment(clanId);
  const { mutateAsync: unassignClanRole } = useClanRoleUnassignment(clanId);

  const onSubmit = async (value: ClanStaffRole | "Member") => {
    try {
      setLoading(true);

      if (value === "Member") {
        if (member.role === "Member") return;

        await unassignClanRole({
          userId: member.user.id,
        });
      } else {
        if (value === member.role) return;
        await mutateAsync({
          newRole: value,
          userId: member.user.id,
        });
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
            {clanStaffRoles.map((value, index) => {
              return (
                <DropdownMenuItem
                  key={index}
                  onClick={() => onSubmit(value)}
                  className={member.role === value ? "bg-accent" : ""}
                >
                  {value === "Administrator" && <UserCog />}
                  {value === "Moderator" && <Users />}
                  {value === "Member" && <User />}
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
        onSubmit(value as ClanStaffRole);
      }}
      disabled={loading}
      defaultValue={member.role === "Member" ? "" : member.role}
    >
      <SelectTrigger className={loading ? "animate-pulse" : ""}>
        <SelectValue placeholder="Select a role" />
      </SelectTrigger>
      <SelectContent>
        {clanStaffRoles.map((value, index) => {
          return (
            <SelectItem key={index} value={value}>
              <p className="flex items-center gap-2">
                {value === "Administrator" ? <UserCog /> : <User />}
                {value}
              </p>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
};

export default SelectClanRoleSelectionMenu;
