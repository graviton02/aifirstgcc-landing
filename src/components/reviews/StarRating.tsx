"use client";

import { Star } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

export function StarRatingDisplay({
  value,
  size = "sm",
  className,
}: {
  value: number;
  size?: "sm" | "md";
  className?: string;
}) {
  const iconSize = size === "md" ? "h-5 w-5" : "h-4 w-4";
  const rounded = Math.round(value);

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          weight={index < rounded ? "fill" : "regular"}
          className={cn(
            iconSize,
            index < rounded ? "text-amber-500" : "text-enterprise-200"
          )}
        />
      ))}
    </div>
  );
}

export function StarRatingInput({
  label,
  helper,
  value,
  onChange,
}: {
  label: string;
  helper?: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div>
      <p className="text-sm font-medium text-enterprise-800">{label}</p>
      {helper ? (
        <p className="mt-0.5 text-xs text-enterprise-400">{helper}</p>
      ) : null}
      <div className="mt-2 flex items-center gap-1.5">
        {Array.from({ length: 5 }).map((_, index) => {
          const rating = index + 1;
          const active = rating <= value;

          return (
            <button
              key={rating}
              type="button"
              onClick={() => onChange(rating)}
              className="rounded-full p-1 transition-colors hover:bg-amber-50"
              aria-label={`${label}: ${rating} star${rating === 1 ? "" : "s"}`}
            >
              <Star
                weight={active ? "fill" : "regular"}
                className={cn(
                  "h-5 w-5",
                  active ? "text-amber-500" : "text-enterprise-300"
                )}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
