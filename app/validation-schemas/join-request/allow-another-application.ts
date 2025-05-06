import { z } from "zod";

const allowAnotherApplicationSchema = z.object({
  allowAnotherApplication: z.boolean(),
});

export default allowAnotherApplicationSchema;
