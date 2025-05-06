"use client";
import { APIResponse } from "@/app/api/types/core/api";
import { Spinner } from "@/components/minimal-tiptap/components/spinner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { toTitleCase } from "@/utils/toTitleCase";
import convert from "convert-pro";
import { UploadCloud, X } from "lucide-react";
import Image from "next/image";
import { FormEvent, ReactNode, useCallback, useState } from "react";
import { Accept, useDropzone } from "react-dropzone";
import { z } from "zod";

const FileUploadModal = ({
  trigger,
  maxFiles = 1,
  maxSize = 4 * 1000 * 1000,
  accept = {
    "image/jpeg": [".jpeg", ".jpg"],
    "image/png": [".png"],
    "image/webp": [".webp"],
    "image/gif": [".gif"],
    "image/bmp": [".bmp"],
    "image/tiff": [".tiff", ".tif"],
    "image/svg+xml": [".svg"],
  },
  endpoint,
  onUpload,
}: {
  trigger: ReactNode;
  maxFiles?: number;
  maxSize?: number;
  accept?: Accept;
  endpoint: string;
  onUpload?: (data: APIResponse) => void;
}) => {
  const schema = z.object({
    name: z.string({ message: "File name must be a string" }),
    type: z.enum(Object.keys(accept) as [string, ...string[]], {
      message: "Invalid file type",
    }),
    size: z
      .number({ message: "File size must be a number" })
      .max(maxSize, { message: "File is to big" }),
  });

  const fileSchema = z.object({
    files: z
      .array(schema)
      .max(maxFiles, { message: "To many files" })
      .min(1, { message: "At least 1 file is required" }),
  });

  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [tempFiles, setTempFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const size = convert.bytes(maxSize);
  const acceptedKeys = [
    ...new Set(Object.keys(accept).map((v) => v.split("/")[0])),
  ];
  const formattedKeys = acceptedKeys.map((k) => toTitleCase(k)).join(", ");

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const prev = tempFiles || [];
      const newFiles = acceptedFiles.filter(
        (newFile) =>
          !prev.some((existingFile) => existingFile.name === newFile.name)
      );
      if ([...prev, ...newFiles].length > maxFiles && maxFiles === 1) {
        setTempFiles(newFiles);
      } else if ([...prev, ...newFiles].length > maxFiles) {
        setError("To many files");
      } else {
        setError(null);
        setTempFiles([...prev, ...newFiles]);
      }
    },
    [maxFiles, tempFiles]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: maxFiles,
    maxSize: maxSize,
    accept: accept,
    multiple: maxFiles > 1,
    onDropRejected: (rejections) => {
      const firstEvent = rejections[0];
      const errors = firstEvent.errors;
      const firstError = errors[0];
      const errMessage = firstError.message;

      setError(errMessage);
    },
    onError: (message) => {
      setError(message.message);
    },
    onFileDialogCancel: () => {
      setError(null);
    },
  });

  function removeFile(file: File) {
    const curr = tempFiles;
    const newArr = curr?.filter((f) => f !== file);
    setTempFiles(newArr);
  }

  async function uploadFiles(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);

    const data = {
      files: tempFiles,
    };
    const { error } = fileSchema.safeParse(data);
    if (error) {
      setError(error.message);
      return;
    }

    const formData = new FormData();
    tempFiles.forEach((file) => {
      formData.append("files", file);
    });

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/${endpoint}`,
        {
          method: "POST",
          body: formData,
        }
      );

      const responseJSON: APIResponse = await response.json();
      if (!response.ok) throw responseJSON;

      toast({
        title: "Success!",
        description: responseJSON.message,
      });

      setOpen(false);
      setTempFiles([]);
      if (onUpload) onUpload(responseJSON);
    } catch (error: unknown) {
      let errorMessage = "Failed to upload banner!";
      console.log(error);
      if (error instanceof TypeError) {
        errorMessage = "Something unexpected occured!";
      } else if (
        typeof error === "object" &&
        error !== null &&
        "message" in error
      ) {
        errorMessage = error.message as string;
      }

      toast({
        title: "Uh Oh!",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  }
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>File Upload</DialogTitle>
          <DialogDescription>Drag or Click to upload a file!</DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => uploadFiles(e)}
          className="flex flex-col w-full gap-4"
        >
          <div
            {...getRootProps()}
            className="h-[200px] p-4 border-dashed border-[1px] border-border rounded-md flex flex-col items-center justify-center"
          >
            <input {...getInputProps()} type="file" />
            {isDragActive ? (
              <div
                className={`flex flex-col gap-2 items-center justify-center`}
              >
                <UploadCloud className="flex text-muted-foreground" size={50} />
                <p className="text-sm text-muted-foreground">
                  Drop files here!
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-2 items-center justify-center">
                {!tempFiles || tempFiles.length <= 0 ? (
                  <>
                    <UploadCloud
                      className="flex text-muted-foreground"
                      size={50}
                    />
                    <p className="text-sm text-muted-foreground text-center">
                      Drag &apos;n&apos; drop some files here, or click to
                      select files
                      <br />
                      <span>
                        ({formattedKeys}) {size}
                      </span>
                    </p>
                  </>
                ) : (
                  <div className="flex gap-2 flex-col overflow-y-auto h-[calc(200px-32px)]">
                    {tempFiles.map((file, i) => {
                      return (
                        <Preview key={i} file={file} removeFile={removeFile} />
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
          {error && <p className="text-sm text-red-500/70">{error}</p>}
          {tempFiles.length > 0 && (
            <Button disabled={submitting} type="submit">
              {submitting && <Spinner />}Upload
            </Button>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
};

const Preview = ({
  file,
  removeFile,
}: {
  file: File;
  removeFile: (file: File) => void;
}) => {
  const generateBlogUrl = URL.createObjectURL(file);

  return (
    <div
      className="flex w-[200px] sm:w-[300px] border-border border-[1px] rounded-md items-center"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="w-[64px] h-[64px] ml-2 overflow-hidden flex items-center justify-center">
        <Image
          width={72}
          height={72}
          alt="Preview file upload"
          src={generateBlogUrl}
          className="object-contain w-full h-full"
        />
      </div>

      <div className="flex items-center w-full p-2">
        <p className="text-sm text-muted-foreground">{file.name}</p>
        <div className="ml-auto">
          <Button
            variant="outline"
            onClick={(e) => {
              e.preventDefault();
              removeFile(file);
              e.stopPropagation();
            }}
          >
            <X />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FileUploadModal;
