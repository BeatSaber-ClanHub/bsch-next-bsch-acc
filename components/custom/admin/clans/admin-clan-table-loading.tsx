import AdminTablesLoadingText from "@/components/custom/admin/clans/admin-tables-loading-text/AdminTablesLoadingText";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const TableLoading = () => {
  return (
    <div className="flex flex-col w-full justify-center">
      <AdminTablesLoadingText />
      <Table>
        <TableCaption>
          <Skeleton className="w-[200px] h-[20px] ml-auto mr-auto" />
        </TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">
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
            <TableHead>
              <Skeleton className="w-[72px] h-[20px]" />
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
    </div>
  );
};
export const TableRowLoading = () => {
  return (
    <TableRow>
      <TableCell>
        <Skeleton className="w-[60px] h-[20px]" />
      </TableCell>
      <TableCell>
        <Skeleton className="w-[30px] h-[20px]" />
      </TableCell>
      <TableCell>
        <Skeleton className="w-[115px] h-[20px]" />
      </TableCell>
      <TableCell>
        <Skeleton className="w-[120px] h-[52px]" />
      </TableCell>
      <TableCell>
        <Skeleton className="w-[60px] h-[36px]" />
      </TableCell>
    </TableRow>
  );
};
