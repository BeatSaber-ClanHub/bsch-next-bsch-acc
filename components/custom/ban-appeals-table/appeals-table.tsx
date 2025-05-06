"use client";
import { APIResponse } from "@/app/api/types/core/api";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ClanMember } from "@/data-access/types/types";
import { ClanStaffRole } from "@/prisma/generated/prisma/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle } from "lucide-react";
import { useState } from "react";
import { columns } from "./columns";
import { DataTable } from "./data-table";

export function AdminMembersTable({
  id,
  viewingUserRole,
  viewingUserId,
}: {
  id: string;
  viewingUserRole: ClanStaffRole;
  viewingUserId: string;
}) {
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize] = useState(20);
  const queryClient = useQueryClient();

  const { data, status } = useQuery({
    queryKey: ["members", id, pageIndex, pageSize],
    queryFn: () => getMembers({ pageIndex, pageSize }),
  });

  function changePage(newPageIndex: number) {
    setPageIndex(newPageIndex);
  }

  async function getMembers({
    pageIndex,
    pageSize,
  }: {
    pageIndex: number;
    pageSize: number;
  }): Promise<APIResponse<ClanMember>> {
    const response = await fetch(
      `/api/clan/${id}/members?offset=${
        (pageIndex - 1) * pageSize
      }&limit=${pageSize}`
    );
    const responseJSON: APIResponse<ClanMember> = await response.json();
    if (!response.ok) throw responseJSON;

    return responseJSON;
  }

  function updateCache({
    newData,
    queryKey,
  }: {
    newData: { id: string; banned: boolean };
    queryKey: Array<string | number>;
  }) {
    console.log("searching for user with id of", newData.id);
    queryClient.setQueryData(
      queryKey,
      (data: APIResponse<ClanMember> | undefined) => {
        if (!data) return; // If no data is found, return early

        const updatedItems = data.items?.map((member) => {
          if (member.id === newData.id) {
            // Replace with the ID of the member you're updating
            const t = {
              ...member,
              ...newData, // Spread the new data to update the member
            };
            console.log("setting data to ", t);
            return t;
          }
          return member; // Return the member unchanged if it's not the one we're updating
        });

        return {
          ...data,
          items: updatedItems,
        };
      }
    );
  }

  if (status === "error") {
    return (
      <Alert variant="destructive">
        <AlertCircle />
        <AlertTitle>Uh Oh!</AlertTitle>
        <AlertDescription>
          There was an issue fetching members!
        </AlertDescription>
      </Alert>
    );
  }

  if (status === "success") {
    return (
      <DataTable
        viewingUserRole={viewingUserRole}
        viewingUserId={viewingUserId}
        columns={columns}
        data={data!.items as ClanMember[]}
        pageCount={data.metadata!.pagination.totalPages}
        pageIndex={pageIndex}
        pageSize={pageSize}
        onPageChange={changePage}
        clanId={id}
        updateCache={updateCache}
        queryKey={["members", id, pageIndex, pageSize]}
      />
    );
  }
  return <MembersTableLoading />;
}

const MembersTableLoading = () => {
  return (
    <div>
      <div className="rounded-md border p-4">
        <Table className="min-w-[500px]">
          <TableHeader>
            <TableRow>
              <TableHead className="flex justify-between items-center">
                <div className="flex gap-4 items-center">
                  <Skeleton className="w-[60px] h-5" />
                  <div className="w-[40px] h-[40px] rounded-full"></div>
                </div>
                <Skeleton className="w-[60px] h-5" />
                <Skeleton className="w-[60px] h-5" />
                <Skeleton className="w-[60px] h-5" />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 10 }, (_, i) => i).map((i: number) => {
              return (
                <TableRow key={i}>
                  <TableCell className="flex justify-between items-center space-x-4">
                    <div className="flex gap-4 items-center">
                      <Skeleton className="w-[40px] h-[40px] rounded-full" />
                      <Skeleton className="w-[60px] h-5" />
                    </div>
                    <Skeleton className="w-[60px] h-5" />
                    <Skeleton className="w-[60px] h-5" />
                    <Skeleton className="w-[60px] h-5" />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
