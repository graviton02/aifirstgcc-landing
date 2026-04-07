import { describe, expect, it } from "vitest";
import { dailyShuffle, getUtcDayKey } from "@/lib/directoryShuffle";

describe("directoryShuffle", () => {
  it("builds a UTC day key from a date", () => {
    expect(getUtcDayKey(new Date("2026-04-02T13:45:00Z"))).toBe("2026-04-02");
  });

  it("returns a deterministic order for the same day key", () => {
    const items = ["a", "b", "c", "d", "e", "f"];

    expect(dailyShuffle(items, "2026-04-02")).toEqual([
      "c",
      "b",
      "e",
      "a",
      "d",
      "f",
    ]);
    expect(dailyShuffle(items, "2026-04-02")).toEqual([
      "c",
      "b",
      "e",
      "a",
      "d",
      "f",
    ]);
  });

  it("changes the deterministic order across day keys", () => {
    const items = ["a", "b", "c", "d", "e", "f"];

    expect(dailyShuffle(items, "2026-04-03")).toEqual([
      "f",
      "e",
      "d",
      "b",
      "a",
      "c",
    ]);
  });
});
