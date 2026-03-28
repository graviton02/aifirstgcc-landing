"use client";

import { useSyncExternalStore, useCallback } from "react";

const MAX_COMPARE = 4;
const STORAGE_KEY = "orbys360-compare";
const NAMES_KEY = "orbys360-compare-names";

// ── Module-level shared state ───────────────────────────────────
let _slugs: string[] = [];
let _names: Record<string, string> = {};
const _listeners = new Set<() => void>();

interface Snapshot {
  slugs: string[];
  names: Record<string, string>;
  count: number;
  isFull: boolean;
}

let _snapshot: Snapshot = buildSnapshot();

function buildSnapshot(): Snapshot {
  return {
    slugs: [..._slugs],
    names: { ..._names },
    count: _slugs.length,
    isFull: _slugs.length >= MAX_COMPARE,
  };
}

function emit() {
  _snapshot = buildSnapshot();
  persist();
  _listeners.forEach((l) => l());
}

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(_slugs));
    localStorage.setItem(NAMES_KEY, JSON.stringify(_names));
  } catch {
    // localStorage unavailable (SSR, private browsing)
  }
}

function hydrate() {
  try {
    _slugs = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    _names = JSON.parse(localStorage.getItem(NAMES_KEY) || "{}");
    _snapshot = buildSnapshot();
  } catch {
    _slugs = [];
    _names = {};
    _snapshot = buildSnapshot();
  }
}

// Hydrate on module load (client only)
if (typeof window !== "undefined") {
  hydrate();
}

// ── Store API ───────────────────────────────────────────────────

function subscribe(listener: () => void) {
  _listeners.add(listener);
  return () => {
    _listeners.delete(listener);
  };
}

function getSnapshot(): Snapshot {
  return _snapshot;
}

const SERVER_SNAPSHOT: Snapshot = { slugs: [], names: {}, count: 0, isFull: false };
function getServerSnapshot(): Snapshot {
  return SERVER_SNAPSHOT;
}

function add(slug: string, name?: string) {
  if (_slugs.includes(slug) || _slugs.length >= MAX_COMPARE) return;
  _slugs = [..._slugs, slug];
  if (name) {
    _names = { ..._names, [slug]: name };
  }
  emit();
}

function remove(slug: string) {
  _slugs = _slugs.filter((s) => s !== slug);
  const nextNames = { ..._names };
  delete nextNames[slug];
  _names = nextNames;
  emit();
}

function clear() {
  _slugs = [];
  _names = {};
  emit();
}

function replace(slugs: string[], names: Record<string, string> = {}) {
  _slugs = [...new Set(slugs)].slice(0, MAX_COMPARE);
  _names = Object.fromEntries(
    Object.entries(names).filter(([slug]) => _slugs.includes(slug))
  );
  emit();
}

// ── Hook ────────────────────────────────────────────────────────

export function useCompare() {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const has = useCallback(
    (slug: string) => snapshot.slugs.includes(slug),
    [snapshot.slugs]
  );

  return {
    slugs: snapshot.slugs,
    names: snapshot.names,
    count: snapshot.count,
    isFull: snapshot.isFull,
    add,
    remove,
    clear,
    replace,
    has,
  };
}

// ── Test utility ────────────────────────────────────────────────

export function _resetCompareStore() {
  _slugs = [];
  _names = {};
  _snapshot = buildSnapshot();
  _listeners.forEach((l) => l());
}
