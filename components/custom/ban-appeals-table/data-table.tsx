"use client";
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ClanStaffRole } from "@/prisma/generated/prisma/client";
import { useState } from "react";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  pageCount: number;
  onPageChange: (next: number) => void;
  pageIndex: number;
  pageSize: number;
  viewingUserRole: ClanStaffRole;
  viewingUserId: string;
  clanId: string;
  updateCache: ({
    newData,
    queryKey,
  }: {
    newData: { id: string; banned: boolean };
    queryKey: Array<string | number>;
  }) => void;
  queryKey: Array<string | number>;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  pageCount,
  onPageChange,
  pageIndex,
  pageSize,
  viewingUserRole,
  viewingUserId,
  clanId,
  updateCache,
  queryKey,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const table = useReactTable({
    data,
    columns,
    enableMultiSort: true,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    getPaginationRowModel: getPaginationRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    manualPagination: true,
    pageCount,
    state: {
      pagination: {
        pageIndex: pageIndex - 1,
        pageSize,
      },
      sorting: sorting,
      columnFilters,
    },
    onPaginationChange: () => {
      const newState = table.getState().pagination;
      onPageChange(newState.pageIndex + 1);
    },
    meta: {
      viewingUserRole: viewingUserRole,
      viewingUserId: viewingUserId,
      clanId: clanId,
      updateCache: updateCache,
      queryKey: queryKey,
    },
  });

  return (
    <div>
      <div className="rounded-md border p-4">
        <div className="flex items-center py-4">
          <Input
            placeholder="Search..."
            value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
            onChange={(event) => {
              table.getColumn("name")?.setFilterValue(event.target.value);
            }}
            className="max-w-sm"
          />
        </div>
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
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex flex-col gap-4 items-center justify-end space-x-2 py-4">
        <div className="flex gap-4">
          <Button
            onClick={() => {
              table.setPageIndex(0);
              onPageChange(1);
            }}
            disabled={!table.getCanPreviousPage()}
          >
            {"<<"}
          </Button>

          <Button
            onClick={() => {
              if (table.getCanPreviousPage()) {
                table.previousPage();
                onPageChange(pageIndex - 1);
              }
            }}
            disabled={!table.getCanPreviousPage()}
          >
            {"<"}
          </Button>
          <Button
            onClick={() => {
              if (table.getCanNextPage()) {
                table.nextPage();
                onPageChange(pageIndex + 1);
              }
            }}
            disabled={!table.getCanNextPage()}
          >
            {">"}
          </Button>
          <Button
            onClick={() => {
              table.setPageIndex(table.getPageCount() - 1);
              onPageChange(table.getPageCount());
            }}
            disabled={!table.getCanNextPage()}
          >
            {">>"}
          </Button>
        </div>
        <div>
          <p>
            <span>
              Page {pageIndex} of {pageCount}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default DataTable;
