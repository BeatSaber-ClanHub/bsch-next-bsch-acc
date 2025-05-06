"use client";
import { APIResponse } from "@/app/api/types/core/api";
import AllClansTableLoading from "@/components/custom/admin/clans/all-clans-table/all-clans-table-loading";
import AllUsersTableLoading from "@/components/custom/admin/users/all-users-table/all-users-table-loading";
import { columns } from "@/components/custom/admin/users/all-users-table/columns";
import SearchMembers from "@/components/custom/clan/members-table/search-members";
import Pagination from "@/components/custom/tanstack-table/pagination";
import TanStackTable from "@/components/custom/tanstack-table/tan-stack-table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { BasicUser } from "@/data-access/user";
import { Role } from "@/prisma/generated/prisma/client";
import { useQuery } from "@tanstack/react-query";
import {
  ColumnDef,
  ColumnFiltersState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { debounce } from "lodash";
import { AlertCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export function AllUsersTable({ role }: { role: Role }) {
  // State
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize] = useState(20);
  const [tanstackTableSearchBarValue, setTanstackTableSearchBarValue] =
    useState<string | undefined>(undefined);
  const init = useRef(false);
  const [debouncedValue, setDebouncedValue] = useState(
    tanstackTableSearchBarValue
  );

  useEffect(() => {
    setPageIndex(1);
  }, [tanstackTableSearchBarValue]);

  useEffect(() => {
    const debouncedFn = debounce(async () => {
      setDebouncedValue(tanstackTableSearchBarValue);
    }, 200);

    debouncedFn();

    return () => {
      debouncedFn.cancel();
    };
  }, [debouncedValue, tanstackTableSearchBarValue]);

  // Query API
  async function getClans({
    pageIndex,
    pageSize,
    debouncedValue,
  }: {
    pageIndex: number;
    pageSize: number;
    debouncedValue?: string;
  }): Promise<APIResponse<BasicUser>> {
    if (init.current === false) {
      init.current = true;
    }
    const response = await fetch(
      `/api/users?offset=${
        (pageIndex - 1) * pageSize
      }&limit=${pageSize}&orderBy=role&sortDirection=asc&includeBannedUsers=true${
        debouncedValue !== null && debouncedValue !== undefined
          ? "&search=" + debouncedValue
          : ""
      }`
    );
    const responseJSON: APIResponse<BasicUser> = await response.json();
    if (!response.ok) throw responseJSON.message;
    return responseJSON;
  }

  // Get data from API
  const { data, status, isFetching } = useQuery({
    queryKey: ["all_users", pageIndex, pageSize, { search: debouncedValue }],
    queryFn: () => getClans({ pageIndex, pageSize, debouncedValue }),
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  });

  function changePage(newPageIndex: number) {
    setPageIndex(newPageIndex);
  }

  if (status === "error") {
    return (
      <Alert variant="destructive">
        <AlertCircle />
        <AlertTitle>Uh Oh!</AlertTitle>
        <AlertDescription>There was an issue fetching users!</AlertDescription>
      </Alert>
    );
  }

  let pageCount = 0;
  let searchResults: BasicUser[] = [];

  if (data) {
    pageCount = data.metadata!.pagination.totalPages;
    searchResults = data.items!;
  }

  // Initial Load
  if (!init.current && isFetching) {
    return (
      <div className="rounded-md border p-4 flex flex-col gap-4">
        <AllClansTableLoading columns={columns} />
      </div>
    );
  }

  return (
    <FullTanStackTable
      columns={columns}
      data={searchResults}
      pageCount={pageCount}
      pageIndex={pageIndex}
      pageSize={pageSize}
      onPageChange={changePage}
      setTanstackTableSearchBarValue={setTanstackTableSearchBarValue}
      tanstackTableSearchBarValue={tanstackTableSearchBarValue}
      loading={isFetching}
      activeUserRole={role}
    />
  );
}

interface DataTableProps {
  columns: ColumnDef<BasicUser>[];
  data: BasicUser[];
  pageCount: number;
  onPageChange: (next: number) => void;
  pageIndex: number;
  pageSize: number;
  setTanstackTableSearchBarValue: (value: string) => void;
  tanstackTableSearchBarValue: string | undefined;
  loading: boolean;
  activeUserRole: Role;
}

const FullTanStackTable = ({
  columns,
  data,
  pageCount,
  onPageChange,
  pageIndex,
  pageSize,
  setTanstackTableSearchBarValue,
  tanstackTableSearchBarValue,
  loading,
  activeUserRole,
}: DataTableProps) => {
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
      activeUserRole: activeUserRole,
    },
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-md border p-4 flex flex-col gap-4">
        <SearchMembers
          setTanstackTableSearchBarValue={setTanstackTableSearchBarValue}
          tanstackTableSearchBarValue={
            tanstackTableSearchBarValue === undefined
              ? ""
              : tanstackTableSearchBarValue
          }
        />
        {loading ? (
          <AllUsersTableLoading columns={columns} />
        ) : data ? (
          <TanStackTable table={table} />
        ) : (
          <div>No results found.</div>
        )}
      </div>
      <Pagination
        onPageChange={onPageChange}
        pageCount={pageCount}
        pageIndex={pageIndex}
        table={table}
      />
    </div>
  );
};
