"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "../../../convex/_generated/api";

const INDUSTRIES = [
  "Healthcare & Life Sciences", "Financial Services (BFSI)", "Manufacturing",
  "Automotive & Mobility", "Retail & E-commerce", "Telecom & Media",
  "Energy & Utilities", "Real Estate & Construction", "Logistics & Transportation",
  "Government & Public Sector", "Education", "Agriculture & AgriTech",
  "Aerospace & Defense", "Other",
];

export function GccOnboardingForm() {
  const router = useRouter();
  const { user } = useUser();
  const createProfile = useMutation(api.gccProfiles.createProfile);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: "",
    organization: "",
    email: user?.primaryEmailAddress?.emailAddress ?? "",
    industry: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.organization || !form.email || !form.industry) return;
    setIsSubmitting(true);
    try {
      await createProfile(form);
      await fetch("/api/set-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: "gcc" }),
      });
      // Reload Clerk user so publicMetadata.role is available immediately
      await user?.reload();
      router.push("/gcc-dashboard");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-enterprise-900">Complete Your Profile</h1>
      <p className="text-enterprise-600">Tell us about yourself to get started.</p>

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-enterprise-700 mb-1">Name</label>
        <input id="name" type="text" required value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full px-3 py-2 border border-enterprise-300 rounded-lg focus:ring-2 focus:ring-primary" />
      </div>

      <div>
        <label htmlFor="organization" className="block text-sm font-medium text-enterprise-700 mb-1">Organization</label>
        <input id="organization" type="text" required value={form.organization}
          onChange={(e) => setForm({ ...form, organization: e.target.value })}
          className="w-full px-3 py-2 border border-enterprise-300 rounded-lg focus:ring-2 focus:ring-primary" />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-enterprise-700 mb-1">Email</label>
        <input id="email" type="email" required value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="w-full px-3 py-2 border border-enterprise-300 rounded-lg focus:ring-2 focus:ring-primary" />
      </div>

      <div>
        <label htmlFor="industry" className="block text-sm font-medium text-enterprise-700 mb-1">Industry</label>
        <select id="industry" required value={form.industry}
          onChange={(e) => setForm({ ...form, industry: e.target.value })}
          className="w-full px-3 py-2 border border-enterprise-300 rounded-lg focus:ring-2 focus:ring-primary">
          <option value="">Select your industry</option>
          {INDUSTRIES.map((ind) => (
            <option key={ind} value={ind}>{ind}</option>
          ))}
        </select>
      </div>

      <button type="submit" disabled={isSubmitting}
        className="w-full py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark disabled:opacity-50">
        {isSubmitting ? "Setting up..." : "Get Started"}
      </button>
    </form>
  );
}
