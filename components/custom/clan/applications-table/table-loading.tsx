import { TableRowLoading } from "@/components/custom/clan/applications-table/table-row-loading";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCaption,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const TableLoading = () => {
  return (
    <Table>
      <TableCaption>
        <Skeleton className="w-[200px] h-[20px]" />
      </TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[200px]">
            <Skeleton className="w-[50px] h-[20px]" />
          </TableHead>
          <TableHead>
            <Skeleton className="w-[30px] h-[20px]" />
          </TableHead>
          <TableHead>
            <Skeleton className="w-[115px] h-[20px]" />
          </TableHead>
          <TableHead>
            <Skeleton className="w-[60px] h-[20px]" />
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRowLoading />
        <TableRowLoading />
        <TableRowLoading />
        <TableRowLoading />
        <TableRowLoading />
      </TableBody>
    </Table>
  );
};
