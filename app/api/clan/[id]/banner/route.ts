import { APIResponse } from "@/app/api/types/core/api";
import { fileSchema } from "@/app/validation-schemas/clan/change-banner";
import {
  ClanWithClanOwnerInfoAndBasicData,
  getClan,
  updateClanBanner,
} from "@/data-access/clan";
import authenticationCheck, {
  isNextResponse,
} from "@/utils/authentication-check";
import getClanRole from "@/utils/get-clan-role";
import { utapi } from "@/utils/uploadthing";
import { NextRequest, NextResponse } from "next/server";
import { validate as uuidValidate } from "uuid";

export const POST = async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const auth = await authenticationCheck();
    if (isNextResponse(auth)) return auth;

    const { id } = await params;
    if (!uuidValidate(id)) {
      const resp: APIResponse = {
        error: "MALFORMED_ID",
        message: "This Clan ID is not valid",
      };

      return NextResponse.json(resp, { status: 403 });
    }

    const [clanError, clan] = await getClan(id);
    if (clanError) throw clanError;

    if (!clan) {
      const resp: APIResponse = {
        message: "Clan not found!",
        error: "NOT_FOUND",
      };

      return NextResponse.json(resp, { status: 404 });
    }

    if (clan.banned) {
      return NextResponse.json(
        {
          message: "This clan is banned! Changes are no longer permitted!.",
          error: "CLAN_BANNED_NO_CHANGE",
        } as APIResponse,
        { status: 400 }
      );
    }

    const { role } = await getClanRole({
      clanId: clan.id,
      userId: auth.session!.user.id,
    });
    if (role !== "Creator" && role !== "Administrator") {
      return NextResponse.json(
        {
          message: "You do not have permissions to change clan banner!",
          error: "INVALID_PERMISSIONS",
        } as APIResponse,
        { status: 403 }
      );
    }

    // Get the body (multipart formdata)
    const body = await request.formData();
    const file = body.get("files");
    // Run against validation
    const { error } = fileSchema.safeParse({ files: file });
    if (error) {
      const resp: APIResponse = {
        error: "VALIDATION_ERROR",
        message: "Failed to validate files!",
        validationError: error.flatten(),
      };
      return NextResponse.json(resp, {
        status: 400,
      });
    }

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        {
          message: "No file provided",
          error: "FILE_NOT_PROVIDED",
        } as APIResponse,
        { status: 400 }
      );
    }

    const [, uploadResult] = await Promise.all([
      clan.banner_file_key
        ? utapi.deleteFiles(clan.banner_file_key)
        : Promise.resolve({ success: true }),
      utapi.uploadFiles(file),
    ]);

    if (uploadResult.error) {
      return NextResponse.json(
        {
          message: "File upload failed!",
          error: "UPLOADTHING_CLAN_BANNER_ERROR",
        },
        { status: 500 }
      );
    }

    const { ufsUrl } = uploadResult.data;

    const [updateClanBannerError, updatedClanBanner] = await updateClanBanner({
      clanId: id,
      bannerUrl: ufsUrl,
      fileKey: uploadResult.data.key,
    });

    if (updateClanBannerError) {
      await utapi.deleteFiles(uploadResult.data.key);
      return NextResponse.json(
        {
          message: "File upload failed!",
          error: "SET_URL_ERROR",
        },
        { status: 500 }
      );
    }
    return NextResponse.json(
      {
        message: "Clan banner changed!",
        data: updatedClanBanner,
      } as APIResponse<ClanWithClanOwnerInfoAndBasicData>,
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      {
        message: "Banner change failed!",
        error: "BANNER_FILE_UPLOAD_INTERNAL_ERROR",
      } as APIResponse,
      { status: 500 }
    );
  }
};
