import { colorClasses } from "@/components/types/clan-types";
import { Badge } from "@/components/ui/badge";
import { Clan } from "@/prisma/generated/prisma/client";
import Image from "next/image";

const ClanBanner = ({ clan }: { clan: Clan }) => {
  return (
    <div className="relative min-w-full min-h-[200px] rounded-md overflow-hidden">
      <div className="absolute z-[2] w-full h-full top-0 left-0 p-4">
        <div>
          <p className="text-lg">{clan.clan_name}</p>
          <p className="text-sm">{clan.clan_tag}</p>
        </div>
        <div className="absolute bottom-0 left-0 w-full mb-4 pl-4 pr-4 overflow-hidden flex gap-2">
          {clan.clan_specialties.map((specialty, index) => {
            if (index >= 3) return;
            return (
              <Badge key={index} className={colorClasses[specialty]}>
                {specialty}
              </Badge>
            );
          })}
        </div>
      </div>
      <div className="absolute top-0 left-0 h-full w-full">
        <Image
          src={clan.banner_url}
          alt={"Clan Banner"}
          className="brightness-50"
          fill
        />
      </div>
    </div>
  );
};

export default ClanBanner;
