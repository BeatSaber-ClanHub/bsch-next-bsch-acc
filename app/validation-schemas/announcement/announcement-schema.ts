import { z } from "zod";

const announcementSchema = z
  .object({
    title: z
      .string({ message: "Title must be a string." })
      .min(1, { message: "A title is required" })
      .max(30, { message: "Title can not be longer than 30 characters." }),
    announcement: z
      .string({ message: "Announcement must be a string." })
      .min(1, { message: "An announcement body is required." })
      .max(300, { message: "Body can not be longer than 300 characters." }),
    visible: z.boolean().default(true),
    showAt: z
      .string()
      .or(z.date())
      .transform((val) => (val ? new Date(val) : undefined))
      .refine(
        (date) => {
          if (!date) return true;
          const now = new Date();
          const zeroedDate = new Date(date);

          now.setHours(0, 0, 0, 0);
          zeroedDate.setHours(0, 0, 0, 0);

          return date >= now;
        },
        {
          message: "The date cannot be in the past.",
        }
      )
      .optional()
      .nullable(),
    hideAt: z
      .string()
      .or(z.date())
      .transform((val) => (val ? new Date(val) : undefined))
      .refine(
        (date) => {
          if (!date) return true;
          const now = new Date();
          return date >= now;
        },
        {
          message: "The date cannot be in the past.",
        }
      )
      .optional()
      .nullable(),
  })
  .refine(
    (data) => (!data.showAt && !data.hideAt) || (data.showAt && data.hideAt),
    {
      message: "Both showAt and hideAt must be provided together.",
      path: ["showAt"],
    }
  )
  .refine(
    (data) => {
      // Only check if both are present
      if (data.showAt && data.hideAt) {
        // Both are Date objects (or undefined/null)
        // 10 minutes = 600,000 ms
        return data.hideAt.getTime() - data.showAt.getTime() >= 10 * 60 * 1000;
      }
      return true; // If either is missing, don't check
    },
    {
      message: "hideAt must be at least 10 minutes after showAt.",
      path: ["hideAt"], // Error will show on hideAt
    }
  );

export default announcementSchema;
