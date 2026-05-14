import type { ReactNode } from "react";
import { AuthDataProvider } from "@/components/providers/AuthDataProvider";

export default function AgentsLayout({ children }: { children: ReactNode }) {
  return <AuthDataProvider>{children}</AuthDataProvider>;
}
