import { editClanSchema } from "@/app/validation-schemas/clan/clanSchema";
import deleteClanSchema from "@/app/validation-schemas/clan/delete-clan";
import { TiptapSchema } from "@/app/validation-schemas/tiptap/schema";
import {
  ClanWithClanOwnerInfo,
  ClanWithClanOwnerInfoAndBasicData,
  deleteClan,
  getClan,
  updateClan,
} from "@/data-access/clan";
import { getMember } from "@/data-access/member";
import authenticationCheck, {
  isNextResponse,
} from "@/utils/authentication-check";
import getClanRole from "@/utils/get-clan-role";
import { Clan } from "@/prisma/generated/prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { validate as uuidValidate } from "uuid";
import { z } from "zod";
import { APIResponse } from "../../types/core/api";
import { utapi } from "@/utils/uploadthing";

export const GET = async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const auth = await authenticationCheck({ bypassAuthCheck: true });
    if (isNextResponse(auth)) return auth;
    const { session, role } = auth;

    const { id } = await params;
    const isValidId = uuidValidate(id);
    if (!isValidId) {
      const resp: APIResponse = {
        error: "MALFORMED_ID",
        message: "This Clan ID is not valid",
      };

      return NextResponse.json(resp, { status: 400 });
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

    // If the clan is hidden
    if (
      clan?.visibility === "Hidden" &&
      role !== "Moderator" &&
      role !== "Administrator" &&
      role !== "Developer"
    ) {
      // If the user has a session, check if they are a member
      if (session?.user.id) {
        const [memberError, member] = await getMember({
          clanId: id,
          userId: session.user.id,
        });
        if (memberError) throw memberError;
        if (!member || member.banned)
          return NextResponse.json(
            {
              message: "You don't have permission to view this clan!",
              error: "INVALID_PERMISSIONS",
            } as APIResponse,
            { status: 403 }
          );
      } else {
        return NextResponse.json(
          {
            message: "You don't have permission to view this clan!",
            error: "INVALID_PERMISSIONS",
          } as APIResponse,
          { status: 403 }
        );
      }
    }

    return NextResponse.json(
      {
        message: "Clan retrieved!",
        data: clan,
      } as APIResponse<Clan>,
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      {
        message: "Failed to retrieve clan!",
        error: "GET_CLAN_ERR",
      } as APIResponse,
      { status: 500 }
    );
  }
};

