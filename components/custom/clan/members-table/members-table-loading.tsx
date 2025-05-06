"use client";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
                <div></div>
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
                    <Skeleton className="w-[32px] h-[32px]" />
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

export default MembersTableLoading;
