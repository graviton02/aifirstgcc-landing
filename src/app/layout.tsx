import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { ConvexClientProvider } from "@/components/providers/ConvexClientProvider";
import "./globals.css";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://orbys360.com";

export const metadata: Metadata = {
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
            {children}
          </ConvexClientProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
