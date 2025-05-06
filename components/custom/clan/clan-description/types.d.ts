import { TiptapSchema } from "@/app/validation-schemas/tiptap/schema";
import { z } from "zod";

export type TipTapJson = z.infer<typeof TiptapSchema>;
