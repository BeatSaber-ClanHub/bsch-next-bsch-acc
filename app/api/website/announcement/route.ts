import { APIResponse } from "@/app/api/types/core/api";
import announcementSchema from "@/app/validation-schemas/announcement/announcement-schema";
import {
  createWebsiteAnnouncement,
  WebsiteAnnouncementWithPosterUserData,
} from "@/data-access/website-announcement";
import authenticationCheck, {
  isNextResponse,
} from "@/utils/authentication-check";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export const POST = async (request: NextRequest) => {
  try {
    const session = await authenticationCheck();
    if (isNextResponse(session)) return session;

    if (session.role !== "Administrator" && session.role !== "Developer") {
      return NextResponse.json(
        {
          message: "You do not have permissions to create announcements!",
          error: "INVALID_PERMISSIONS",
        } as APIResponse,
        { status: 403 }
      );
    }

    const body: z.infer<typeof announcementSchema> = await request.json();

    // Validate
    const { error } = announcementSchema.safeParse(body);
    if (error) {
      const resp: APIResponse = {
        error: "VALIDATION_ERROR",
        message: "Invalid request body!",
        validationError: error.flatten(),
      };
      return NextResponse.json(resp, {
        status: 400,
      });
    }

    const sanitizedBody = {
      ...body,
      showAt: body.showAt ?? null,
      hideAt: body.hideAt ?? null,
    };
    const [announcementErr, newAnnouncement] = await createWebsiteAnnouncement(
      sanitizedBody
    );
    if (announcementErr) throw announcementErr;

    return NextResponse.json(
      {
        message: "Announcement created!",
        data: newAnnouncement,
      } as APIResponse<WebsiteAnnouncementWithPosterUserData>,
      { status: 201 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      {
        message: "There was an issue create the announcement!",
        error: "ANNOUNCEMENT_POST_ERROR",
      } as APIResponse,
      { status: 500 }
    );
  }
};