export const PATCH = async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const auth = await authenticationCheck();
    if (isNextResponse(auth)) return auth;

    const { id } = await params;
    const isValidId = uuidValidate(id);
    if (!isValidId) {
      const resp: APIResponse = {
        error: "MALFORMED_ID",
        message: "This Clan ID is not valid",
      };

      return NextResponse.json(resp, { status: 400 });
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
        { status: 405 }
      );
    }

    const body: z.infer<typeof editClanSchema> = await request.json();
    const { error } = editClanSchema.safeParse(body);

    if (error) {
      const resp: APIResponse = {
        error: "VALIDATION_ERROR",
        message: "Invalid request body!",
        validationError: error.flatten(),
      };
      return NextResponse.json(resp, {
        status: 400,
        statusText: "Invalid request body",
      });
    }

    // Handle the remove clan specialties edge cases.
    if (Object.hasOwn(body, "remove_clan_specialties")) {
      const removeSpecialties = body.remove_clan_specialties;

      let prospective = Array.from(
        new Set([
          ...clan.clan_specialties,
          ...(body.clan_specialties ? body.clan_specialties : []),
        ])
      );
      prospective = prospective.filter(
        (specialty) => !removeSpecialties?.includes(specialty)
      );

      // if (prospective.length <= 0) {
      //   return NextResponse.json(
      //     {
      //       message: "Clans must have at least 1 selected specialty",
      //       error: "NO_SPECIALTIES",
      //     },
      //     { status: 400 }
      //   );
      // }

      body.clan_specialties = prospective;
      delete body.remove_clan_specialties;
    }

    if (
      !Object.hasOwn(body, "remove_clan_specialties") &&
      Object.hasOwn(body, "clan_specialties")
    ) {
      body.clan_specialties = Array.from(
        new Set([...(body.clan_specialties ? body.clan_specialties : [])])
      );
    }

    const { role } = await getClanRole({
      clanId: clan.id,
      userId: auth.session!.user.id,
    });
    if (role !== "Administrator" && role !== "Creator") {
      return NextResponse.json(
        {
          message: "You don't have permissions to edit the clan!",
          error: "INVALID_PERMISSIONS",
        } as APIResponse,
        { status: 403 }
      );
    }

    const description: null | z.infer<typeof TiptapSchema> = body.description;
    const checkIfEmpty = () => {
      const content = description;
      if (
        content &&
        content.type === "doc" &&
        content.content?.length === 1 &&
        content.content[0].type === "paragraph" &&
        !content.content[0].content
      ) {
        return true;
      } else {
        return false;
      }
    };

    const isEmptyDescription = checkIfEmpty();
    console.log(isEmptyDescription);
    const [updateClanError, updatedClan] = await updateClan({
      clanId: id,
      data: {
        ...body,
        ...(body.clan_specialties
          ? { clan_specialties: body.clan_specialties }
          : null),
        ...(isEmptyDescription
          ? { description: null }
          : { description: body.description }),
      },
    });

    if (updateClanError) throw updateClanError;

    return NextResponse.json(
      {
        message: "Clan Updated!",
        data: updatedClan,
      } as APIResponse<ClanWithClanOwnerInfo>,
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      {
        error: "CLAN_SERVER_ERROR",
        message: "There was an issue creating the clan!",
      },
      {
        status: 500,
      }
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

    const { id } = await params;
    const isValidId = uuidValidate(id);
    if (!isValidId) {
      const resp: APIResponse = {
        error: "MALFORMED_ID",
        message: "This Clan ID is not valid",
      };

      return NextResponse.json(resp, { status: 400 });
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

    // If the clan is banned, only these roles can delete it.
    if (
      session.role !== "Administrator" &&
      session.role !== "Developer" &&
      session.role !== "Moderator"
    ) {
      if (clan.banned) {
        return NextResponse.json(
          {
            message: "This clan is banned! Changes are no longer permitted!.",
            error: "CLAN_BANNED_NO_CHANGE",
          } as APIResponse,
          { status: 405 }
        );
      }
    }

    // BSCH staff and clan creator can delete clans
    const { role } = await getClanRole({
      clanId: clan.id,
      userId: session.session!.user.id,
    });
    if (
      role !== "Creator" &&
      session.role !== "Administrator" &&
      session.role !== "Developer" &&
      session.role !== "Moderator"
    ) {
      return NextResponse.json(
        {
          message: "You do not have permissions to delete this clan",
          error: "INVALID_PERMISSIONS",
        } as APIResponse,
        { status: 403 }
      );
    }

    const body: z.infer<typeof deleteClanSchema> = await request.json();
    const { error } = deleteClanSchema.safeParse(body);

    if (error) {
      const resp: APIResponse = {
        error: "VALIDATION_ERROR",
        message: "Invalid request body!",
        validationError: error.flatten(),
      };
      return NextResponse.json(resp, {
        status: 400,
        statusText: "Invalid request body",
      });
    }

    const [deleteClanError, deletedClan] = await deleteClan(id);
    if (deleteClanError) throw deleteClanError;

    const utBannerFileKey = deletedClan?.banner_file_key;
    clan.banner_file_key
      ? await utapi.deleteFiles(utBannerFileKey as string)
      : null;

    return NextResponse.json(
      {
        message: "Clan deleted!",
        data: deletedClan,
      } as APIResponse<ClanWithClanOwnerInfoAndBasicData>,
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      {
        error: "CLAN_SERVER_ERROR",
        message: "There was an issue creating the clan!",
      },
      {
        status: 500,
      }
    );
  }
};
