"use client";
import BSCHLogo from "@/components/custom/general-website/bsch-logo";
import Link from "next/link";
import { usePathname } from "next/navigation";

const Footer = () => {
  const pathname = usePathname();
  const showFooterRoutes = ["/", "/clans", "/docs", "/login"];
  const showFooter = showFooterRoutes.includes(pathname);

  return showFooter ? <FooterContainer /> : null;
};

const FooterContainer = () => {
  return (
    <div className="border-t-2 py-[150px] w-full flex justify-center absolute top-full">
      <div className="w-full max-w-[1600px] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 px-4">
        <Col1 />
        <Col2 />
        <Col3 />
        <Col4 />
      </div>
    </div>
  );
};

const Col1 = () => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2 items-center">
        <BSCHLogo /> <p className="font-bold font-display">BSCH</p>
      </div>
      <div>
        <p className="text-muted-foreground text-sm">
          Beat Saber Clan Hub welcomes competitive and casual players! Connect,
          create, and conquer together – start your clan journey today!
        </p>
      </div>
    </div>
  );
};

const Col2 = () => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2 items-center">
        <p>Quick Links</p>
      </div>
      <div className="flex flex-col gap-2">
        <Link href="/" className="text-muted-foreground text-sm">
          Home
        </Link>
        <Link href="/clans" className="text-muted-foreground text-sm">
          Clans
        </Link>
        <Link href="/login" className="text-muted-foreground text-sm">
          Login
        </Link>
      </div>
    </div>
  );
};

const Col3 = () => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2 items-center">
        <p>Resources</p>
      </div>
      <div className="flex flex-col gap-2">
        <Link href="#" className="text-muted-foreground text-sm">
          Discord
        </Link>
        <Link href="#" className="text-muted-foreground text-sm">
          GitHub
        </Link>
        <Link href="#" className="text-muted-foreground text-sm">
          Documentation
        </Link>
      </div>
    </div>
  );
};

const Col4 = () => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2 items-center">
        <p>Connect</p>
      </div>
      <div className="flex flex-col gap-2">
        <Link href="#" className="text-muted-foreground text-sm">
          Youtube
        </Link>
      </div>
    </div>
  );
};

export default Footer;
