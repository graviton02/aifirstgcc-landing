"use client";

import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import {
  AlertCircle,
  CheckCircle,
  Globe,
  MapPin,
  Pencil,
} from "lucide-react";
import { api } from "../../../convex/_generated/api";
import { CompanyLogo } from "@/components/directory/CompanyLogo";
import {
  uploadFileToConvexStorage,
  validateCompanyLogoFile,
} from "@/lib/companyLogoUpload";
import { getErrorMessage } from "@/lib/report-error";

export function ProfileTab() {
  const myCompany = useQuery(api.companyMembers.getMyCompany);
  const createEdit = useMutation(api.companyEdits.create);
  const generateUploadUrl = useMutation(api.storage.generateUploadUrl);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    description: "",
    website: "",
    logo_storage_id: "",
    logo_url: "",
    logo_bg: "" as "" | "dark",
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState("");
  const logoPreviewUrlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (logoPreviewUrlRef.current) {
        URL.revokeObjectURL(logoPreviewUrlRef.current);
      }
    };
  }, []);

  if (myCompany === undefined) {
    return <ProfileSkeleton />;
  }

  if (!myCompany) {
    return (
      <p className="text-enterprise-500">
        No company profile found. Complete the claim process first.
      </p>
    );
  }

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    try {
      const payload: Record<string, string | undefined> = {};

      if (form.description && form.description !== myCompany.description) {
        payload.description = form.description;
      }
      if (form.website && form.website !== myCompany.website) {
        payload.website = form.website;
      }

      if (logoFile) {
        payload.logo_storage_id = await uploadFileToConvexStorage(
          logoFile,
          generateUploadUrl
        );
      }

      const currentLogoBg = myCompany.logo_bg === "dark" ? "dark" : "";
      if (
        (logoFile || myCompany.logo_url || myCompany.logo_storage_id) &&
        form.logo_bg !== currentLogoBg
      ) {
        payload.logo_bg = form.logo_bg || undefined;
      }

      if (Object.keys(payload).length === 0) return;

      await createEdit({ company_id: myCompany._id, payload });
      setEditing(false);
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
    } catch (error: any) {
      setFormError(
        getErrorMessage(error, "We couldn't submit your company update.")
      );
    }
  };

  const startEditing = () => {
    if (logoPreviewUrlRef.current) {
      URL.revokeObjectURL(logoPreviewUrlRef.current);
      logoPreviewUrlRef.current = null;
    }
    setLogoFile(null);
    setFormError("");
    setForm({
      description: myCompany.description || "",
      website: myCompany.website || "",
      logo_storage_id: myCompany.logo_storage_id || "",
      logo_url: myCompany.logo_url || "",
      logo_bg: myCompany.logo_bg === "dark" ? "dark" : "",
    });
    setEditing(true);
  };

  const handleLogoFileChange = (file: File | null) => {
    if (!file) return;

    const validationError = validateCompanyLogoFile(file);
    if (validationError) {
      setFormError(validationError);
      return;
    }

    if (logoPreviewUrlRef.current) {
      URL.revokeObjectURL(logoPreviewUrlRef.current);
    }

    const previewUrl = URL.createObjectURL(file);
    logoPreviewUrlRef.current = previewUrl;
    setLogoFile(file);
    setForm((current) => ({
      ...current,
      logo_storage_id: "",
      logo_url: previewUrl,
    }));
    setFormError("");
  };

  return (
    <div>
      {submitted && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 p-3 text-green-700">
          <CheckCircle className="h-4 w-4 shrink-0" />
          <span className="text-sm">Edit submitted for admin review.</span>
        </div>
      )}

      <div className="rounded-2xl bg-white p-6 shadow-card">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <CompanyLogo company={myCompany as any} size="lg" />
            <div>
              <h3 className="text-xl font-bold text-enterprise-900">
                {myCompany.name}
              </h3>
              {myCompany.headquarters && (
                <div className="mt-1 flex items-center gap-1.5 text-sm text-enterprise-500">
                  <MapPin className="h-3.5 w-3.5" />
                  {myCompany.headquarters}
                </div>
              )}
              {myCompany.website && !editing && (
                <div className="mt-1 flex items-center gap-1.5">
                  <Globe className="h-3.5 w-3.5 text-enterprise-400" />
                  <a
                    href={myCompany.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    {myCompany.website}
                  </a>
                </div>
              )}
            </div>
          </div>
          {!editing && (
            <button
              onClick={startEditing}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-enterprise-600 transition-colors hover:bg-enterprise-100 hover:text-enterprise-900"
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </button>
          )}
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {myCompany.contact_email ? (
            <ReadOnlyField label="Contact Email">
              <a
                href={`mailto:${myCompany.contact_email}`}
                className="text-sm text-primary hover:underline"
              >
                {myCompany.contact_email}
              </a>
            </ReadOnlyField>
          ) : null}

          {(myCompany.primary_verticals?.length ?? 0) > 0 ? (
            <ReadOnlyField label="Primary Verticals" className="md:col-span-2">
              <div className="flex flex-wrap gap-2">
                {myCompany.primary_verticals.map((vertical: string) => (
                  <span
                    key={vertical}
                    className="rounded-full bg-enterprise-100 px-2.5 py-1 text-xs font-medium text-enterprise-700"
                  >
                    {vertical}
                  </span>
                ))}
              </div>
            </ReadOnlyField>
          ) : null}
        </div>

        {editing ? (
          <form onSubmit={handleSubmitEdit} className="mt-5 space-y-4">
            <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                Changes will be sent for admin review before going live.
              </span>
            </div>

            <div>
              <label
                htmlFor="company-logo-upload"
                className="mb-1 block text-sm font-medium text-enterprise-700"
              >
                Company Logo
              </label>
              <div className="rounded-xl border border-enterprise-200 bg-enterprise-50 p-4">
                <div className="flex items-center gap-3">
                  <CompanyLogo
                    company={{
                      name: myCompany.name,
                      logo_url: form.logo_url || undefined,
                      logo_bg: form.logo_bg || undefined,
                    }}
                    size="lg"
                  />
                  <div className="flex-1">
                    <input
                      id="company-logo-upload"
                      type="file"
                      accept=".svg,.png,.webp,.jpg,.jpeg,image/svg+xml,image/png,image/webp,image/jpeg"
                      onChange={(e) =>
                        handleLogoFileChange(e.target.files?.[0] ?? null)
                      }
                      className="w-full rounded-lg border border-enterprise-300 bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                    <p className="mt-2 text-xs text-enterprise-500">
                      Upload a replacement company logo. SVG, PNG, WEBP, and
                      JPG files up to 5 MB are supported.
                    </p>
                  </div>
                </div>

                <label className="mt-4 flex items-center gap-2 text-sm text-enterprise-700">
                  <input
                    type="checkbox"
                    checked={form.logo_bg === "dark"}
                    onChange={(e) =>
                      setForm((current) => ({
                        ...current,
                        logo_bg: e.target.checked ? "dark" : "",
                      }))
                    }
                    className="h-4 w-4 rounded border-enterprise-300 text-primary focus:ring-primary/30"
                  />
                  Use a dark background behind the logo
                </label>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-enterprise-700">
                Description
              </label>
              <textarea
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                rows={4}
                className="w-full rounded-lg border border-enterprise-300 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-enterprise-700">
                Website
              </label>
              <input
                type="url"
                value={form.website}
                onChange={(e) => setForm({ ...form, website: e.target.value })}
                className="w-full rounded-lg border border-enterprise-300 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {formError ? (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {formError}
              </div>
            ) : null}

            <div className="flex items-center gap-3">
              <button
                type="submit"
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90"
              >
                Submit Changes for Review
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditing(false);
                  setFormError("");
                }}
                className="px-4 py-2 text-sm text-enterprise-600 hover:text-enterprise-900"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <p className="mt-4 text-sm leading-relaxed text-enterprise-600">
            {myCompany.description || "No description set."}
          </p>
        )}
      </div>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl bg-white p-6 shadow-card">
      <div className="flex items-start gap-4">
        <div className="h-16 w-16 rounded-xl bg-enterprise-200" />
        <div className="flex-1">
          <div className="h-5 w-48 rounded bg-enterprise-200" />
          <div className="mt-3 h-3 w-32 rounded bg-enterprise-100" />
          <div className="mt-2 h-3 w-40 rounded bg-enterprise-100" />
        </div>
      </div>
      <div className="mt-5 space-y-2">
        <div className="h-3 w-full rounded bg-enterprise-100" />
        <div className="h-3 w-3/4 rounded bg-enterprise-100" />
        <div className="h-3 w-1/2 rounded bg-enterprise-100" />
      </div>
    </div>
  );
}

function ReadOnlyField({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="text-xs font-semibold uppercase tracking-wide text-enterprise-500">
        {label}
      </p>
      <div className="mt-1 text-sm text-enterprise-700">{children}</div>
    </div>
  );
}
