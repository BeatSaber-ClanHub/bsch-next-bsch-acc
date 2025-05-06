import { APIResponse } from "@/app/api/types/core/api";
import { deleteAPIKey, getKey } from "@/data-access/api-key";
import authenticationCheck, {
  isNextResponse,
} from "@/utils/authentication-check";
import { NextRequest, NextResponse } from "next/server";
import { validate as uuidValidate } from "uuid";

export const DELETE = async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> => {
  try {
    const auth = await authenticationCheck();
    if (isNextResponse(auth)) return auth;

    const { id: apiKeyId } = await params;
    if (!uuidValidate(apiKeyId)) {
      const resp: APIResponse = {
        error: "MALFORMED_ID",
        message: "This API Key ID is not valid",
      };

      return NextResponse.json(resp, { status: 400 });
    }

    const [keyError, key] = await getKey(apiKeyId);
    if (keyError) throw keyError;

    if (!key) {
      return NextResponse.json(
        {
          message: "This key does not exist!",
          error: "KEY_NOT_FOUND",
        } as APIResponse,
        { status: 404 }
      );
    }

    const [updateError, updatedKey] = await deleteAPIKey(apiKeyId);
    if (updateError) throw updateError;

    return NextResponse.json(
      {
        message: "API Key deleted!",
        data: {
          name: updatedKey!.name,
        },
      } as APIResponse<{ name: string }>,
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      {
        message: "Failed to delete key!",
        error: "API_KEY_RENAME_INTERNAL_ERROR",
      } as APIResponse,
      { status: 500 }
    );
  }
};
