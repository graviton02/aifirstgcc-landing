import { describe, expect, it } from "vitest";

/**
 * Guards the patch-package patch in patches/next+16.2.2.patch.
 *
 * Upstream, next/dist/client/asset-prefix.js throws InvariantError E783 when
 * document.currentScript is not a <script> element. That call is the first
 * statement of appBootstrap(), so the throw aborts before hydrate() ever runs
 * and the whole app stays inert. Some Android browsers (observed: Samsung
 * Internet 23, Chrome WebView 120) hit this on production, which killed the
 * /jobs signup form for those visitors.
 *
 * The patch makes it fall back to "" — the correct asset prefix for this app,
 * which sets none in next.config.ts — instead of throwing.
 *
 * If this test fails, the patch was lost (a npm install without postinstall,
 * or a Next upgrade that moved the file). Do not delete it; re-apply the patch.
 */
describe("next getAssetPrefix patch", () => {
  it("falls back to an empty prefix instead of throwing when currentScript is null", async () => {
    // jsdom leaves document.currentScript null outside of script execution,
    // which is exactly the state that triggers the upstream invariant.
    expect(document.currentScript).toBeNull();

    const { getAssetPrefix } = await import("next/dist/client/asset-prefix");

    expect(() => getAssetPrefix()).not.toThrow();
    expect(getAssetPrefix()).toBe("");
  });

  it("still derives the prefix from a real script element", async () => {
    const script = document.createElement("script");
    script.src = "https://cdn.example.com/assets/_next/static/chunks/main.js";
    document.head.appendChild(script);

    Object.defineProperty(document, "currentScript", {
      value: script,
      configurable: true,
    });

    try {
      const { getAssetPrefix } = await import("next/dist/client/asset-prefix");
      expect(getAssetPrefix()).toBe("/assets");
    } finally {
      Object.defineProperty(document, "currentScript", {
        value: null,
        configurable: true,
      });
      script.remove();
    }
  });
});
