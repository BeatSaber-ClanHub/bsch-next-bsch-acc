import { APIResponse } from "@/app/api/types/core/api";
import { getBanAppealById } from "@/data-access/ban-appeal";
import authenticationCheck, {
  isNextResponse,
} from "@/utils/authentication-check";
import { BanAppeal } from "@/prisma/generated/prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { validate as uuidValidate } from "uuid";

export const GET = async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const auth = await authenticationCheck();
    if (isNextResponse(auth)) return auth;
    const { role } = auth;

    if (
      role !== "Administrator" &&
      role !== "Developer" &&
      role !== "Moderator"
    ) {
      return NextResponse.json(
        {
          message: "You do not have permissions to view ban appeals",
          error: "INVALID_PERMISSIONS",
        } as APIResponse,
        { status: 403 }
      );
    }

    const { id } = await params;
    if (!uuidValidate(id)) {
      return NextResponse.json(
        {
          message: "Invalid Appeal Id",
          error: "INVALID_ID",
        } as APIResponse,
        { status: 400 }
      );
    }

    const [appealsError, appeal] = await getBanAppealById(id);
    if (appealsError) throw appealsError;

    if (!appeal) {
      return NextResponse.json(
        {
          message: "This appeal does not exist",
          error: "APPEAL_NOT_FOUND",
        } as APIResponse,
        { status: 404 }
      );
    }
    return NextResponse.json(
      {
        message: "Appeal retrieved",
        data: appeal,
      } as APIResponse<BanAppeal>,
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      {
        error: "APPEALS_GET_ERR",
        message: "There was an issue getting ban appeals",
      } as APIResponse,
      { status: 500 }
    );
  }
};
