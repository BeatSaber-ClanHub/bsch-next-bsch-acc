import { Skeleton } from "@/components/ui/skeleton";

const AdminTablesLoadingText = () => {
  return (
    <div className="h-[60px] w-full flex flex-col gap-2">
      <div className="flex gap-2">
        <Skeleton className="h-[20px] w-[60px]" />
        <Skeleton className="h-[20px] w-[60px]" />
      </div>
      <Skeleton className="h-[20px] w-[200px]" />
    </div>
  );
};

export default AdminTablesLoadingText;
