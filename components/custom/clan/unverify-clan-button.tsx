"use client";
import { Spinner } from "@/components/minimal-tiptap/components/spinner";
import { Button } from "@/components/ui/button";
import useUnverifyClan from "@/hooks/custom/use-unverify-clan";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const UnverifyClanButton = ({ clanId }: { clanId: string }) => {
  const [loading, setLoading] = useState(false);
  const { mutateAsync } = useUnverifyClan();

  const router = useRouter();

  async function unverify() {
    try {
      setLoading(true);
      await mutateAsync({ clanId: clanId });
      setLoading(false);
      router.refresh();
    } catch (error) {
      setLoading(false);
    }
  }
  return (
    <Button disabled={loading} onClick={unverify}>
      {loading && <Spinner />}
      <X />
      Unverify Clan
    </Button>
  );
};

export default UnverifyClanButton;
