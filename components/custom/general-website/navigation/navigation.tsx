"use client";

import BSCH_DesktopNavigation from "@/components/custom/general-website/navigation/desktop-navigation";
import MobileNavigationMenu from "@/components/custom/general-website/navigation/mobile-navigation";
import { useIsMobile } from "@/hooks/use-mobile";
import { auth } from "@/lib/auth";

type Session = typeof auth.$Infer.Session;

export function BSCH_NavigationMenu({ session }: { session: Session }) {
  const isMobile = useIsMobile();

  if (!isMobile) return <BSCH_DesktopNavigation session={session} />;
  return <MobileNavigationMenu session={session} />;
}
