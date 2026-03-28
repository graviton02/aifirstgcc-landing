import { NextResponse } from "next/server";
import { reportError } from "@/lib/report-error";

export async function POST(req: Request) {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const kind = new URL(req.url).searchParams.get("kind") ?? "reported";

  if (kind === "throw") {
    throw new Error("Local dev Sentry unhandled API test");
  }

  reportError(new Error("Local dev Sentry reported API test"), {
    tags: {
      area: "dev",
      feature: "sentry-test",
      route: "/api/dev/sentry-test",
    },
    extra: {
      kind,
    },
  });

  return NextResponse.json(
    { error: "Local dev Sentry reported API test" },
    { status: 500 }
  );
}
