import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const ClanCardLoading = ({
  orientation = "horizontal",
}: {
  orientation?: "horizontal" | "vertical";
}) => {
  return (
    <Card
      className={`bg-gray-900/50 border-gray-800 overflow-hidden group hover:border-purple-500/50 transition-all duration-300 hover:shadow-[0_0_15px_rgba(59,130,246,0.3)] ${
        orientation === "horizontal"
          ? "min-w-[500px]"
          : "w-full sm:max-w-[500px]"
      }`}
    >
      <div className="relative h-40 overflow-hidden">
        <Skeleton className="w-full h-full" />

        <Skeleton className="absolute top-3 right-3 h-5 w-[76px]" />

        <div className="absolute bottom-3 left-3 flex items-center justify-center gap-2">
          <div className="w-12 h-12 rounded-full bg-gray-800 border-2 border-gray-700 overflow-hidden relative">
            <Skeleton className="w-[50px] h-[50px] rounded-full" />
          </div>
          <div>
            <Skeleton className="w-[80px] h-[25px] mb-2" />
            <Skeleton className="w-[50px] h-[16px]" />
          </div>
        </div>
      </div>

      <CardContent className="p-4">
        <Skeleton className="w-full h-[20px] mb-4" />

        <div className="flex gap-4 flex-col">
          <div className="flex items-center text-gray-400 text-sm">
            <Skeleton className="w-[50px] h-[20px]" />
          </div>

          <div className="flex gap-2">
            <Skeleton className="h-5 w-[76px]" />
            <Skeleton className="h-5 w-[76px]" />
            <Skeleton className="h-5 w-[76px]" />
          </div>
        </div>
        <Skeleton className="h-[35px] w-full mt-4" />
      </CardContent>
    </Card>
  );
};

export default ClanCardLoading;
