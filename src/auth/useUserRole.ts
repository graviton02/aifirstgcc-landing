"use client";

import {
  createContext,
  createElement,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import { useUser } from "@clerk/nextjs";
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
  const { isLoaded } = useUser();
  const viewerContext = useQuery(api.viewer.getContext);

  return useMemo(
    () => ({
      role: viewerContext?.role ?? null,
      isLoaded: isLoaded && viewerContext !== undefined,
      providerSetupStarted: viewerContext?.providerSetupStarted ?? false,
    }),
    [isLoaded, viewerContext]
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
