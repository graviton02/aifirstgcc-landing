import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { AppPerformanceTracker } from "@/components/analytics/AppPerformanceTracker";
import { LinkedInInsightTag } from "@/components/analytics/LinkedInInsightTag";
import "./globals.css";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://orbys360.com";
const THEME_COLOR = "#2d1650";

export const metadata: Metadata = {
  applicationName: "Orbys360",
  title: "Orbys360 | AI Knowledge Hub for GCCs",
  description: "Discover, compare, and connect with AI agents across industries and functions.",
  metadataBase: new URL(BASE_URL),
  openGraph: {
    type: "website",
    siteName: "Orbys360",
    title: "Orbys360 | AI Knowledge Hub for GCCs",
    description: "Discover, compare, and connect with AI agents across industries and functions.",
    url: BASE_URL,
  },
  twitter: {
    card: "summary",
    title: "Orbys360 | AI Knowledge Hub for GCCs",
    description: "Discover, compare, and connect with AI agents across industries and functions.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: THEME_COLOR,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400;1,500;1,600;1,700;1,800&family=DM+Sans:wght@400;500;600&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,500;1,600;1,700;1,800;1,900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
        <AppPerformanceTracker />
        <LinkedInInsightTag />
      </body>
    </html>
  );
}
