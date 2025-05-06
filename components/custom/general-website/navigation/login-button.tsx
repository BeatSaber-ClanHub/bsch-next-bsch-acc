import { Button, ButtonProps } from "@/components/ui/button";
import Link from "next/link";

const LoginButton = (props: ButtonProps) => {
  return (
    <Link href="/login">
      <Button {...props}>
        <p>Login</p>
      </Button>
    </Link>
  );
};

export default LoginButton;
