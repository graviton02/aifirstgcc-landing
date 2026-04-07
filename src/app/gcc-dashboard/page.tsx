"use client";

import { Suspense, useEffect, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useAuth, useUser } from "@clerk/nextjs";
import { Building2, Star, MessageCircle, Loader2, SquarePen } from "lucide-react";
import { useQuery } from "convex/react";
import { useUserRole } from "@/auth/useUserRole";
import { api } from "../../../convex/_generated/api";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { ProfileTab } from "@/components/gcc-dashboard/ProfileTab";
import { ShortlistedAgentsTab } from "@/components/gcc-dashboard/ShortlistedAgentsTab";
import { CurrentRequestsTab } from "@/components/gcc-dashboard/CurrentRequestsTab";
import { MyReviewsTab } from "@/components/gcc-dashboard/MyReviewsTab";

const DEFAULT_TAB = "shortlisted-agents" as const;
const TABS = ["shortlisted-agents", "current-requests", "my-reviews", "profile"] as const;
type GccTab = (typeof TABS)[number];

const NAV_ITEMS = [
  { key: "shortlisted-agents", label: "Shortlisted Agents", icon: Star },
  { key: "current-requests", label: "Current Requests", icon: MessageCircle },
  { key: "my-reviews", label: "My Reviews", icon: SquarePen },
  { key: "profile", label: "Profile", icon: Building2 },
];

export default function GCCDashboardPage() {
  return (
    <Suspense fallback={<DashboardPageFallback />}>
      <GCCDashboardContent />
    </Suspense>
  );
}

function GCCDashboardContent() {
  const { isSignedIn, isLoaded: authLoaded } = useAuth();
  const { user } = useUser();
  const { role, isLoaded, providerSetupStarted } = useUserRole();
  const gccProfile = useQuery(api.gccProfiles.getProfile, isSignedIn ? {} : "skip");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeTab = useMemo<GccTab>(() => {
    const requestedTab = searchParams.get("tab");
    return TABS.includes(requestedTab as GccTab)
      ? (requestedTab as GccTab)
      : DEFAULT_TAB;
  }, [searchParams]);

  useEffect(() => {
    if (!authLoaded) return;
    if (!isSignedIn) {
      router.replace("/sign-in");
      return;
    }
  }, [authLoaded, isSignedIn, router]);

  useEffect(() => {
    if (!isLoaded) return;
    if (role === "provider") router.replace("/dashboard");
    if (!role) router.replace(providerSetupStarted ? "/provider/setup" : "/onboarding");
  }, [role, isLoaded, providerSetupStarted, router]);

  const handleNavigate = (key: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", key);
    router.replace(`${pathname}?${params.toString()}`);
  };

  if (!isLoaded || role !== "gcc") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-enterprise-400" />
      </div>
    );
  }

  const displayName =
    gccProfile?.name ||
    user?.firstName ||
    user?.fullName ||
    user?.primaryEmailAddress?.emailAddress ||
    "User";

  const brand = {
    name: displayName,
    fallbackInitial: displayName.charAt(0).toUpperCase(),
  };

  return (
    <DashboardShell
      title="GCC Dashboard"
      navItems={NAV_ITEMS}
      activeKey={activeTab}
      onNavigate={handleNavigate}
      brand={brand}
      sidebarTheme="dark"
    >
      {activeTab === "shortlisted-agents" && <ShortlistedAgentsTab />}
      {activeTab === "current-requests" && <CurrentRequestsTab />}
      {activeTab === "my-reviews" && <MyReviewsTab />}
      {activeTab === "profile" && <ProfileTab />}
    </DashboardShell>
  );
}

function DashboardPageFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-enterprise-400" />
    </div>
  );
}
