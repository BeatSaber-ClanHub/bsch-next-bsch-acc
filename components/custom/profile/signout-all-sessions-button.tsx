"use client";
import { Spinner } from "@/components/minimal-tiptap/components/spinner";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { useState } from "react";

const SignoutAllSessionsButton = () => {
  const [loading, setLoading] = useState(false);

  async function logOut() {
    try {
      setLoading(true);
      authClient.revokeSessions({
        fetchOptions: {
          onSuccess: async () => {
            window.location.reload();
          },
        },
      });
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  }
  return (
    <Button variant="destructive" onClick={() => logOut()} disabled={loading}>
      {loading && <Spinner />}Sign out all sessions
    </Button>
  );
};

export default SignoutAllSessionsButton;
