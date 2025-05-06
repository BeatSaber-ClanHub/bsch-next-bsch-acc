import { LoginForm } from "@/components/login-form";
import { checkAuth } from "@/utils/check-auth";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  const auth = await checkAuth();
  if (auth?.session) redirect("/dashboard");

  return (
    <div className="flex h-[calc(100vh-72px)] min-h-[400px] flex-col items-center justify-center gap-6 bg-transparent p-6 md:p-10 max-w-[1600px] ml-auto mr-auto mt-[72px] px-4 pt-4">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <LoginForm />
      </div>
    </div>
  );
}
