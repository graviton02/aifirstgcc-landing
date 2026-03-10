"use client";

import { Search } from "lucide-react";

interface Props {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
}

export function SearchBar({ value, onChange, onSubmit }: Props) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="w-full"
    >
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-enterprise-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search agents by name, category, or industry..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full pl-12 pr-4 py-3 rounded-xl border border-enterprise-200 bg-white text-enterprise-900 placeholder:text-enterprise-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent shadow-sm"
        />
      </div>
    </form>
  );
}
