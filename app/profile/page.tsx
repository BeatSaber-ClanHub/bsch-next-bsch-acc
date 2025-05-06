import APIKeys from "@/components/custom/api-key-table/api-keys";
import DeleteAccountButton from "@/components/custom/profile/delete-account-dialog";
import SignoutAllSessionsButton from "@/components/custom/profile/signout-all-sessions-button";
import SignoutButton from "@/components/custom/profile/signout-button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getKeys } from "@/data-access/api-key";
import { getClanCount } from "@/data-access/clan";
import { getUserById } from "@/data-access/user";
import { checkAuth } from "@/utils/check-auth";
import getRole from "@/utils/get-role";
import { Role, User } from "@/prisma/generated/prisma/client";
import { AvatarFallback } from "@radix-ui/react-avatar";
import { AlertCircle } from "lucide-react";
import { redirect } from "next/navigation";

const ProfilePage = async () => {
  const session = await checkAuth();
  if (!session) return redirect("/login");

  const [userError, user] = await getUserById(session.user.id);
  const { role } = await getRole();

  if (userError || !user) {
    return (
      <div className="w-full flex flex-col items-center gap-4">
        <div className="w-full flex flex-col gap-4 border rounded-xl p-4">
          <p className="text-xl">Account</p>
          <Alert variant="destructive">
            <AlertCircle />
            <AlertTitle>Uh Oh!</AlertTitle>
            <AlertDescription>
              There was an issue retrieving your Account!
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }
  return (
    <div className="w-full md:max-w-[800px] flex flex-col gap-4 ml-auto mr-auto">
      <ProfileSection role={role} user={user} />
      {!user.banned ? (
        <APIKeysSection />
      ) : (
        <Alert>
          <AlertCircle />
          <AlertTitle>API Keys not available</AlertTitle>
          <AlertDescription>
            Your account has been banned. You do not have access to API keys.
            Existing keys will no longer work.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

const Sessions = () => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-4 sm:flex-row">
        <Card className="min-w-[200px]">
          <CardHeader>
            <CardTitle>Sign Out</CardTitle>
            <CardDescription>Sign out on this device</CardDescription>
          </CardHeader>

          <CardContent>
            <SignoutButton />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Sign Out all sessions</CardTitle>
            <CardDescription>
              Signing out on all sessions will require you to log back in on all
              devices currently signed into BSCH.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SignoutAllSessionsButton />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const DeleteAccountSection = async ({ userId }: { userId: string }) => {
  const [countError, ownedClansCount] = await getClanCount({
    where: { clan_owner: userId },
  });

  let hasOwnedClans = true;
  if (countError) {
    hasOwnedClans = false;
  } else if ((ownedClansCount as number) <= 0) {
    hasOwnedClans = false;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Delete your Account</CardTitle>
        <CardDescription>
          Remove your account from BSCH. Any clans owned by you will be removed.
          Please consider tranfering ownership before you delete your account if
          this applies.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {countError && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle />
            <AlertTitle>Uh Oh!</AlertTitle>
            <AlertDescription>
              We encountered a problem while retrieving your owned clans. You
              can proceed with deleting your account, but you won&apos;t receive
              a warning about any clans you may own.
            </AlertDescription>
          </Alert>
        )}
        <DeleteAccountButton hasOwnedClans={hasOwnedClans} />
      </CardContent>
    </Card>
  );
};

const ProfileSection = async ({
  user,
  role,
}: {
  user: User;
  role: Role | null;
}) => {
  return (
    <div className="flex flex-col gap-4">
      {user.banned && (
        <Alert variant="destructive">
          <AlertCircle />
          <AlertTitle>Your account has been banned!</AlertTitle>
          <AlertDescription>
            Your account has been banned. You will not be able to access
            restrictied routes or clans. If you have questions, contact BSCH
            staff.
          </AlertDescription>
        </Alert>
      )}
      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>
            Manage your account and its details here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 flex-col sm:flex-row items-center sm:items-start">
            <Avatar className="w-[120px] h-[120px] flex items-center justify-center">
              <AvatarFallback className="w-full h-full">
                <Skeleton className="w-full h-full" />
              </AvatarFallback>
              <AvatarImage src={user.image} />
            </Avatar>
            <div className="flex flex-col gap-4 items-center sm:items-start">
              <div>
                <p className="text-2xl text-center sm:text-start">
                  {user.name}
                </p>
                <p className="text-muted-foreground text-center sm:text-start">
                  {user.email}
                </p>
              </div>
              <div className="flex flex-wrap gap-4">
                <Badge className="w-fit">{role ? role : "User"}</Badge>
                {user.banned && (
                  <Badge className="w-fit bg-red-500 hover:bg-red-700">
                    Banned
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <div className="mt-4 flex flex-col gap-4">
            <Sessions />
            <DeleteAccountSection userId={user.id} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const APIKeysSection = async () => {
  const [error, keys] = await getKeys();
  return (
    <Card>
      {error ? (
        <>
          <CardHeader>
            <CardTitle>API Keys</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertCircle />
              <AlertTitle>Uh Oh!</AlertTitle>
              <AlertDescription>
                There was an issue retrieving your API keys!
              </AlertDescription>
            </Alert>
          </CardContent>
        </>
      ) : (
        <APIKeys data={keys!} />
      )}
    </Card>
  );
};
// APIKeys Component

export default ProfilePage;
