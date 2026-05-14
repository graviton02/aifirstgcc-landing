import type { ReactNode } from "react";
import { UserRoleProvider } from "@/auth/useUserRole";
import { AuthDataProvider } from "@/components/providers/AuthDataProvider";

export default function GccDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <AuthDataProvider>
      <UserRoleProvider>{children}</UserRoleProvider>
    </AuthDataProvider>
  );
}
