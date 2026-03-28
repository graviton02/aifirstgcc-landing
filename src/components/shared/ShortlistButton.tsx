"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { BookmarkSimple, Check } from "@phosphor-icons/react";
import { api } from "../../../convex/_generated/api";
import { useUserRole } from "@/auth/useUserRole";

type Variant = "hero" | "card";

const VARIANT_STYLES: Record<Variant, { active: string; idle: string }> = {
  hero: {
    active: "bg-primary/10 text-primary border border-primary/20 hover:bg-primary/15",
    idle: "bg-enterprise-100 text-enterprise-600 border border-enterprise-200/60 hover:bg-enterprise-150 hover:text-enterprise-700",
  },
  card: {
    active: "bg-primary/10 text-primary border border-primary/20",
    idle: "bg-enterprise-50 text-enterprise-400 border border-enterprise-200/60 opacity-0 group-hover:opacity-100 hover:text-enterprise-600 hover:border-enterprise-300",
  },
};

export function ShortlistButton({
  agentId,
  variant = "hero",
  className = "",
}: {
  agentId: string;
  variant?: Variant;
  className?: string;
}) {
  const { isSignedIn } = useAuth();
  const { role, isLoaded } = useUserRole();
  const isShortlisted = useQuery(
    api.shortlists.isShortlisted,
    isSignedIn ? { agent_id: agentId as any } : "skip"
  );
  const addToShortlist = useMutation(api.shortlists.add);
  const removeFromShortlist = useMutation(api.shortlists.remove);
  const [isSaving, setIsSaving] = useState(false);

  if (isLoaded && role === "provider") {
    return null;
  }

  const handleClick = async () => {
    if (!isSignedIn) {
      const redirectPath = typeof window !== "undefined" ? window.location.pathname : "/";
      window.location.href = `/sign-in?redirect_url=${encodeURIComponent(redirectPath)}`;
      return;
    }

    setIsSaving(true);
    try {
      if (isShortlisted) {
        await removeFromShortlist({ agent_id: agentId as any });
      } else {
        await addToShortlist({ agent_id: agentId as any });
      }
    } finally {
      setIsSaving(false);
    }
  };

  const styles = isShortlisted
    ? VARIANT_STYLES[variant].active
    : VARIANT_STYLES[variant].idle;
  const disabled = isSaving || (isSignedIn && isShortlisted === undefined);
  const label = !isSignedIn ? "Shortlist" : isShortlisted ? "Shortlisted" : "Shortlist";

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      className={`inline-flex items-center gap-2 rounded-xl text-sm font-medium transition-all duration-200 disabled:cursor-wait disabled:opacity-60 ${styles} ${className}`}
    >
      {isShortlisted ? (
        <Check weight="bold" className={variant === "card" ? "w-3 h-3" : "w-4 h-4"} />
      ) : (
        <BookmarkSimple weight="duotone" className={variant === "card" ? "w-3 h-3" : "w-4 h-4"} />
      )}
      <span>{label}</span>
    </button>
  );
}
