"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useUserRole } from "@/auth/useUserRole";
import { usePendingInviteActivation } from "@/hooks/usePendingInviteActivation";

export default function AuthRedirectPage() {
  const { role, isLoaded, providerSetupStarted } = useUserRole();
  const myCompany = useQuery(api.companyMembers.getMyCompany);
  const router = useRouter();
  const { isResolving: isResolvingInvite } = usePendingInviteActivation();

  useEffect(() => {
    if (!isLoaded || isResolvingInvite) return;
    if (role === "gcc") router.replace("/gcc-dashboard");
    else if (role === "provider") {
      if (myCompany === undefined) return;
      router.replace(myCompany ? "/dashboard" : "/provider/setup");
    }
    else if (providerSetupStarted) router.replace("/provider/setup");
    else router.replace("/onboarding");
  }, [role, isLoaded, isResolvingInvite, myCompany, providerSetupStarted, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-enterprise-50">
      <Loader2 className="w-6 h-6 animate-spin text-enterprise-400" />
    </div>
  );
}
