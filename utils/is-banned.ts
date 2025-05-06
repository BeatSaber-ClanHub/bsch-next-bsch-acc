import { getUserById } from "@/data-access/user";
import { Session, User } from "better-auth";

interface RoleResponse {
  banned: boolean;
  error?: string;
}

interface Auth {
  user: User;
  session?: Session;
}

const isBanned = async (session: Auth): Promise<RoleResponse> => {
  try {
    const [userError, user] = await getUserById(session.user.id);
    if (userError) throw userError;

    if (!user) {
      return { banned: false, error: "User not found." };
    }

    return { banned: user.banned };
  } catch (error) {
    console.log(error);
    return { banned: false, error: "Something went wrong getting ban status." };
  }
};

export default isBanned;
