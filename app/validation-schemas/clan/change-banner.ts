import { z } from "zod";

const schema = z.object({
  name: z.string({ message: "File name must be a string" }),
  type: z.enum(
    Object.keys({
      "image/jpeg": [".jpeg", ".jpg"],
      "image/png": [".png"],
      "image/webp": [".webp"],
      "image/gif": [".gif"],
      "image/bmp": [".bmp"],
      "image/tiff": [".tiff", ".tif"],
      "image/svg+xml": [".svg"],
    }) as [string, ...string[]],
    {
      message: "Invalid file type",
    }
  ),
  size: z
    .number({ message: "File size must be a number" })
    .max(4 * 1000 * 1000, { message: "File is to big" }),
});

export const fileSchema = z.object({
  files: z.object({
    name: z.string({ message: "File name must be a string" }),
    type: z.enum(
      Object.keys({
        "image/jpeg": [".jpeg", ".jpg"],
        "image/png": [".png"],
        "image/webp": [".webp"],
        "image/gif": [".gif"],
        "image/bmp": [".bmp"],
        "image/tiff": [".tiff", ".tif"],
        "image/svg+xml": [".svg"],
      }) as [string, ...string[]],
      {
        message: "Invalid file type",
      }
    ),
    size: z
      .number({ message: "File size must be a number" })
      .max(4 * 1000 * 1000, { message: "File is to big" }),
  }),
});
