"use client";

import { useState } from "react";
import { Loader2, Lightbulb, Plus } from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";

export function ProblemHubTab() {
  const myProblems = useQuery(api.gcc.getMyProblems);
  const submitProblem = useMutation(api.gcc.submitProblem);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", industry: "", budget_range: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.description) return;
    setIsSubmitting(true);
    try {
      await submitProblem(form);
      setForm({ title: "", description: "", industry: "", budget_range: "" });
      setShowForm(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (myProblems === undefined) {
    return <div className="flex items-center gap-2 text-enterprise-500"><Loader2 className="w-4 h-4 animate-spin" /> Loading...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-enterprise-900">Your Problem Statements</h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark"
        >
          <Plus className="w-4 h-4" />
          Submit Problem
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="p-4 bg-enterprise-50 rounded-xl mb-6 space-y-4">
          <input
            type="text"
            placeholder="Problem title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
            className="w-full px-3 py-2 border border-enterprise-300 rounded-lg"
          />
          <textarea
            placeholder="Describe the problem..."
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            required
            rows={3}
            className="w-full px-3 py-2 border border-enterprise-300 rounded-lg"
          />
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Industry (optional)"
              value={form.industry}
              onChange={(e) => setForm({ ...form, industry: e.target.value })}
              className="flex-1 px-3 py-2 border border-enterprise-300 rounded-lg"
            />
            <input
              type="text"
              placeholder="Budget range (optional)"
              value={form.budget_range}
              onChange={(e) => setForm({ ...form, budget_range: e.target.value })}
              className="flex-1 px-3 py-2 border border-enterprise-300 rounded-lg"
            />
          </div>
          <button type="submit" disabled={isSubmitting}
            className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium disabled:opacity-50">
            {isSubmitting ? "Submitting..." : "Submit"}
          </button>
        </form>
      )}

      {!myProblems.length ? (
        <div className="text-center py-12 text-enterprise-500">
          <Lightbulb className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No problem statements yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {myProblems.map((problem: any) => (
            <div key={problem._id} className="p-4 bg-white border border-enterprise-200 rounded-xl">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-enterprise-900">{problem.title}</h4>
                <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                  problem.status === "approved" ? "bg-green-100 text-green-700" :
                  problem.status === "rejected" ? "bg-red-100 text-red-700" :
                  "bg-amber-100 text-amber-700"
                }`}>
                  {problem.status}
                </span>
              </div>
              <p className="text-sm text-enterprise-600 mt-2 line-clamp-2">{problem.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
