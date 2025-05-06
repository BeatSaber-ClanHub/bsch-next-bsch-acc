import { TiptapSchema } from "@/app/validation-schemas/tiptap/schema";
import BanClanForm from "@/components/custom/admin/ban-clan-form/ban-clan-form";
import AppealStatusBadge from "@/components/custom/appeal-status-badge/appeal-status-badge";
import ApplyForVerificationDialog from "@/components/custom/clan/apply-for-verification-dialog";
import BannerUpload from "@/components/custom/clan/banner-upload";
import ClanBanAppeal from "@/components/custom/clan/clan-ban-appeal";
import ClanDescription from "@/components/custom/clan/clan-description/clan-description";
import DeleteClanDialog from "@/components/custom/clan/delete-clan-dialog";
import EditClanExtra from "@/components/custom/clan/edit-clan-extra";
import EditClanNameTag from "@/components/custom/clan/edit-clan-name-tag";
import EditSpecialtiesSection from "@/components/custom/clan/edit-specialties";
import JoinSection from "@/components/custom/clan/join-section";
import MembersTableAndApplicationsTableSection from "@/components/custom/clan/members-table-and-applications-table-section";
import ReportClanDialog from "@/components/custom/clan/report-clan-dialog";
import UnbanClanButton from "@/components/custom/clan/unban-clan-button";
import UnverifyClanButton from "@/components/custom/clan/unverify-clan-button";
import VerifyClanButton from "@/components/custom/clan/verify-clan-button";
import PageError from "@/components/custom/page-error";
import DiscordIcon from "@/components/icons/Discord";
import { colorClasses } from "@/components/types/clan-types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getBanAppeal } from "@/data-access/ban-appeal";
import { ClanWithClanOwnerInfoAndBasicData, getClan } from "@/data-access/clan";
import { getClanBan } from "@/data-access/clan-ban";
import { getMostRecentRequest } from "@/data-access/clan-join-request";
import { getMember } from "@/data-access/member";
import { ClanMember, ClanWithMemberCount } from "@/data-access/types/types";
import { checkAuth } from "@/utils/check-auth";
import getClanRole from "@/utils/get-clan-role";
import getRole from "@/utils/get-role";
import {
  ClanSpecialties,
  ClanStaffRole,
} from "@/prisma/generated/prisma/client";
import { AlertCircle, ClipboardCheck, Clock, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ReactElement } from "react";
import { validate as uuidValidate } from "uuid";
import { z } from "zod";
import { getUserBan } from "@/data-access/user-ban";
import LeaveClan from "@/components/custom/clan/leave-clan-dialog";

type TipTapJson = z.infer<typeof TiptapSchema>;

const ClanPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  // Get ID of the clan
  const clanId = (await params).id;

  // Make sure the clan ID is valid
  if (!uuidValidate(clanId)) return notFound();

  const [error, clan] = await getClan(clanId);
  if (error) return <PageError />;
  if (!clan) return notFound();

  const { role: siteRole } = await getRole();
  const session = await checkAuth();

  let clanMember: ClanMember | null = null;
  let { role: clanRole } = await getClanRole({
    clanId: clan.id,
    userId: session?.user.id || "",
  });

  let requestToJoinRequest = null;

  if (session) {
    const [, request] = await getMostRecentRequest({
      clanId: clanId,
      userId: session.user.id,
    });
    requestToJoinRequest = request;
  }

  if (session) {
    const [, member] = await getMember({
      clanId: clanId,
      userId: session.user.id,
    });

    if (member) {
      clanMember = member;
    }
  }
  if (
    clanRole !== "Creator" &&
    siteRole === null &&
    clanMember === null &&
    clan.visibility === "Hidden"
  ) {
    return notFound();
  }

  if (clanMember?.banned && clan.visibility === "Hidden") notFound();
  if (clanMember?.banned) clanRole = null;
  return (
    <div className="flex flex-col gap-4">
      {siteRole === "Administrator" ||
      siteRole === "Developer" ||
      siteRole === "Moderator" ||
      siteRole === "Currator" ? (
        <div className="border rounded-lg p-4 flex flex-col gap-2">
          <p className="font-bold">Administrative Actions</p>
          <div className="flex gap-4 flex-wrap">
            <ReportClanDialog clan={clan} buttonText="Report Clan" />
            {siteRole === "Administrator" ||
            siteRole === "Developer" ||
            siteRole === "Moderator" ? (
              <>
                {clan.banned ? (
                  <UnbanClanButton
                    clan={clan as unknown as ClanWithClanOwnerInfoAndBasicData}
                    setParentLoading={null}
                  />
                ) : (
                  <>
                    <BanClanForm
                      clan={
                        clan as unknown as ClanWithClanOwnerInfoAndBasicData
                      }
                    />
                  </>
                )}

                <DeleteClanDialog clan={clan} buttonText={"Delete this clan"} />
              </>
            ) : null}
            {clan.application_status === "Approved" ? (
              <UnverifyClanButton clanId={clan.id} />
            ) : (
              !clan.banned && <VerifyClanButton clanId={clan.id} />
            )}
          </div>
        </div>
      ) : null}
      <div className="relative max-h-[500px] min-h-[350px] aspect-[16/5] w-full overflow-hidden rounded-md bg-background">
        <div className="flex flex-col sm:flex-row w-full absolute z-[2] top-0 left-0 m-4 gap-4">
          <div className="overflow-x-auto overflow-y-hidden w-[calc(100%-32px)]">
            <div className="flex items-center gap-4">
              <p className="text-[calc(30px+2vw)] leading-none">
                {clan.clan_name}
              </p>
              {(clanRole === "Administrator" || clanRole === "Creator") &&
              !clan.banned ? (
                <EditClanNameTag
                  clanId={clanId}
                  clanName={clan.clan_name}
                  clanTag={clan.clan_tag}
                  shortDescription={clan.clan_short_description}
                />
              ) : null}
            </div>
            <div className="flex items-center gap-4">
              <p className="text-[calc(20px+1vw)] leading-none">
                {clan.clan_tag}
              </p>
            </div>
          </div>
          {clan.application_status === "Approved" && (
            <div className="sm:ml-auto sm:pr-8 ml-0">
              <Badge
                variant="outline"
                className="text-lg border-[2px] border-yellow-400"
              >
                Approved
              </Badge>
            </div>
          )}
        </div>

        <div className="absolute z-[2] bottom-0 left-0 p-4 h-auto w-full  flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div className="sm:max-w-[50%] w-full flex flex-col sm:flex-row">
            <ShortDescription shortDescription={clan.clan_short_description} />
          </div>
          {(clanRole === "Administrator" || clanRole === "Creator") &&
          !clan.banned ? (
            <div className="sm:ml-auto">
              <BannerUpload id={clanId} />
            </div>
          ) : null}
        </div>

        <div className="absolute top-0 left-0 z-[1] h-full w-full">
          <Image
            src={clan.banner_url}
            alt="clan banner"
            fill
            className="object-cover brightness-50"
          />
        </div>
      </div>
      {clan.banned &&
      (siteRole === "Administrator" ||
        siteRole === "Developer" ||
        siteRole === "Moderator") ? (
        <Alert variant="destructive">
          <AlertCircle />
          <AlertTitle>This clan has been banned!</AlertTitle>
          <AlertDescription>
            This clan was banned! Changes are no longer allowed to be made.
          </AlertDescription>
        </Alert>
      ) : null}
      {clan.banned && clanRole === "Creator" ? (
        <AppealBan clanId={clanId} />
      ) : null}
      {clan.banned &&
      siteRole !== "Administrator" &&
      siteRole !== "Developer" &&
      siteRole !== "Moderator" ? (
        <Alert variant="destructive">
          <AlertCircle />
          <AlertTitle>This clan has been banned!</AlertTitle>
          <AlertDescription>
            This clan was banned! Changes are no longer allowed to be made.
          </AlertDescription>
        </Alert>
      ) : (
        <>
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex flex-col gap-4 w-full lg:w-2/3">
              {(clanRole === "Administrator" || clanRole === "Creator") &&
              !clan.banned ? (
                <EditSpecialtiesSection
                  selectedSpecialties={clan.clan_specialties}
                  clanId={clanId}
                />
              ) : clan.clan_specialties.length > 0 ? (
                <SpecialtiesSection specialties={clan.clan_specialties} />
              ) : null}
              <div className="flex flex-col gap-4 md:flex-row">
                <ClanDescription
                  clanId={clanId}
                  description={clan.description as TipTapJson}
                  clanRole={clanRole}
                />
              </div>
            </div>
            <Stats clan={clan} clanRole={clanRole} clanMember={clanMember} />
          </div>
          {session && !clanMember && !clanRole ? (
            <JoinSection
              clan={clan}
              request={requestToJoinRequest}
              banned={session?.user.banned || false}
            />
          ) : null}
          {clanMember && clanMember.banned ? (
            <BannedAlert memberId={clanMember.id} />
          ) : null}

          <MembersTableAndApplicationsTableSection
            clanRole={clanRole}
            sessionUser={session?.user || null}
            clan={clan}
          />
        </>
      )}
    </div>
  );
};

