import { notFound } from "next/navigation";
import { SentryTestPanel } from "@/components/dev/SentryTestPanel";

export default function SentryTestPage() {
  if (process.env.NODE_ENV !== "development") {
    notFound();
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-16 text-white">
      <div className="mx-auto max-w-3xl">
        <SentryTestPanel />
      </div>
    </main>
  );
}
