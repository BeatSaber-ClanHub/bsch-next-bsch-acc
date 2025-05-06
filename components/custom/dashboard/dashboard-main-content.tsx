"use client";
import ClanCardsLoading from "@/components/custom/clan-card/clan-cards-loading/clan-cards-loading";
import CreateClan from "@/components/custom/create-clan/create-clan";
import JoinedClans from "@/components/custom/dashboard/joined-clans";
import YourClans from "@/components/custom/dashboard/your-clans";
import { Separator } from "@/components/ui/separator";
import { memo, Suspense } from "react";

// Create clan
const CreateClanSection = () => {
  return (
    <div className="rounded-lg overflow-hidden p-4 bg-secondary/30 flex flex-col justify-center pt-0 min-h-[300px]">
      <p className="text-[calc(40px+1vw)]">Create a clan</p>
      <div className="flex gap-4">
        <CreateClan />
      </div>
    </div>
  );
};

// Joined clans section layout
const JoinedClanSection = () => {
  return (
    <div>
      <p className="text-[calc(40px+1vw)]">Joined Clans</p>
      <div className="flex gap-4 overflow-x-auto w-full pb-4">
        <Suspense fallback={<ClanCardsLoading />}>
          <JoinedClans />
        </Suspense>
      </div>
    </div>
  );
};

// Your clans section layout
const YourClansSection = () => {
  return (
    <div>
      <p className="text-[calc(40px+1vw)]">Your Clans</p>
      <div className="flex gap-4 overflow-x-auto w-full pb-4">
        <Suspense fallback={<ClanCardsLoading />}>
          <YourClans />
        </Suspense>
      </div>
    </div>
  );
};

const Memoized_YourClans = memo(YourClansSection);
const Memoized_JoinedClans = memo(JoinedClanSection);

const DashboardMainContent = () => {
  return (
    <div className="flex flex-col gap-4">
      <CreateClanSection />
      <Separator className="mt-8" />
      <Memoized_YourClans />
      <Memoized_JoinedClans />
    </div>
  );
};

export default DashboardMainContent;
