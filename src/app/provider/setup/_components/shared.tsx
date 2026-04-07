import {
  ArrowRight,
  Loader2,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  FormField                                                         */
/* ------------------------------------------------------------------ */

export function FormField({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={className}>
      <span className="mb-1 block text-sm font-medium text-enterprise-700">
        {label}
      </span>
      {children}
    </label>
  );
}

/* ------------------------------------------------------------------ */
/*  SummaryItem                                                       */
/* ------------------------------------------------------------------ */

export function SummaryItem({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="text-xs font-medium uppercase tracking-wide text-enterprise-500">
        {label}
      </p>
      <p className="mt-1 text-sm text-enterprise-800 break-words">
        {value || "—"}
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  StatusCard                                                        */
/* ------------------------------------------------------------------ */

const toneClasses = {
  neutral: "border-enterprise-200 bg-enterprise-50 text-enterprise-700",
  pending: "border-amber-200 bg-amber-50 text-amber-800",
  success: "border-green-200 bg-green-50 text-green-800",
  danger: "border-red-200 bg-red-50 text-red-800",
} as const;

export function StatusCard({
  icon: Icon,
  title,
  body,
  tone,
  action,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  body: string;
  tone: "neutral" | "pending" | "success" | "danger";
  action?: React.ReactNode;
}) {
  return (
    <div className={`rounded-2xl border p-5 ${toneClasses[tone]}`}>
      <div className="flex items-start gap-3">
        <div className="mt-0.5 rounded-lg bg-white/70 p-2">
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold">{title}</h3>
          <p className="mt-1 text-sm leading-6">{body}</p>
          {action && <div className="mt-4">{action}</div>}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  PathCard                                                          */
/* ------------------------------------------------------------------ */

export function PathCard({
  icon: Icon,
  title,
  description,
  actionLabel,
  isLoading,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  actionLabel: string;
  isLoading: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group relative overflow-hidden rounded-2xl border border-enterprise-200 bg-white p-7 text-left transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-card-hover"
    >
      {/* Top accent line — visible on hover */}
      <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-primary via-accent-purple to-primary opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/[0.08] to-accent-purple/[0.08] text-primary ring-1 ring-primary/[0.08]">
        <Icon className="h-6 w-6" />
      </div>
      <h2 className="mt-5 text-lg font-semibold text-enterprise-900">
        {title}
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-enterprise-500">
        {description}
      </p>
      <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary">
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Setting up...
          </>
        ) : (
          <>
            {actionLabel}
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
          </>
        )}
      </div>
    </button>
  );
}
