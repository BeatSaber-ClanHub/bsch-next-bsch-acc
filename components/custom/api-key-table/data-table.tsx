"use client";
import NewAPIKeyDialog from "@/components/custom/profile/new-api-key-dialog";
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  useReactTable,
} from "@tanstack/react-table";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="rounded-md border flex flex-col">
      <CardHeader>
        <div className="sm:flex-row flex flex-col w-full items-center justify-between">
          <div className="flex flex-col gap-2">
            <CardTitle>API Keys</CardTitle>
            <CardDescription>
              These keys allow you to authenticate API requests. Keep them
              secure and don&apos;t share them!
            </CardDescription>
          </div>
          <NewAPIKeyDialog numOfKeys={data.length} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="p-[4px] border rounded-md flex max-w-[100px] w-[100px] items-center justify-center overflow-hidden">
          <p className="text-muted-foreground text-sm">
            <span className={`${data.length >= 20 ? "text-red-500" : ""}`}>
              {data.length}/20
            </span>{" "}
            keys used
          </p>
        </div>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
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
      </CardContent>
    </div>
  );
}

export default DataTable;
