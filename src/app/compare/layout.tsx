import type { ReactNode } from "react";
import { AuthDataProvider } from "@/components/providers/AuthDataProvider";

export default function CompareLayout({ children }: { children: ReactNode }) {
  return <AuthDataProvider>{children}</AuthDataProvider>;
}
