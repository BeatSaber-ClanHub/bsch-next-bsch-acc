import { Spinner } from "@/components/minimal-tiptap/components/spinner";

const ProfileLoading = () => {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <Spinner className="w-[15px]" />
    </div>
  );
};

export default ProfileLoading;
