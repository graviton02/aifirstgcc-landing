"use client";

import { Loader2 } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/sections/Footer";

export default function ProblemsPage() {
  const problems = useQuery(api.gcc.getApprovedProblems, {});

  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-8 pt-24">
        <h1 className="text-3xl font-bold text-enterprise-900 mb-4">Problem Statements</h1>
        <p className="text-enterprise-600 mb-8">
          Browse open problem statements from GCC leaders looking for AI solutions.
        </p>

        {problems === undefined ? (
          <div className="flex items-center gap-2 text-enterprise-500"><Loader2 className="w-4 h-4 animate-spin" /> Loading...</div>
        ) : !problems.length ? (
          <p className="text-enterprise-500 text-center py-12">No problem statements published yet.</p>
        ) : (
          <div className="space-y-4">
            {problems.map((problem: any) => (
              <div key={problem._id} className="p-6 bg-white border border-enterprise-200 rounded-xl">
                <h3 className="font-semibold text-enterprise-900 text-lg">{problem.title}</h3>
                <p className="text-enterprise-600 mt-2">{problem.description}</p>
                <div className="flex gap-3 mt-3 text-sm text-enterprise-500">
                  {problem.industry && <span>{problem.industry}</span>}
                  {problem.budget_range && <span>{problem.budget_range}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
