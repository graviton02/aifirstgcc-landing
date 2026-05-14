import type { ReactNode } from "react";
import { ClerkOnlyProvider } from "@/components/providers/ClerkOnlyProvider";

export default function SignUpLayout({ children }: { children: ReactNode }) {
  return <ClerkOnlyProvider>{children}</ClerkOnlyProvider>;
}
