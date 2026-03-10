"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Loader2, CheckCircle } from "lucide-react";

export function ProfileTab() {
  const myCompany = useQuery(api.companyMembers.getMyCompany);
  const createEdit = useMutation(api.companyEdits.create);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ description: "", website: "" });
  const [submitted, setSubmitted] = useState(false);

  if (myCompany === undefined) {
    return <div className="flex items-center gap-2 text-enterprise-500"><Loader2 className="w-4 h-4 animate-spin" /> Loading...</div>;
  }

  if (!myCompany) {
    return <p className="text-enterprise-500">No company profile found. Complete the claim process first.</p>;
  }

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    const changes: Record<string, string> = {};
    if (form.description && form.description !== myCompany.description) changes.description = form.description;
    if (form.website && form.website !== myCompany.website) changes.website = form.website;
    if (Object.keys(changes).length === 0) return;

    await createEdit({ company_id: myCompany._id, changes });
    setEditing(false);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div>
      <div className="p-6 bg-white border border-enterprise-200 rounded-xl">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-enterprise-900">{myCompany.name}</h3>
            {myCompany.headquarters && <p className="text-sm text-enterprise-500">{myCompany.headquarters}</p>}
          </div>
          <button
            onClick={() => { setEditing(!editing); setForm({ description: myCompany.description || "", website: myCompany.website || "" }); }}
            className="px-3 py-1.5 text-sm border border-enterprise-300 rounded-lg hover:bg-enterprise-50"
          >
            {editing ? "Cancel" : "Edit"}
          </button>
        </div>

        {editing ? (
          <form onSubmit={handleSubmitEdit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-enterprise-700 mb-1">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-enterprise-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-enterprise-700 mb-1">Website</label>
              <input
                type="url"
                value={form.website}
                onChange={(e) => setForm({ ...form, website: e.target.value })}
                className="w-full px-3 py-2 border border-enterprise-300 rounded-lg"
              />
            </div>
            <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium">
              Submit Changes for Review
            </button>
          </form>
        ) : (
          <>
            <p className="text-enterprise-700 mb-2">{myCompany.description || "No description set."}</p>
            {myCompany.website && <a href={myCompany.website} target="_blank" rel="noopener noreferrer" className="text-primary text-sm hover:underline">{myCompany.website}</a>}
          </>
        )}
      </div>

      {submitted && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700">
          <CheckCircle className="w-4 h-4" />
          <span className="text-sm">Edit submitted for admin review.</span>
        </div>
      )}
    </div>
  );
}
