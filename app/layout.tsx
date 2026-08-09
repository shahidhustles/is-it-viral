import type { Metadata } from "next";
import "./globals.css";
import { Fraunces, Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import { ClerkProvider } from "@clerk/nextjs";

import { ConvexClientProvider } from "@/components/convex-client-provider";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });
const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  style: ["italic"],
});

export const metadata: Metadata = {
  title: "Is It Viral",
  description: "Simulation-backed audience-fit guidance for Instagram reels.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={cn(geist.variable, fraunces.variable, "font-sans")}>
      <ClerkProvider signInForceRedirectUrl="/post-sign-in" signInUrl="/sign-in" signUpForceRedirectUrl="/onboarding" signUpUrl="/sign-up">
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        <ConvexClientProvider>{children}</ConvexClientProvider>
      </body>
      </ClerkProvider>
    </html>
  );
}
