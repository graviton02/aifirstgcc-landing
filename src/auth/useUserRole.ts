"use client";

import {
  createContext,
  createElement,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import { useAuth } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { UserRole } from "./roles";

type UserRoleState = {
  role: UserRole | null;
  isLoaded: boolean;
  providerSetupStarted: boolean;
};

const UserRoleContext = createContext<UserRoleState | null>(null);

function useResolvedUserRole(): UserRoleState {
  const { isLoaded, isSignedIn } = useAuth();
  const viewerContext = useQuery(
    api.viewer.getContext,
    isLoaded && isSignedIn ? {} : "skip"
  );

  return useMemo(
    () => ({
      role: viewerContext?.role ?? null,
      isLoaded: isLoaded && (!isSignedIn || viewerContext !== undefined),
      providerSetupStarted: viewerContext?.providerSetupStarted ?? false,
    }),
    [isLoaded, isSignedIn, viewerContext]
  );
}

export function UserRoleProvider({
  children,
}: {
  children: ReactNode;
}) {
  const value = useResolvedUserRole();

  return createElement(UserRoleContext.Provider, { value }, children);
}

export function useUserRole() {
  const context = useContext(UserRoleContext);
  return context ?? useResolvedUserRole();
}
