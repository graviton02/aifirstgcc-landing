"use client";

import { useMemo } from "react";
import { useAuth } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export function useJobBoardRole() {
  const { isLoaded: authLoaded, isSignedIn } = useAuth();
  const profile = useQuery(api.jobProfiles.getMyProfile, isSignedIn ? {} : "skip");

  return useMemo(
    () => ({
      profile: profile ?? null,
      role: profile?.role ?? null,
      isLoaded: authLoaded && (!isSignedIn || profile !== undefined),
      isSignedIn,
    }),
    [authLoaded, isSignedIn, profile]
  );
}
