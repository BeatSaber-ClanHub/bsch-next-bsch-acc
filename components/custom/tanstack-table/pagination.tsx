"use client";
import { Button } from "@/components/ui/button";
import { useReactTable } from "@tanstack/react-table";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeftIcon,
  ChevronsRight,
} from "lucide-react";

function Pagination<T = unknown>({
  table,
  onPageChange,
  pageIndex,
  pageCount,
}: {
  table: ReturnType<typeof useReactTable<T>>;
  onPageChange: (next: number) => void;
  pageIndex: number;
  pageCount: number;
}) {
  return (
    <div className="flex flex-col gap-4 items-center justify-end space-x-2 py-4">
      <div className="flex gap-4">
        <Button
          onClick={() => {
            table.setPageIndex(0);
            onPageChange(1);
          }}
          disabled={!table.getCanPreviousPage()}
        >
          <ChevronsLeftIcon />
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
          <ChevronLeft />
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
          <ChevronRight />
        </Button>
        <Button
          onClick={() => {
            table.setPageIndex(table.getPageCount() - 1);
            onPageChange(table.getPageCount());
          }}
          disabled={!table.getCanNextPage()}
        >
          <ChevronsRight />
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
  );
}

export default Pagination;
