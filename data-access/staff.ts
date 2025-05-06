import prisma from "@/lib/prisma";
import { checkAuth } from "@/utils/check-auth";
import { Prisma, Role, Staff } from "@/prisma/generated/prisma/client";

export type Response<T> = [Error | null, T | null];

/**
 * Gets user role
 * @returns - A promise that resolves to a member or an error.
 */
export const getStaff = async (): Promise<Response<Staff>> => {
  try {
    const session = await checkAuth();
    if (!session) return ["Not authenticated" as unknown as Error, null];

    // Create clan
    const data: Staff | null = await prisma.staff.findFirst({
      where: {
        userId: session.user.id,
      },
    });

    return [null, data];
  } catch (error) {
    console.log(error);
    return [error as Error, null];
  }
};

export const getStaffCount = async (
  props?: Prisma.StaffCountArgs
): Promise<[null | Error, null | number]> => {
  try {
    const session = await checkAuth();
    if (!session) return ["Not authenticated" as unknown as Error, null];

    // Create clan
    const data = await prisma.staff.count(props);

    return [null, data];
  } catch (error) {
    console.log(error);
    return [error instanceof Error ? error : new Error(String(error)), null];
  }
};

export const getStaffMember = async (
  props: Prisma.StaffFindFirstArgs
): Promise<[Error | null, Staff | null]> => {
  try {
    const session = await checkAuth();
    if (!session) return ["Not authenticated" as unknown as Error, null];

    // Create clan
    const data = await prisma.staff.findFirst(props);

    return [null, data];
  } catch (error) {
    return [error instanceof Error ? error : new Error(String(error)), null];
  }
};

export const assignStaff = async ({
  userId,
  role,
}: {
  userId: string;
  role: Role;
}): Promise<[Error | null, Staff | null]> => {
  try {
    const session = await checkAuth();
    if (!session) return ["Not authenticated" as unknown as Error, null];

    const data = await prisma.staff.upsert({
      where: { userId },
      update: { role },
      create: { userId, role },
    });

    return [null, data];
  } catch (error) {
    return [error instanceof Error ? error : new Error(String(error)), null];
  }
};

export const deleteStaff = async (
  userId: string
): Promise<[Error | null, Staff | null]> => {
  try {
    const session = await checkAuth();
    if (!session) return ["Not authenticated" as unknown as Error, null];

    const data = await prisma.staff.delete({
      where: { userId },
    });

    return [null, data];
  } catch (error) {
    return [error instanceof Error ? error : new Error(String(error)), null];
  }
};
