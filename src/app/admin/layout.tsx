import type { ReactNode } from "react";
import { AuthDataProvider } from "@/components/providers/AuthDataProvider";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <AuthDataProvider>{children}</AuthDataProvider>;
}
