"use client";

import Link from "next/link";

import LoginButton from "@/components/custom/general-website/navigation/login-button";
import AccountDropdown from "@/components/custom/general-website/navigation/user-account-dropdown";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { auth } from "@/lib/auth";
import BSCHLogo from "../bsch-logo";

type Session = typeof auth.$Infer.Session;

const BSCH_DesktopNavigation = ({ session }: { session: Session }) => {
  return (
    <div className="flex justify-between p-4 pb-3 bg-background/30 backdrop-blur-md border-b-[1px]">
      {" "}
      <BSCHLogo />
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <Link href="/" legacyBehavior passHref>
              <NavigationMenuLink
                className={navigationMenuTriggerStyle({
                  className: "bg-transparent",
                })}
              >
                Home
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Link href="/clans" legacyBehavior passHref>
              <NavigationMenuLink
                className={navigationMenuTriggerStyle({
                  className: "bg-transparent",
                })}
              >
                Clans
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Link href="/docs" legacyBehavior passHref>
              <NavigationMenuLink
                className={navigationMenuTriggerStyle({
                  className: "bg-transparent",
                })}
              >
                Docs
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Link href="/" legacyBehavior passHref>
              <NavigationMenuLink
                className={navigationMenuTriggerStyle({
                  className: "bg-transparent",
                })}
              >
                Discord
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
      {session && <AccountDropdown session={session} />}
      {!session && <LoginButton />}
    </div>
  );
};

export default BSCH_DesktopNavigation;
