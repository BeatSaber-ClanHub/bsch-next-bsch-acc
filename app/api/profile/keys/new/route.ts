import { APIResponse } from "@/app/api/types/core/api";
import newAPIKeySchema from "@/app/validation-schemas/api-key/new-api-key-schema";
import { countKeys, createKey } from "@/data-access/api-key";
import { APIKeyWithDecrypt } from "@/data-access/types/types";
import authenticationCheck, {
  isNextResponse,
} from "@/utils/authentication-check";
import decryptAPIKey from "@/utils/decrypt-api-key";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (request: NextRequest) => {
  try {
    const auth = await authenticationCheck();
    if (isNextResponse(auth)) return auth;

    const body = await request.json();

    const { error } = newAPIKeySchema.safeParse(body);
    if (error) {
      return NextResponse.json(
        {
          error: "VALIDATION_ERROR",
          message: "Invalid request body!",
          validationError: error.flatten(),
        } as APIResponse,
        {
          status: 400,
        }
      );
    }

    const [currentNumOfKeysError, currentNumOfKeys] = await countKeys();
    if (currentNumOfKeysError) throw currentNumOfKeysError;

    if (currentNumOfKeys! >= 20) {
      return NextResponse.json(
        {
          error: "TO_MANY_KEYS",
          message: "You can only have 20 API keys!",
        } as APIResponse,
        { status: 400 }
      );
    }

    const [newKeyError, newKey] = await createKey(body);
    if (newKeyError) throw newKeyError;

    return NextResponse.json(
      {
        message: "API Key generated!",
        data: { decryptedKey: decryptAPIKey(newKey!.encryptedKey), ...newKey },
      } as APIResponse<APIKeyWithDecrypt>,
      { status: 201 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      {
        message: "Failed to generate new API key!",
        error: "API_KEY_INTERNAL_ERROR",
      } as APIResponse,
      { status: 500 }
    );
  }
};
