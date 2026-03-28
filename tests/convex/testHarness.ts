/// <reference types="vite/client" />

import { convexTest } from "convex-test";
import schema from "../../convex/schema";

const convexModules = import.meta.glob("../../convex/**/*.{ts,tsx}");

export function createTestConvex() {
  return convexTest({
    schema,
    modules: convexModules,
  });
}
