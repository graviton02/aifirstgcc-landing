import Link from "next/link";
import { ArrowUpRight, Clock3, DollarSign, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

function formatDate(timestamp?: number) {
  if (!timestamp) return null;
  return new Date(timestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function JobCard({ job }: { job: any }) {
  return (
    <article className="relative flex h-full flex-col overflow-hidden rounded-3xl border border-enterprise-200 bg-white p-6 shadow-card transition-all duration-400 ease-smooth hover:-translate-y-1 hover:border-blue-200/60 hover:shadow-card-hover">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {job.category.replace(/-/g, " ")}
          </p>
          <h2 className="mt-2 text-xl font-semibold text-enterprise-950">
            <Link href={`/jobs/${job.slug}`} prefetch={false} className="hover:text-blue-700">
              {job.title}
            </Link>
          </h2>
          <p className="mt-1 text-sm text-enterprise-600">{job.company_name}</p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            job.is_expired
              ? "bg-amber-100 text-amber-700"
              : "bg-enterprise-100 text-enterprise-700"
          }`}
        >
          {job.is_expired ? "Expired" : capitalize(job.workplace_type)}
        </span>
      </div>

      <div className="mt-4 space-y-2 text-sm text-enterprise-600">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-enterprise-400" />
          <span>{job.location}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock3 className="h-4 w-4 text-enterprise-400" />
          <span>
            {capitalize(job.job_type)} · {capitalize(job.seniority)}
            {formatDate(job.deadline) ? ` · Apply by ${formatDate(job.deadline)}` : ""}
          </span>
        </div>
        {typeof job.salary_min === "number" && typeof job.salary_max === "number" ? (
          <div className="flex items-center gap-1 text-sm font-semibold text-emerald-600">
            <DollarSign className="h-4 w-4" />
            <span>
              {new Intl.NumberFormat("en-US", { style: "currency", currency: job.salary_currency ?? "USD", maximumFractionDigits: 0 }).format(job.salary_min)}
              {" – "}
              {new Intl.NumberFormat("en-US", { style: "currency", currency: job.salary_currency ?? "USD", maximumFractionDigits: 0 }).format(job.salary_max)}
              {job.salary_type === "monthly" ? "/mo" : "/yr"}
            </span>
          </div>
        ) : null}
      </div>

      {Array.isArray(job.skills) && job.skills.length > 0 ? (
        <div className="mt-5 flex flex-wrap gap-2">
          {job.skills.slice(0, 4).map((skill: string) => (
            <span
              key={skill}
              className="rounded-full border border-enterprise-200 bg-enterprise-50 px-3 py-1 text-xs text-enterprise-700 hover:bg-enterprise-100 transition-colors duration-200"
            >
              {skill}
            </span>
          ))}
        </div>
      ) : null}

      <p className="mt-5 line-clamp-3 text-sm leading-6 text-enterprise-700">
        {job.description}
      </p>

      <div className="mt-6 flex items-center justify-between pt-4">
        <span className="text-xs text-enterprise-400">
          Posted {formatDate(job.created_at)}
        </span>
        {job.is_expired ? (
          <span className="text-xs font-medium text-amber-600">Closed</span>
        ) : (
          <Button asChild size="sm">
            <Link href={`/jobs/${job.slug}`} prefetch={false}>
              View role
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </Button>
        )}
      </div>
    </article>
  );
}
