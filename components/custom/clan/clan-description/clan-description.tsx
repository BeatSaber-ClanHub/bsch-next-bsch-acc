"use client";

import EditDescription from "@/components/custom/clan/clan-description/edit-description";
import NoDescription from "@/components/custom/clan/clan-description/no-description";
import { TipTapJson } from "@/components/custom/clan/clan-description/types";
import TiptapRenderer from "@/components/custom/text-editor/TipTapRenderer";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ClanStaffRole } from "@/prisma/generated/prisma/client";
import { useState } from "react";

const ClanDescription = ({
  description,
  clanRole,
  clanId,
}: {
  description: TipTapJson | null;
  clanRole: ClanStaffRole | null;
  clanId: string;
}) => {
  const [displayEditor, setDisplayEditor] = useState(false);
  const [content, setContent] = useState<TipTapJson | null>(description);
  if (displayEditor)
    return (
      <EditDescription
        setDisplayEditor={setDisplayEditor}
        setContent={setContent}
        clanId={clanId}
        description={content}
      />
    );
  return (
    <Card className="max-h-[300px] min-h-[300px] w-full overflow-hidden relative">
      <CardHeader>
        <CardTitle>About</CardTitle>
      </CardHeader>
      <CardContent
        className={`${
          content && "h-[calc(100%-64px)]"
        } w-full overflow-y-auto pb-16`}
      >
        {content ? (
          // <div
          //   className="w-full h-auto"
          //   dangerouslySetInnerHTML={{ __html: content }}
          // />
          <TiptapRenderer content={content} />
        ) : (
          <NoDescription
            clanRole={clanRole}
            setDisplayEditor={setDisplayEditor}
          />
        )}
      </CardContent>
      {(content && clanRole === "Creator") || clanRole === "Administrator" ? (
        <CardFooter className="absolute bottom-0 right-0 w-fulle">
          <Button onClick={() => setDisplayEditor(true)}>Edit</Button>
        </CardFooter>
      ) : null}
    </Card>
  );
};

export default ClanDescription;
