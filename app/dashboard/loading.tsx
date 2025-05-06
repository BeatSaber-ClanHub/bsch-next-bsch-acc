import { Spinner } from "@/components/minimal-tiptap/components/spinner";

const DashboardLoading = () => {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <Spinner className="w-[15px]" />
    </div>
  );
};

export default DashboardLoading;
