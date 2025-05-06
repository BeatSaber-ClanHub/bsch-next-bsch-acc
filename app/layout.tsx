import type { Metadata } from "next";
import { Blinker } from "next/font/google";
import "./globals.css";

import Footer from "@/components/custom/general-website/footer";
import Navigation from "@/components/custom/general-website/navigation/ssr-navigation";
import TanstackQueryProvider from "@/components/providers/tanstack-query-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Inter, Orbitron } from "next/font/google";
import { headers } from "next/headers";

const blinker = Blinker({
  variable: "--font-blinker",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

// Define the main font
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

// Define a display font for headings
const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-orbitron",
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "BeatSaber Clan Hub",
  description: "Share your BeatSaber clans!",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${orbitron.variable} font-sans antialiased`}
      >
        <TanstackQueryProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <TooltipProvider>
              <div className="relative min-h-screen flex flex-col">
                <div className="sticky top-0 left-0 w-full z-50">
                  <Navigation />
                </div>
                <div className="flex-1 w-full">
                  {children}
                  <Toaster />
                </div>
                <Footer />
              </div>
            </TooltipProvider>
          </ThemeProvider>
        </TanstackQueryProvider>
      </body>
    </html>
  );
}
