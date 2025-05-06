import { Skeleton } from "@/components/ui/skeleton";
import { TableCell, TableRow } from "@/components/ui/table";

export const TableRowLoading = () => {
  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-2">
          <Skeleton className="w-[40px] h-[40px] rounded-full" />

          <Skeleton className="w-[60px] h-[20px]" />
        </div>
      </TableCell>
      <TableCell>
        <Skeleton className="w-[60px] h-[20px]" />
      </TableCell>
      <TableCell>
        <Skeleton className="w-[115px] h-[20px]" />
      </TableCell>
      <TableCell>
        <div className="flex gap-2">
          <Skeleton className="w-[50px] h-[36px]" />
          <Skeleton className="w-[50px] h-[36px]" />
        </div>
      </TableCell>
    </TableRow>
  );
};
