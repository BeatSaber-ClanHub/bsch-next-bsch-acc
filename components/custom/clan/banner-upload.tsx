"use client";

import FileUploadModal from "@/components/custom/file-upload-modal/file-upload-modal";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

const BannerUpload = ({ id }: { id: string }) => {
  const router = useRouter();

  function onSuccess() {
    router.refresh();
  }
  return (
    <FileUploadModal
      onUpload={onSuccess}
      trigger={<Button>Upload Banner</Button>}
      endpoint={`api/clan/${id}/banner`}
    />
  );
};

export default BannerUpload;
