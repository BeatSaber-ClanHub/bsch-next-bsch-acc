import { z } from "zod";

const newAPIKeySchema = z.object({
  name: z
    .string()
    .min(1, { message: "Name must be at least 1 character." })
    .max(25, { message: "Name must be 25 or fewer characters." }),
  expireAt: z
    .preprocess(
      (val) => {
        if (typeof val === "string" || val instanceof Date) {
          const d = new Date(val);

          return isNaN(d.getTime()) ? null : d;
        }
        return null;
      },
      z.date().refine(
        (date) => {
          if (!date) return true;
          // Get today's date at midnight
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          // Get the input date at midnight
          const input = new Date(date);
          input.setHours(0, 0, 0, 0);

          // Only allow if input date is after today (i.e., at least tomorrow)
          return input.getTime() > today.getTime();
        },
        {
          message: "The date must be in the future (not today).",
        }
      )
    )
    .nullable()
    .optional(),
});

export default newAPIKeySchema;
