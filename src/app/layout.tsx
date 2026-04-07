import type { Metadata, Viewport } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ConvexClientProvider } from "@/components/providers/ConvexClientProvider";
import { UserRoleProvider } from "@/auth/useUserRole";
import { AppPerformanceTracker } from "@/components/analytics/AppPerformanceTracker";
import "./globals.css";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://orbys360.com";
const THEME_COLOR = "#2d1650";

export const metadata: Metadata = {
  applicationName: "Orbys360",
  title: "Orbys360 | The AI-First GCC Platform",
  description: "Discover, compare, and connect with AI agents across industries and functions.",
  metadataBase: new URL(BASE_URL),
  openGraph: {
    type: "website",
    siteName: "Orbys360",
    title: "Orbys360 | The AI-First GCC Platform",
    description: "Discover, compare, and connect with AI agents across industries and functions.",
    url: BASE_URL,
  },
  twitter: {
    card: "summary",
    title: "Orbys360 | The AI-First GCC Platform",
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
    <ClerkProvider signInUrl="/sign-in" signUpUrl="/sign-up" appearance={{ baseTheme: undefined }}>
      <html lang="en" data-scroll-behavior="smooth">
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link
            href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&family=DM+Sans:wght@400;500;600&family=Playfair+Display:wght@400;500;600;700;800;900&display=swap"
            rel="stylesheet"
          />
        </head>
        <body>
          <ConvexClientProvider>
            <UserRoleProvider>
              {children}
            </UserRoleProvider>
            <Analytics />
            <SpeedInsights />
            <AppPerformanceTracker />
          </ConvexClientProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
