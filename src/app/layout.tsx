import type { Metadata } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";

import "./globals.css";

import { Toaster } from "@/components/ui/sonner";

const fontSans = IBM_Plex_Sans({
  subsets: ["latin"],
  variable: "--font-ibm-sans",
  weight: ["400", "500", "600", "700"],
});

const fontMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-ibm-mono",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "MF Ops Tracker",
  description: "Operational command center for mutual fund servicing workflows.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${fontSans.variable} ${fontMono.variable}`}>
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
