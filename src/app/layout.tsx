import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Orbys360 | The AI-First GCC Platform",
  description: "Discover, compare, and connect with 1000+ AI agents across industries and functions.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
