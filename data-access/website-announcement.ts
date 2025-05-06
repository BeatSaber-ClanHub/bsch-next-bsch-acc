import prisma from "@/lib/prisma";
import { checkAuth } from "@/utils/check-auth";
import { updateBanAppeal } from "./ban-appeal";
import {
  Prisma,
  WebsiteAnnouncement,
} from "../prisma/generated/prisma/client/index";

const dataToInclude: Pick<Prisma.WebsiteAnnouncementFindManyArgs, "include"> = {
  include: {
    postedByUser: {
      select: {
        id: true,
        image: true,
        name: true,
      },
    },
  },
};

export type WebsiteAnnouncementWithPosterUserData =
  Prisma.WebsiteAnnouncementGetPayload<typeof dataToInclude>;

export const getWebsiteAnnouncements = async (
  props?: Prisma.WebsiteAnnouncementFindManyArgs
): Promise<[Error | null, WebsiteAnnouncementWithPosterUserData[] | null]> => {
  try {
    const data = await prisma.websiteAnnouncement.findMany({
      ...props,
      take: props?.take ? props.take : 20,
      orderBy: props?.orderBy ? props.orderBy : { showAt: "desc" },
      ...dataToInclude,
    });

    return [null, data];
  } catch (error) {
    return [error instanceof Error ? error : new Error(String(error)), null];
  }
};

export const getAnnouncement = async (
  id: string
): Promise<[Error | null, WebsiteAnnouncementWithPosterUserData | null]> => {
  try {
    const data = await prisma.websiteAnnouncement.findUnique({
      where: {
        id: id,
      },
      ...dataToInclude,
    });

    return [null, data];
  } catch (error) {
    return [error instanceof Error ? error : new Error(String(error)), null];
  }
};

export const getWebsiteAnnouncementCount = async (
  props?: Prisma.WebsiteAnnouncementWhereInput
): Promise<[Error | null, number | null]> => {
  try {
    const data = await prisma.websiteAnnouncement.count({
      where: {
        ...props,
      },
    });

    return [null, data];
  } catch (error) {
    return [error instanceof Error ? error : new Error(String(error)), null];
  }
};

export const createWebsiteAnnouncement = async (
  announcementData: Pick<
    WebsiteAnnouncement,
    "announcement" | "hideAt" | "showAt" | "visible" | "title"
  >
): Promise<[Error | null, WebsiteAnnouncementWithPosterUserData | null]> => {
  try {
    const session = await checkAuth();
    if (!session) {
      return [new Error("Not Authenticated"), null];
    }
    const data = await prisma.websiteAnnouncement.create({
      data: {
        ...announcementData,
        postedById: session.user.id,
      },
      ...dataToInclude,
    });

    return [null, data];
  } catch (error) {
    return [error instanceof Error ? error : new Error(String(error)), null];
  }
};

export const updateWebsiteAnnouncement = async ({
  announcementData,
  id,
}: {
  announcementData: Pick<
    WebsiteAnnouncement,
    "announcement" | "hideAt" | "showAt" | "visible" | "title"
  >;
  id: string;
}): Promise<[Error | null, WebsiteAnnouncementWithPosterUserData | null]> => {
  try {
    const session = await checkAuth();
    if (!session) {
      return [new Error("Not Authenticated"), null];
    }
    const data = await prisma.websiteAnnouncement.update({
      where: {
        id: id,
      },
      data: {
        ...announcementData,
      },
      ...dataToInclude,
    });

    return [null, data];
  } catch (error) {
    return [error instanceof Error ? error : new Error(String(error)), null];
  }
};

export const deleteWebsiteAnnouncement = async (
  id: string
): Promise<[Error | null, WebsiteAnnouncementWithPosterUserData | null]> => {
  try {
    const session = await checkAuth();
    if (!session) {
      return [new Error("Not Authenticated"), null];
    }
    const data = await prisma.websiteAnnouncement.delete({
      where: {
        id: id,
      },
      ...dataToInclude,
    });

    return [null, data];
  } catch (error) {
    return [error instanceof Error ? error : new Error(String(error)), null];
  }
};

export const getVisibleAnnouncements = async (): Promise<
  [Error | null, WebsiteAnnouncementWithPosterUserData[] | null]
> => {
  try {
    const now = new Date();
    const data = await prisma.websiteAnnouncement.findMany({
      where: {
        OR: [
          {
            AND: [
              {
                showAt: {
                  lte: now,
                },
              },
              {
                hideAt: {
                  gte: now,
                },
              },
            ],
          },
          {
            visible: true,
          },
        ],
      },
    });
    return [null, data];
  } catch (error) {
    return [error instanceof Error ? error : new Error(String(error)), null];
  }
};
