"use client";

import { useState } from "react";
import type { Company } from "@/lib/types";

interface CompanyLogoProps {
  company?: Pick<Company, "name" | "logo_url" | "logo_bg"> | null;
  size?: "xs" | "sm" | "md" | "lg";
}

export function CompanyLogo({ company, size = "sm" }: CompanyLogoProps) {
  const [imgError, setImgError] = useState(false);

  const sizeClasses = {
    xs: "w-5 h-5 text-[8px]",
    lg: "w-16 h-16 text-xl",
    md: "w-14 h-14 text-lg",
    sm: "w-[57px] h-[57px] text-base",
  }[size];

  const name = company?.name || "Unknown";
  const logoUrl = company?.logo_url;
  const logoBg = company?.logo_bg;

  if (logoUrl && !imgError) {
    const bgClass = logoBg === "dark"
      ? "bg-enterprise-900 border-enterprise-800"
      : "bg-white border-enterprise-100";
    return (
      <div
        className={`${sizeClasses} rounded-lg ${bgClass} border flex items-center justify-center shrink-0 overflow-hidden`}
      >
        <img
          src={logoUrl}
          alt={name}
          className="w-full h-full object-contain p-1"
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
