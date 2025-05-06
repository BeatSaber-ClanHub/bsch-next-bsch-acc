import { APIResponse } from "@/app/api/types/core/api";
import deleteAccountSchema from "@/app/validation-schemas/user/delete-account";
import { deleteUserById } from "@/data-access/user";
import authenticationCheck, {
  isNextResponse,
} from "@/utils/authentication-check";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export const DELETE = async (request: NextRequest) => {
  try {
    const session = await authenticationCheck({ bypassBanCheck: true });
    if (isNextResponse(session)) return session;

    const body: z.infer<typeof deleteAccountSchema> = await request.json();

    // Validate
    const { error } = deleteAccountSchema.safeParse(body);
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

    const [deleteError] = await deleteUserById(session.session!.user.id);

    if (deleteError) throw deleteError;

    return NextResponse.json(
      { message: "This account has been deleted!" } as APIResponse,
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      {
        message: "Your account was not deleted.",
        error: "ACCOUNT_DELETE_FAILED_INTERNAL",
      } as APIResponse,
      { status: 500 }
    );
  }
};
