import { Search } from "lucide-react";
import { Alert, AlertTitle } from "../ui/alert";

// Not found
const NoClansFound = () => {
  return (
    <div className="w-full flex items-center justify-center">
      <div className="flex flex-col items-center">
        <Search className="text-accent mb-8" size={40} />
        <p className="font-bold text-5xl">No Clans Found</p>
        <p className="text-muted-foreground">
          Hmm. Doesn&apos;t look like there are any clans!
        </p>
        <div className="pt-8">
          <div className="flex items-center justify-center space-x-3">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-blue-500"></div>
            <span className="text-xs text-zinc-500">Beat Saber Clan Hub</span>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-red-500"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoClansFound;
