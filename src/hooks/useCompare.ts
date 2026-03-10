"use client";

import { useState, useCallback, useEffect } from "react";

const MAX_COMPARE = 4;
const STORAGE_KEY = "orbys360-compare";

function getStored(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

export function useCompare() {
  const [slugs, setSlugs] = useState<string[]>(getStored);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(slugs));
  }, [slugs]);

  const add = useCallback((slug: string) => {
    setSlugs((prev) => {
      if (prev.includes(slug) || prev.length >= MAX_COMPARE) return prev;
      return [...prev, slug];
    });
  }, []);

  const remove = useCallback((slug: string) => {
    setSlugs((prev) => prev.filter((s) => s !== slug));
  }, []);

  const clear = useCallback(() => setSlugs([]), []);

  const isFull = slugs.length >= MAX_COMPARE;
  const has = useCallback((slug: string) => slugs.includes(slug), [slugs]);

  return { slugs, add, remove, clear, isFull, has, count: slugs.length };
}
