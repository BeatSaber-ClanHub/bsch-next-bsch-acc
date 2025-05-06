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

function AllUsersTableLoading<TData, TValue>({
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
              <TableRow key={i} className="min-h-[70px] h-[70px]">
                {Array.from({ length: columns.length }, (_, i) => i).map(
                  (i: number) => {
                    if (i + 1 === columns.length) {
                      return (
                        <TableCell key={i}>
                          <Skeleton className="w-[32px] h-[32px]" />
                        </TableCell>
                      );
                    }
                    return (
                      <TableCell key={i}>
                        <Skeleton className="w-[60px] h-5" />
                      </TableCell>
                    );
                  }
                )}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

export default AllUsersTableLoading;
