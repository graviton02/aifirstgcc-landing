"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Loader2 } from "lucide-react";
import { useUserRole } from "@/auth/useUserRole";
import { GccOnboardingForm } from "@/components/onboarding/GccOnboardingForm";
import { RoleSelector } from "@/components/onboarding/RoleSelector";
import { usePendingInviteActivation } from "@/hooks/usePendingInviteActivation";
import { getErrorMessage } from "@/lib/report-error";

export default function OnboardingPage() {
  const { isSignedIn, isLoaded: authLoaded } = useAuth();
  const { role, isLoaded, providerSetupStarted } = useUserRole();
  const { user } = useUser();
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<"gcc" | "provider" | null>(null);
  const [settingRole, setSettingRole] = useState(false);
  const [providerError, setProviderError] = useState("");
  const myCompany = useQuery(api.companyMembers.getMyCompany);
  const ensureProvider = useMutation(api.providerProfiles.ensureProvider);
  const { isResolving: isResolvingInvite, error: inviteActivationError } = usePendingInviteActivation();

  // Redirect unauthenticated users to sign-in
  useEffect(() => {
    if (!authLoaded) return;
    if (!isSignedIn) {
      router.replace("/sign-in");
    }
  }, [authLoaded, isSignedIn, router]);

  // If user already has a role, redirect to their dashboard
  useEffect(() => {
    if (!isLoaded || isResolvingInvite) return;
    if (role === "gcc") router.replace("/gcc-dashboard");
    if (role === "provider") {
      if (myCompany === undefined) return;
      router.replace(myCompany ? "/dashboard" : "/provider/setup");
      return;
    }
    if (providerSetupStarted) router.replace("/provider/setup");
  }, [role, isLoaded, isResolvingInvite, myCompany, providerSetupStarted, router]);

  const handleRoleSelect = async (selected: "gcc" | "provider") => {
    if (selected === "gcc") {
      setSelectedRole("gcc");
      return;
    }

    setSettingRole(true);
    setProviderError("");
    try {
      await ensureProvider();
      await fetch("/api/set-role", {
        method: "POST",
      }).catch(() => null);
      await user?.reload();
      router.push("/provider/setup");
    } catch (error) {
      setProviderError(
        getErrorMessage(error, "We couldn't start provider setup. Please try again.")
      );
    } finally {
      setSettingRole(false);
    }
  };

  if (!isLoaded || isResolvingInvite || role) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-enterprise-50">
        <Loader2 className="w-6 h-6 animate-spin text-enterprise-400" />
      </div>
    );
  }

  if (settingRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-enterprise-50">
        <div className="text-center">
          <Loader2 className="w-6 h-6 animate-spin text-enterprise-400 mx-auto mb-3" />
          <p className="text-sm text-enterprise-500">Setting up your account...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-enterprise-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-card p-8 w-full max-w-lg">
        {selectedRole === "gcc" ? (
          <GccOnboardingForm />
        ) : (
          <RoleSelector onSelect={handleRoleSelect} errorMessage={providerError || inviteActivationError} />
        )}
      </div>
    </div>
  );
}
