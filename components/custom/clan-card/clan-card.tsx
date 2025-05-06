import { colorClasses } from "@/components/types/clan-types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ClanWithClanOwnerInfoAndBasicData } from "@/data-access/clan";
import { Check, Eye, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

function ClanCard({
  clan,
  className,
  target,
}: {
  clan: ClanWithClanOwnerInfoAndBasicData;
  className?: string;
  target?: React.HTMLAttributeAnchorTarget | undefined;
}) {
  return (
    <Card className="bg-gray-900/50 border-gray-800 overflow-hidden group hover:border-purple-500/50 transition-all duration-300 hover:shadow-[0_0_15px_rgba(59,130,246,0.3)] w-[500px]">
      <div className="relative h-40 overflow-hidden">
        <Image
          src={clan.banner_url}
          alt={`${clan.clan_name} banner`}
          fill
          objectFit="cover"
          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-200"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent"></div>

        {clan.application_status === "Approved" && (
          <Badge className="absolute top-3 right-3 bg-yellow-400 text-yellow-700 hover:bg-yellow-500">
            <Check className="w-3 h-3 mr-1" /> Verified
          </Badge>
        )}

        <div className="absolute bottom-3 left-3 flex items-center justify-center gap-2">
          <div className="w-12 h-12 rounded-full bg-gray-800 border-2 border-gray-700 overflow-hidden relative">
            <Image
              src={clan.user.image}
              alt={`${clan.clan_name} logo`}
              width={50}
              height={50}
              className="object-cover"
            />
          </div>
          <div>
            <p className="font-bold text-lg">{clan.clan_name}</p>
            <div className="flex items-center text-sm text-gray-400">
              <Eye className="w-3 h-3 mr-1" /> {clan.visibility}
            </div>
          </div>
        </div>
      </div>

      <CardContent className="p-4">
        <p className="text-gray-300 text-sm mb-4 line-clamp-2">
          {clan.clan_short_description}
        </p>

        <div className="flex flex-col gap-4">
          <div className="flex items-center text-gray-400 text-sm">
            <Users className="w-4 h-4 mr-1" />
            <span>{clan._count.Member} members</span>
          </div>

          <div className="flex gap-2 flex-wrap">
            {clan.clan_specialties.map((specialty, index) => (
              <Badge
                key={index}
                variant="outline"
                className={`text-xs ${colorClasses[specialty]}`}
              >
                {specialty}
              </Badge>
            ))}
          </div>
        </div>
        <Link
          href={`clan/${clan.id}`}
          className={`${className}`}
          target={target}
        >
          <Button className="w-full mt-4 bg-gradient-to-r from-blue-600/80 to-purple-600/80 hover:from-blue-600 hover:to-purple-600 transition-all duration-300">
            View Clan
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

export default ClanCard;
