import { getMaintenanceModeStatus } from "@/data-access/website";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // Maintenance mode check
  let maintenance = false;
  const [maintenanceErr, isMaintenance] = await getMaintenanceModeStatus();
  if (maintenanceErr) {
    maintenance = true;
  } else {
    maintenance = isMaintenance ?? false;
  }
  // Allow access to the maintenance page itself to prevent redirect loop
  const isMaintenancePage = request.nextUrl.pathname === "/maintenance";
  if (
    !request.nextUrl.pathname.includes("/dashboard") &&
    !request.nextUrl.pathname.includes("/profile")
  ) {
    if (maintenance && !isMaintenancePage) {
      // Redirect all users to the maintenance page
      const maintenanceUrl = request.nextUrl.clone();
      maintenanceUrl.pathname = "/maintenance";
      return NextResponse.redirect(maintenanceUrl);
    }
  }

  // Your existing header logic
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", request.nextUrl.pathname);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  return response;
}

export const config = {
  matcher: ["/((?!_next/|_static|_image|favicon.ico|api).*)"],
};
