"use client";

import { useState } from "react";
import type { Company } from "@/lib/types";

interface CompanyLogoProps {
  company?: Company;
  size?: "sm" | "md";
}

export function CompanyLogo({ company, size = "sm" }: CompanyLogoProps) {
  const [imgError, setImgError] = useState(false);

  const sizeClasses =
    size === "md" ? "w-14 h-14 text-lg" : "w-[57px] h-[57px] text-base";

  const name = company?.name || "Unknown";
  const logoUrl = company?.logo_url;

  if (logoUrl && !imgError) {
    return (
      <div
        className={`${sizeClasses} rounded-lg bg-white border border-enterprise-100 flex items-center justify-center shrink-0 overflow-hidden`}
      >
        <img
          src={logoUrl}
          alt={name}
          className="w-full h-full object-contain p-0.5"
          onError={() => setImgError(true)}
        />
      </div>
    );
  }

  // Initials fallback
  const initials = name
    .split(/[\s.]+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <div
      className={`${sizeClasses} rounded-lg bg-enterprise-900 text-white flex items-center justify-center font-semibold shrink-0`}
    >
      {initials}
    </div>
  );
}
