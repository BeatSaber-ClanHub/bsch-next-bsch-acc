"use client";

import { ServerCrash, RotateCw } from "lucide-react";
import { Button } from "../ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../ui/card";
import { useRouter } from "next/navigation";

const PageError = () => {
  const router = useRouter();

  return (
    <div className="absolute w-full h-screen min-h-[500px] top-0 left-0 flex items-center justify-center">
      <Card className="w-fumin-ll sm:max-w-[300px]">
        <CardHeader>
          <CardTitle>There was an issue!</CardTitle>
          <CardDescription>
            There seemed to be an issue with your request!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 items-center justify-center">
            <ServerCrash size={50} />
            <Button onClick={() => router.refresh()}>
              <RotateCw />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PageError;
