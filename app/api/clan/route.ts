import {
  _client_createClanSchema,
  NewClanOptions,
} from "@/components/types/clan-types";
import { ClanWithClanOwnerInfo, createClan } from "@/data-access/clan";
import authenticationCheck, {
  isNextResponse,
} from "@/utils/authentication-check";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { APIResponse } from "../types/core/api";

export const POST = async (request: NextRequest) => {
  try {
    const auth = await authenticationCheck();
    if (isNextResponse(auth)) return auth;
    const session = auth.session!;

    // Extract body
    const body: z.infer<typeof _client_createClanSchema> = await request.json();

    // Validate
    const { error } = _client_createClanSchema.safeParse(body);
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

    // Generate data to upload to db
    const data: NewClanOptions = {
      clan_name: body.clan_name,
      clan_tag: body.clan_tag,
      clan_specialties: body.clan_specialties,
      discord_invite_link: body.discord_invite_link,
      clan_owner: session.user.id,
      clan_short_description: body.clan_short_description,
    };

    // Run database query
    const [createClanError, createdClan] = await createClan(data);
    if (createClanError) throw createClanError;

    // Return result
    return NextResponse.json(
      {
        message: "Congrats! Your clan was created!",
        data: createdClan,
      } as APIResponse<ClanWithClanOwnerInfo>,
      { status: 201 }
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
