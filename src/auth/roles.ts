export const USER_ROLES = ["gcc", "provider"] as const;

export type UserRole = (typeof USER_ROLES)[number];

type RoleEligibilityInput = {
  hasGccProfile: boolean;
  hasProviderAccess: boolean;
};

type RoleResolutionInput = RoleEligibilityInput & {
  metadataRole: UserRole | null;
};

export function getAuthoritativeRole({
  hasGccProfile,
  hasProviderAccess,
}: RoleEligibilityInput): UserRole | null {
  if (hasProviderAccess) {
    return "provider";
  }

  if (hasGccProfile) {
    return "gcc";
  }

  return null;
}

export function resolveUserRole({
  hasGccProfile,
  hasProviderAccess,
}: RoleResolutionInput): UserRole | null {
  return getAuthoritativeRole({
    hasGccProfile,
    hasProviderAccess,
  });
}

export function canSelectRole(
  role: UserRole,
  eligibility: RoleEligibilityInput
) {
  return role === "provider" ? eligibility.hasProviderAccess : eligibility.hasGccProfile;
}
