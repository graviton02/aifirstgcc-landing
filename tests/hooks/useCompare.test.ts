import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useCompare, _resetCompareStore } from "@/hooks/useCompare";

describe("useCompare", () => {
  beforeEach(() => {
    localStorage.clear();
    _resetCompareStore();
  });

  it("starts empty", () => {
    const { result } = renderHook(() => useCompare());
    expect(result.current.slugs).toEqual([]);
    expect(result.current.count).toBe(0);
  });

  it("adds an agent", () => {
    const { result } = renderHook(() => useCompare());
    act(() => result.current.add("agent-a", "Agent A"));
    expect(result.current.slugs).toEqual(["agent-a"]);
    expect(result.current.count).toBe(1);
    expect(result.current.names["agent-a"]).toBe("Agent A");
  });

  it("removes an agent", () => {
    const { result } = renderHook(() => useCompare());
    act(() => result.current.add("agent-a", "Agent A"));
    act(() => result.current.remove("agent-a"));
    expect(result.current.slugs).toEqual([]);
    expect(result.current.count).toBe(0);
    expect(result.current.names["agent-a"]).toBeUndefined();
  });

  it("prevents duplicates", () => {
    const { result } = renderHook(() => useCompare());
    act(() => result.current.add("agent-a", "Agent A"));
    act(() => result.current.add("agent-a", "Agent A"));
    expect(result.current.slugs).toEqual(["agent-a"]);
    expect(result.current.count).toBe(1);
  });

  it("limits to 4 agents", () => {
    const { result } = renderHook(() => useCompare());
    act(() => {
      result.current.add("a", "A");
      result.current.add("b", "B");
      result.current.add("c", "C");
      result.current.add("d", "D");
      result.current.add("e", "E");
    });
    expect(result.current.slugs).toEqual(["a", "b", "c", "d"]);
    expect(result.current.isFull).toBe(true);
    expect(result.current.count).toBe(4);
  });

  it("reports isFull correctly", () => {
    const { result } = renderHook(() => useCompare());
    expect(result.current.isFull).toBe(false);
    act(() => {
      result.current.add("a");
      result.current.add("b");
      result.current.add("c");
      result.current.add("d");
    });
    expect(result.current.isFull).toBe(true);
  });

  it("has() checks membership", () => {
    const { result } = renderHook(() => useCompare());
    act(() => result.current.add("agent-a", "Agent A"));
    expect(result.current.has("agent-a")).toBe(true);
    expect(result.current.has("agent-b")).toBe(false);
  });

  it("clear resets all state", () => {
    const { result } = renderHook(() => useCompare());
    act(() => {
      result.current.add("a", "A");
      result.current.add("b", "B");
    });
    act(() => result.current.clear());
    expect(result.current.slugs).toEqual([]);
    expect(result.current.names).toEqual({});
    expect(result.current.count).toBe(0);
    expect(result.current.isFull).toBe(false);
  });

  it("persists to localStorage", () => {
    const { result } = renderHook(() => useCompare());
    act(() => result.current.add("agent-a", "Agent A"));

    const storedSlugs = JSON.parse(localStorage.getItem("orbys360-compare") || "[]");
    const storedNames = JSON.parse(localStorage.getItem("orbys360-compare-names") || "{}");
    expect(storedSlugs).toEqual(["agent-a"]);
    expect(storedNames).toEqual({ "agent-a": "Agent A" });
  });

  it("clear also clears localStorage", () => {
    const { result } = renderHook(() => useCompare());
    act(() => result.current.add("a", "A"));
    act(() => result.current.clear());

    const storedSlugs = JSON.parse(localStorage.getItem("orbys360-compare") || "[]");
    const storedNames = JSON.parse(localStorage.getItem("orbys360-compare-names") || "{}");
    expect(storedSlugs).toEqual([]);
    expect(storedNames).toEqual({});
  });

  it("shares state between multiple hook instances", () => {
    const { result: hook1 } = renderHook(() => useCompare());
    const { result: hook2 } = renderHook(() => useCompare());

    act(() => hook1.current.add("agent-a", "Agent A"));

    // hook2 should see the update
    expect(hook2.current.has("agent-a")).toBe(true);
    expect(hook2.current.count).toBe(1);
  });

  it("clear in one instance resets all instances", () => {
    const { result: hook1 } = renderHook(() => useCompare());
    const { result: hook2 } = renderHook(() => useCompare());

    act(() => {
      hook1.current.add("a", "A");
      hook1.current.add("b", "B");
    });

    // Clear from hook2
    act(() => hook2.current.clear());

    // hook1 should see empty state
    expect(hook1.current.slugs).toEqual([]);
    expect(hook1.current.count).toBe(0);
    expect(hook1.current.has("a")).toBe(false);
  });

  it("remove in one instance updates all instances", () => {
    const { result: hook1 } = renderHook(() => useCompare());
    const { result: hook2 } = renderHook(() => useCompare());

    act(() => {
      hook1.current.add("a", "A");
      hook1.current.add("b", "B");
    });

    // Remove from hook2
    act(() => hook2.current.remove("a"));

    // hook1 should only have "b"
    expect(hook1.current.slugs).toEqual(["b"]);
    expect(hook1.current.has("a")).toBe(false);
  });
});
