"use client";
import { Spinner } from "@/components/minimal-tiptap/components/spinner";
import { Button } from "@/components/ui/button";
import useVerifyClan from "@/hooks/custom/use-verify-clan";
import { Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const VerifyClanButton = ({ clanId }: { clanId: string }) => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { mutateAsync } = useVerifyClan();

  async function verify() {
    try {
      setLoading(true);
      await mutateAsync({
        clanId: clanId,
      });
      setLoading(false);
      router.refresh();
    } catch (error) {
      setLoading(false);
    }
  }
  return (
    <Button disabled={loading} onClick={verify}>
      {loading && <Spinner />}
      <Check />
      Verify Clan
    </Button>
  );
};

export default VerifyClanButton;
