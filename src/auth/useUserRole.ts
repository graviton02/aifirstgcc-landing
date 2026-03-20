import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

type Role = "gcc" | "provider" | null;

export function useUserRole() {
  const { user, isLoaded } = useUser();
  const company = useQuery(api.companyMembers.getMyCompany);
  const gccProfile = useQuery(api.gccProfiles.getProfile);
  const providerProfile = useQuery(api.providerProfiles.getMine);

  const metadataRole =
    isLoaded && user
      ? ((user.publicMetadata.role as "gcc" | "provider" | undefined) ?? null)
      : null;

  let role: Role = null;
  if (metadataRole) {
    role = metadataRole;
  } else if (company) {
    role = "provider";
  } else if (providerProfile) {
    role = "provider";
  } else if (gccProfile) {
    role = "gcc";
  }

  const roleLoaded =
    !isLoaded
      ? false
      : company !== undefined && gccProfile !== undefined && providerProfile !== undefined;

  return { role, isLoaded: roleLoaded };
}
