import CopyText from "@/components/custom/general-website/copy-text";
import DeleteAPIKey from "@/components/custom/profile/delete-api-key";
import VisableKey from "@/components/custom/profile/visable-key";
import UpdateAPIKeyName from "@/components/custom/profile/update-api-key-name";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { APIKeyWithDecrypt } from "@/data-access/types/types";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Copy, Ellipsis } from "lucide-react";

export type Key = APIKeyWithDecrypt;

export const columns: ColumnDef<Key>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ row }) => {
      const createdAt = row.original.createdAt;
      return <p>{format(new Date(createdAt), "yyyy-MM-dd HH:mm:ss")}</p>;
    },
  },
  {
    accessorKey: "encryptedKey",
    header: "Key",
    cell: ({ row }) => {
      const key = row.original.decryptedKey;
      return <VisableKey apiKey={key} />;
    },
  },
  {
    accessorKey: "expireAt",
    header: "Expires At",
    cell: ({ row }) => {
      const expireAt = row.original.expireAt;
      if (!expireAt) return <p>Doesn&apos;t Expire</p>;
      return (
        <p>
          {format(
            new Date(expireAt).toLocaleDateString(),
            "yyyy-MM-dd HH:mm:ss"
          )}
        </p>
      );
    },
  },
  {
    header: "Status",
    cell: ({ row }) => {
      const expireAt = row.original.expireAt
        ? new Date(row.original.expireAt)
        : null;
      const isExpired = expireAt ? expireAt <= new Date() : false;

      return isExpired ? (
        <Badge variant="destructive">Expired</Badge>
      ) : (
        <Badge className="bg-green-500 hover:bg-green-700">Valid</Badge>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const key = row.original.decryptedKey;
      const whole = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <Ellipsis />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <CopyText textToCopy={key}>
              <DropdownMenuItem>
                <Copy />
                Copy Key
              </DropdownMenuItem>
            </CopyText>
            <DropdownMenuSeparator />
            <UpdateAPIKeyName apiKey={whole} />
            <DeleteAPIKey apiKey={whole} />
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
