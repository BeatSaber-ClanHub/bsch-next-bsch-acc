" use client";

import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

function MembersTableLoadingSpinner<TData, TValue>({
  columns,
}: {
  columns: ColumnDef<TData, TValue>[];
}) {
  const table = useReactTable({
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    data: [],
  });

  return (
    <div>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {Array.from({ length: 10 }, (_, i) => i).map((i: number) => {
            return (
              <TableRow key={i}>
                <TableCell>
                  <div className="flex gap-4 items-center">
                    <Skeleton className="w-[40px] h-[40px] rounded-full" />
                    <Skeleton className="w-[60px] h-5" />
                  </div>
                </TableCell>
                <TableCell>
                  <Skeleton className="w-[60px] h-5" />
                </TableCell>
                <TableCell>
                  <Skeleton className="w-[60px] h-5" />
                </TableCell>
                <TableCell>
                  <Skeleton className="w-[60px] h-5" />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

export default MembersTableLoadingSpinner;