const BannedAlert = async ({ memberId }: { memberId: string }) => {
  const [banErr, memberBan] = await getUserBan(memberId);

  return (
    <Alert variant="destructive">
      <AlertCircle />
      <AlertTitle>You have been banned from this clan!</AlertTitle>
      <AlertDescription>
        You've been banned for the following reason: {memberBan?.justification}
      </AlertDescription>
    </Alert>
  );
};

const ShortDescription = ({
  shortDescription,
}: {
  shortDescription: string;
}) => {
  return (
    <div>
      <p>{shortDescription}</p>
    </div>
  );
};

const AppealBan = async ({ clanId }: { clanId: string }) => {
  const [error, ban] = await getClanBan(clanId);

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle />
        <AlertTitle>Issue getting info on ban!</AlertTitle>
        <AlertDescription>
          Something went wrong and we could not retrive data on the ban. Please
          try again later
        </AlertDescription>
      </Alert>
    );
  }
  if (!ban) {
    return (
      <Alert>
        <AlertCircle />
        <AlertTitle>Uh Oh!</AlertTitle>
        <AlertDescription>
          If you see this, something went wrong. We can&apos;t find a ban for
          this clan. Please contact BSCH staff to get this corrected.
        </AlertDescription>
      </Alert>
    );
  }

  const [appealError, appeal] = await getBanAppeal({
    banId: ban.id,
    status: ["In_Review", "Submitted", "Denied"],
  });

  if (appealError) {
    return (
      <Alert variant="destructive">
        <AlertCircle />
        <AlertTitle>Issue getting info on ban!</AlertTitle>
        <AlertDescription>
          Something went wrong and we could not retrive data on the ban. Please
          try again later
        </AlertDescription>
      </Alert>
    );
  }

  let allowAppeal = false;
  if (appeal) {
    if (appeal.status === "Denied" && appeal.allowAnotherAppeal) {
      allowAppeal = true;
    }
  } else allowAppeal = true;

  const appeal_status = appeal?.status ? appeal.status : "Submitted";
  const displayComments =
    appeal_status === "Approved" || appeal_status === "Denied";
  return (
    <div>
      <div className="flex flex-col gap-4">
        <div className="p-4 pt-2 border-border border-[1px] rounded-md flex flex-col justify-center gap-2">
          <h1 className="leading-none">What? Why was I banned?</h1>
          <p className="text-sm text-muted-foreground">
            No worries. All bans are required to be justifed. Please see the
            reason below.
          </p>
          <div
            className="max-h-[300px] max-w-[571px] w-full overflow-y-auto overflow-x-hidden"
            style={{
              whiteSpace: "pre-wrap",
              wordWrap: "break-word",
              overflowWrap: "break-word",
            }}
          >
            {ban.justification}
          </div>
        </div>
        <div className="p-4 pt-2 border-border border-[1px] rounded-md flex flex-col justify-center gap-4">
          <h1 className="text-xl leading-none">Can I appeal this?</h1>
          <p className="text-sm text-muted-foreground">
            Depending on the severity of your ban, you may be eligible for an
            appeal.
          </p>
          <div className="flex gap-2">
            <p>Your clan is</p>
            {ban!.permanent || !allowAppeal ? (
              <Badge className="bg-red-500 w-fit">Ineligible</Badge>
            ) : (
              <>
                <Badge className="bg-green-500 w-fit">Eligible</Badge>
              </>
            )}
            <p>for appeal.</p>
          </div>
          {!ban!.permanent && allowAppeal ? (
            <div>
              <ClanBanAppeal ban={ban!} />
            </div>
          ) : (
            <div>
              <Button disabled={true}>Appeal Submitted</Button>
            </div>
          )}
        </div>
        {appeal && (
          <div className="p-4 pt-2 border-border border-[1px] rounded-md flex flex-col justify-center gap-2">
            <h1 className="leading-none">Appeal Status</h1>
            <p className="text-sm text-muted-foreground">
              You will see your appeal status here as well as any comments made
              by reviewers.
            </p>
            <AppealStatusBadge status={appeal_status} />
            {appeal.status !== "In_Review" && appeal.status !== "Submitted" ? (
              <>
                <div className="flex items-center gap-2">
                  <p>Allowed another appeal:</p>{" "}
                  <Badge
                    className={`${
                      appeal.allowAnotherAppeal ? "bg-green-500" : "bg-red-500"
                    }`}
                  >
                    {JSON.stringify(appeal.allowAnotherAppeal).toUpperCase()}
                  </Badge>
                </div>
                <p className="text-muted-foreground">Comments</p>
                {displayComments ? (
                  appeal.comments ? (
                    <div
                      className="max-h-[300px] max-w-[571px] w-full overflow-y-auto overflow-x-hidden"
                      style={{
                        whiteSpace: "pre-wrap",
                        wordWrap: "break-word",
                        overflowWrap: "break-word",
                      }}
                    >
                      {appeal.comments}
                    </div>
                  ) : (
                    "No comments..."
                  )
                ) : (
                  "Comments..."
                )}
              </>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
};

const StatRow = ({
  stat,
  statValue,
  icon,
}: {
  stat: string;
  statValue: string | number | null;
  icon: ReactElement;
}) => {
  return (
    <div className="w-full rounded-md border-border border-[1px] px-4 min-h-[72px] h-[72px] flex gap-4 items-center">
      <div className="w-[40px] min-h-[40px] flex items-center justify-center p-2 rounded-md bg-muted-foreground/20">
        {icon}
      </div>
      <p>{stat}</p>
      <Separator orientation="vertical" className="h-[calc(100%-32px)]" />
      <p className="ml-auto">{statValue ? statValue : "No Data"}</p>
    </div>
  );
};

const Stats = ({
  clan,
  clanRole,
  clanMember,
}: {
  clan: ClanWithMemberCount;
  clanRole: ClanStaffRole | null;
  clanMember: ClanMember | null;
}) => {
  return (
    <Card className="flex-1">
      <CardHeader>
        <CardTitle>Stats and Info</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4  overflow-auto">
          <StatRow
            icon={<ClipboardCheck />}
            stat="Application Status"
            statValue={clan.application_status}
          />
          <StatRow
            icon={<Users />}
            stat="Members"
            statValue={clan.memberCount}
          />
          <StatRow
            icon={<Clock />}
            stat="Created At"
            statValue={new Date(clan.createdAt).toDateString()}
          />
          <div className="flex gap-4 items-center flex-wrap">
            <Link href={clan.discord_invite_link!} target="_blank">
              <Button>
                <DiscordIcon />
                Discord
              </Button>
            </Link>

            {(clanRole === "Administrator" || clanRole === "Creator") &&
            !clan.banned &&
            (clan.application_status === "None" ||
              clan.application_status === "Denied") ? (
              <>
                <ApplyForVerificationDialog clan={clan} />
              </>
            ) : null}
            {(clanRole === "Administrator" ||
              (clanRole === "Creator" && !clan.banned)) && (
              <EditClanExtra clan={clan} clanRole={clanRole} />
            )}
            {clanMember && clanRole !== "Creator" ? (
              <LeaveClan clanId={clan.id} />
            ) : null}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const SpecialtiesSection = ({
  specialties,
}: {
  specialties: ClanSpecialties[];
}) => {
  return (
    <div className="w-full p-4 border-border border-[1px] rounded-md overflow-x-auto no-scrollbar flex gap-4">
      {specialties.map((specialty) => {
        const color = colorClasses[specialty];
        return (
          <Badge
            key={specialty}
            className={`text-lg border-[2px] border-${color}`}
            variant="outline"
          >
            {specialty}
          </Badge>
        );
      })}
    </div>
  );
};

export default ClanPage;
