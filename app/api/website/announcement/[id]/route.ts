import { APIResponse } from "@/app/api/types/core/api";
import announcementSchema from "@/app/validation-schemas/announcement/announcement-schema";
import {
  deleteWebsiteAnnouncement,
  getAnnouncement,
  updateWebsiteAnnouncement,
  WebsiteAnnouncementWithPosterUserData,
} from "@/data-access/website-announcement";
import authenticationCheck, {
  isNextResponse,
} from "@/utils/authentication-check";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { validate as uuidValidate } from "uuid";

export const PATCH = async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const session = await authenticationCheck();
    if (isNextResponse(session)) return session;

    if (session.role !== "Administrator" && session.role !== "Developer") {
      return NextResponse.json(
        {
          message: "You do not have permissions to edit announcements!",
          error: "INVALID_PERMISSIONS",
        } as APIResponse,
        { status: 403 }
      );
    }

    const { id } = await params;

    const isValidId = uuidValidate(id);
    if (!isValidId) {
      const resp: APIResponse = {
        error: "MALFORMED_ID",
        message: "This Announcement ID is not valid",
      };

      return NextResponse.json(resp, { status: 403 });
    }

    const [announcementErr, announcement] = await getAnnouncement(id);
    if (announcementErr) throw announcementErr;

    if (!announcement) {
      return NextResponse.json(
        {
          error: "NOT_FOUND",
          message: "This announcement does not exist!",
        } as APIResponse,
        { status: 404 }
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

    const [announcementUpdateErr, newAnnouncement] =
      await updateWebsiteAnnouncement({
        id: id,
        announcementData: sanitizedBody,
      });
    if (announcementUpdateErr) throw announcementUpdateErr;

    return NextResponse.json(
      {
        message: "Announcement updated!",
        data: newAnnouncement,
      } as APIResponse<WebsiteAnnouncementWithPosterUserData>,
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      {
        message: "There was an issue editing the announcement!",
        error: "ANNOUNCEMENT_PATCH_ERROR",
      } as APIResponse,
      { status: 500 }
    );
  }
};

export const DELETE = async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const session = await authenticationCheck();
    if (isNextResponse(session)) return session;

    if (session.role !== "Administrator" && session.role !== "Developer") {
      return NextResponse.json(
        {
          message: "You do not have permissions to delete announcements!",
          error: "INVALID_PERMISSIONS",
        } as APIResponse,
        { status: 403 }
      );
    }

    const { id } = await params;

    const isValidId = uuidValidate(id);
    if (!isValidId) {
      const resp: APIResponse = {
        error: "MALFORMED_ID",
        message: "This Announcement ID is not valid",
      };

      return NextResponse.json(resp, { status: 403 });
    }

    const [announcementErr, announcement] = await getAnnouncement(id);
    if (announcementErr) throw announcementErr;

    if (!announcement) {
      return NextResponse.json(
        {
          error: "NOT_FOUND",
          message: "This announcement does not exist!",
        } as APIResponse,
        { status: 404 }
      );
    }

    const [announcementDeleteErr, deletedAnnouncement] =
      await deleteWebsiteAnnouncement(id);
    if (announcementDeleteErr) throw announcementDeleteErr;

    return NextResponse.json(
      {
        message: "Announcement deleted!",
        data: deletedAnnouncement,
      } as APIResponse<WebsiteAnnouncementWithPosterUserData>,
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      {
        message: "There was an issue deleting the announcement!",
        error: "ANNOUNCEMENT_DELETE_ERROR",
      } as APIResponse,
      { status: 500 }
    );
  }
};
