"use client";

import { useAuth } from "@clerk/nextjs";
import Link from "next/link";

interface Props {
  title: string;
  count: number;
  children: React.ReactNode;
}

export function GatedSection({ title, count, children }: Props) {
  const { isSignedIn } = useAuth();

  if (isSignedIn) {
    return (
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-enterprise-900 mb-4">{title}</h2>
        {children}
      </section>
    );
  }

  return (
    <section className="relative mb-8">
      <h2 className="text-xl font-semibold text-enterprise-900 mb-4">
        {title} <span className="text-enterprise-400">({count})</span>
      </h2>
      <div className="relative overflow-hidden max-h-40">
        <div className="blur-sm pointer-events-none select-none" aria-hidden>
          {children}
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white flex items-end justify-center pb-8">
          <Link href="/sign-up" className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark">
            Create a free account to see full details
          </Link>
        </div>
      </div>
    </section>
  );
}
