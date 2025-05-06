import { Spinner } from "@/components/minimal-tiptap/components/spinner";

const ClanLoading = () => {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <Spinner className="w-[15px]" />
    </div>
  );
};

export default ClanLoading;
