"use client";
import { APIResponse } from "@/app/api/types/core/api";
import { columns } from "@/components/custom/clan/admin-members-table/columns";
import {
  BanMutation,
  KickMutation,
  UnbanMutation,
} from "@/components/custom/clan/admin-members-table/types";
import MembersTableLoading from "@/components/custom/clan/members-table/members-table-loading";
import MembersTableLoadingSpinner from "@/components/custom/clan/members-table/members-table-loading-spinner";
import SearchMembers from "@/components/custom/clan/members-table/search-members";
import Pagination from "@/components/custom/tanstack-table/pagination";
import TanStackTable from "@/components/custom/tanstack-table/tan-stack-table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { EnrichedClanMember } from "@/data-access/member";
import useBanFromClan from "@/hooks/custom/use-ban-from-clan";
import useKickMember from "@/hooks/custom/use-kick-member";
import useUnbanFromClan from "@/hooks/custom/use-unban-from-clan";
import { ClanStaffRole, User } from "@/prisma/generated/prisma/client";
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

export function AdminMembersTable({
  id,
  viewingUserRole,
  viewingUser,
}: {
  id: string;
  viewingUserRole: ClanStaffRole;
  viewingUser: Pick<User, "id" | "image" | "name">;
}) {
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

  // get the debouce shujt working
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
  async function getMembers({
    pageIndex,
    pageSize,
    debouncedValue,
  }: {
    pageIndex: number;
    pageSize: number;
    debouncedValue?: string;
  }): Promise<APIResponse<EnrichedClanMember>> {
    if (init.current === false) {
      init.current = true;
    }
    const response = await fetch(
      `/api/clan/${id}/members?offset=${
        (pageIndex - 1) * pageSize
      }&limit=${pageSize}&orderBy=role&sortDirection=asc${
        debouncedValue !== null && debouncedValue !== undefined
          ? "&search=" + debouncedValue
          : ""
      }`
    );
    const responseJSON: APIResponse<EnrichedClanMember> = await response.json();
    if (!response.ok) throw responseJSON.message;
    return responseJSON;
  }

  // Get data from API
  const { data, status, isFetching } = useQuery({
    queryKey: ["members", id, pageIndex, pageSize, { search: debouncedValue }],
    queryFn: () => getMembers({ pageIndex, pageSize, debouncedValue }),
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  });

  function changePage(newPageIndex: number) {
    setPageIndex(newPageIndex);
  }

  const { mutateAsync: banMutation } = useBanFromClan(id);
  const { mutateAsync: unbanMutation } = useUnbanFromClan(id);
  const { mutateAsync: kickMemberMutation } = useKickMember();

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

  let pageCount = 0;
  let searchResults: EnrichedClanMember[] = [];

  if (data) {
    pageCount = data.metadata!.pagination.totalPages;
    searchResults = data.items!;
  }

  // Initial Load
  if (!init.current && isFetching) {
    return <MembersTableLoading />;
  }

  return (
    <FullTanStackTable
      columns={columns}
      data={searchResults}
      pageCount={pageCount}
      pageIndex={pageIndex}
      pageSize={pageSize}
      onPageChange={changePage}
      viewingUser={viewingUser}
      setTanstackTableSearchBarValue={setTanstackTableSearchBarValue}
      tanstackTableSearchBarValue={tanstackTableSearchBarValue}
      viewingUserRole={viewingUserRole}
      clanId={id}
      banMutation={banMutation}
      unbanMutation={unbanMutation}
      kickMemberMutation={kickMemberMutation}
      loading={isFetching}
    />
  );
}

interface DataTableProps {
  columns: ColumnDef<EnrichedClanMember>[];
  data: EnrichedClanMember[];
  pageCount: number;
  onPageChange: (next: number) => void;
  pageIndex: number;
  pageSize: number;
  viewingUser: Pick<User, "id" | "image" | "name">;
  setTanstackTableSearchBarValue: (value: string) => void;
  tanstackTableSearchBarValue: string | undefined;
  loading: boolean;
  unbanMutation: UnbanMutation;
  banMutation: BanMutation;
  kickMemberMutation: KickMutation;
  viewingUserRole: ClanStaffRole;
  clanId: string;
}

const FullTanStackTable = ({
  columns,
  data,
  pageCount,
  onPageChange,
  pageIndex,
  pageSize,
  viewingUser,
  setTanstackTableSearchBarValue,
  tanstackTableSearchBarValue,
  loading,
  clanId,
  banMutation,
  unbanMutation,
  viewingUserRole,
  kickMemberMutation,
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
      viewingUserRole: viewingUserRole,
      // viewingUserId: viewingUserId,
      viewingUser: viewingUser,
      clanId: clanId,
      banMutation: banMutation,
      unbanMutation: unbanMutation,
      kickMemberMutation: kickMemberMutation,
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
          <MembersTableLoadingSpinner columns={columns} />
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
