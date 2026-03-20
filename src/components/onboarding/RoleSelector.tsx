"use client";

import { Search, Upload } from "lucide-react";

interface RoleSelectorProps {
  onSelect: (role: "gcc" | "provider") => void;
  errorMessage?: string;
}

export function RoleSelector({ onSelect, errorMessage }: RoleSelectorProps) {
  return (
    <div className="space-y-6 max-w-lg mx-auto">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-enterprise-900">Welcome to Orbys360</h1>
        <p className="text-enterprise-600 mt-2">How will you be using the platform?</p>
      </div>

      <div className="grid gap-4">
        <button
          onClick={() => onSelect("gcc")}
          className="group p-6 border-2 border-enterprise-200 rounded-xl text-left hover:border-primary hover:bg-primary/5 transition-all"
        >
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-blue-200 transition-colors">
              <Search className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="font-semibold text-enterprise-900 mb-1">
                I&apos;m looking for AI agents
              </h2>
              <p className="text-sm text-enterprise-500">
                Discover, compare, and shortlist AI agents for your organization.
              </p>
            </div>
          </div>
        </button>

        <button
          onClick={() => onSelect("provider")}
          className="group p-6 border-2 border-enterprise-200 rounded-xl text-left hover:border-primary hover:bg-primary/5 transition-all"
        >
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-purple-200 transition-colors">
              <Upload className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h2 className="font-semibold text-enterprise-900 mb-1">
                I&apos;m listing AI agents &amp; services
              </h2>
              <p className="text-sm text-enterprise-500">
                Manage your company profile and showcase your AI agents to GCC buyers.
              </p>
            </div>
          </div>
        </button>
      </div>

      {errorMessage && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </p>
      )}
    </div>
  );
}
