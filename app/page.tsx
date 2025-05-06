import DiscordIcon from "@/components/icons/Discord";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getClanCount } from "@/data-access/clan";
import { getUserCount } from "@/data-access/user";
import { Gamepad, Swords, Users } from "lucide-react";
import Link from "next/link";

export default async function Home() {
  return (
    <div className="w-full h-auto flex flex-col gap-12">
      <HeroSection />
      <BuildYourClanSection />
      <StatsSection />
      <DiscordSection />
    </div>
  );
}

const HeroSection = () => {
  return (
    <div className="w-full aspect-[16/7] min-h-[400px] rounded-md flex items-center justify-center relative">
      <div className="absolute w-full max-w-[1000px] animate-text-slide z-[2] flex flex-col items-center gap-4">
        <p className="text-3xl sm:text-5xl lg:text-8xl font-bold text-center leading-[1.3] font-display">
          Welcome to Beat Saber Clan Hub
        </p>
        <Separator orientation="horizontal" className="max-w-[300px]" />
        <p className="max-w-[500px] text-center text-muted-foreground">
          Shine a spotlight on your clan with BSCH! Our platform amplifies your
          visibility, connecting you with a wider pool of passionate Beat Saber
          players.
        </p>
      </div>
      <div className="from-primary/20 to-transparent bg-gradient-to-b h-full bottom-0 w-full z-0"></div>
    </div>
  );
};

const BuildYourClanSection = () => {
  return (
    <div className="flex flex-col gap-4 max-w-[1600px] ml-auto mr-auto">
      <p className="text-[calc(40px+0.5vw)] font-bold text-center leading-[1.3] max-w-[1200px] ml-auto mr-auto font-display">
        Why BSCH?
      </p>
      <p className="text-muted-foreground max-w-[500px] text-center ml-auto mr-auto">
        Experience the benefits of being part of the most dynamic Beat Saber
        community
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8 ml-auto mr-auto px-4">
        <Card className="bg-secondary/40 text-white">
          <CardHeader className="flex flex-col items-center">
            <Users className="h-12 w-12 mb-4 text-blue-500" />
            <CardTitle>Community</CardTitle>
            <CardDescription className="text-zinc-400 text-center">
              Connect with players who share your passion for Beat Saber!
            </CardDescription>
          </CardHeader>
        </Card>
        <Card className="bg-secondary/40 text-white">
          <CardHeader className="flex flex-col items-center">
            <Gamepad className="h-12 w-12 mb-4 text-red-500" />
            <CardTitle>Skill Development</CardTitle>
            <CardDescription className="text-zinc-400 text-center">
              Join BSCH clans focused on skill training and unlock your peak
              performance with expert guidance.
            </CardDescription>
          </CardHeader>
        </Card>
        <Card className="bg-secondary/40 text-white">
          <CardHeader className="flex flex-col items-center">
            <Swords className="h-12 w-12 mb-4 text-purple-500" />
            <CardTitle>Start a clan</CardTitle>
            <CardDescription className="text-zinc-400 text-center">
              Take the lead and create your own clan! Build a community of
              like-minded players and compete together!
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
};

const StatsSection = async () => {
  const [, clanCount] = await getClanCount({
    where: { banned: false, visibility: "Visible" },
  });
  const [, userCount] = await getUserCount({
    banned: false,
  });
  return (
    <div className="bg-zinc-900/30 p-12 min-h-[400px] items-center justify-center flex w-full max-w-[1600px] mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 min-h-[200px] gap-8 mx-auto w-full">
        <div className="bg-red-500/30 flex flex-col justify-center items-center rounded-lg border-red-500 border-[1px] p-4">
          <p className="text-red-300 text-3xl font-bold">{clanCount}</p>
          <p className="text-muted-foreground">Clans</p>
        </div>
        <div className="bg-blue-500/30 flex flex-col justify-center items-center rounded-lg border-blue-500 border-[1px] p-4">
          <p className="text-blue-300 text-3xl font-bold">{userCount}</p>
          <p className="text-muted-foreground">Users</p>
        </div>
        <div className="bg-purple-500/30 flex flex-col justify-center items-center rounded-lg border-purple-500 border-[1px] p-4">
          <p className="text-purple-300 text-3xl font-bold">5+</p>
          <p className="text-muted-foreground">Year Old Community</p>
        </div>
        <div className="bg-green-500/30 flex flex-col justify-center items-center rounded-lg border-green-500 border-[1px] p-4">
          <p className="text-green-300 text-3xl font-bold">100%</p>
          <p className="text-muted-foreground">Open Source</p>
        </div>
      </div>
    </div>
  );
};

const DiscordSection = () => {
  return (
    <div className="from-primary/20 to-transparent bg-gradient-to-t h-full bottom-0 w-full z-0 mt-12 p-12 py-[100px] flex flex-col items-center gap-4">
      <p className="text-[calc(40px+0.5vw)] font-bold text-center leading-[1.3] max-w-[1200px] ml-auto mr-auto font-display">
        Wanna Join the Discord?
      </p>
      <p className="text-muted-foreground max-w-[500px] text-center ml-auto mr-auto">
        Join the BSCH Discord to recieve the latest updates and connect with
        others.
      </p>
      <Link href="#" target="_blank" className="mt-8">
        <Button>
          <DiscordIcon /> Join the Discord!
        </Button>
      </Link>
    </div>
  );
};
