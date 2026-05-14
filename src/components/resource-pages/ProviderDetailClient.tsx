"use client";

import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  MapPin,
  Users,
  Target,
  Cpu,
  Award,
  CheckCircle2,
  MessageSquareQuote,
  LayoutGrid,
} from "lucide-react";
import { Container } from "@/components/shared/Container";
import type { ProviderSummary } from "@/data/providerDirectoryData";

interface ProviderDetailClientProps {
  provider: ProviderSummary;
}

export function ProviderDetailClient({ provider }: ProviderDetailClientProps) {
  const detail = provider.detail;
  const initials = provider.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="pt-28 pb-16">
      <Container size="narrow">
        {/* Back link */}
        <Link
          href="/providers"
          prefetch={false}
          className="inline-flex items-center gap-1.5 text-sm text-enterprise-500 hover:text-enterprise-800 transition-colors mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Provider Ecosystem
        </Link>

        {/* Provider hero */}
        <header className="mb-10">
          <div className="flex items-start gap-4 mb-4">
            {provider.logo ? (
              <Image
                src={provider.logo}
                alt={provider.name}
                width={56}
                height={56}
                className="shrink-0 w-14 h-14 rounded-xl object-contain bg-white border border-enterprise-100 p-1.5"
              />
            ) : (
              <div className="shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br from-enterprise-800 to-enterprise-900 flex items-center justify-center text-white text-lg font-bold">
                {initials}
              </div>
            )}
            <div>
              <h1 className="text-display-sm font-display text-enterprise-900">
                {provider.name}
              </h1>
            </div>
          </div>
          <p className="text-enterprise-600 text-lg leading-relaxed font-newspaper italic">
            &ldquo;{provider.tagline}&rdquo;
          </p>

          {/* Quick meta */}
          <div className="flex flex-wrap gap-4 mt-4 text-sm text-enterprise-500">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="w-4 h-4" />
              {provider.locations}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Users className="w-4 h-4" />
              {provider.employees}
            </span>
          </div>
        </header>
      </Container>

      {detail && (
        <>
          {/* Overview */}
          <Container size="narrow">
            <Section title="Overview" icon={<LayoutGrid className="w-4 h-4" />}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {detail.overview.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-lg bg-enterprise-50 border border-enterprise-100 p-3"
                  >
                    <div className="text-[10px] font-medium text-enterprise-500 uppercase tracking-wide mb-0.5">
                      {item.label}
                    </div>
                    <div className="text-sm text-enterprise-800">
                      {item.value}
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          </Container>

          {/* Analyst Summary */}
          <Container size="narrow">
            <Section
              title="Analyst Summary"
              icon={<MessageSquareQuote className="w-4 h-4" />}
            >
              <div className="rounded-lg bg-blue-50/60 border border-blue-100 p-4">
                <p className="text-sm text-blue-800 leading-relaxed">
                  {detail.analystSummary}
                </p>
              </div>
            </Section>
          </Container>

          {/* Positioning */}
          <Container size="narrow">
            <Section title="Positioning" icon={<Target className="w-4 h-4" />}>
              <ul className="space-y-2">
                {detail.positioning.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="text-sm text-enterprise-700 leading-relaxed">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </Section>
          </Container>

          {/* Capabilities */}
          <Container size="narrow">
            <Section title="Capabilities" icon={<Cpu className="w-4 h-4" />}>
              <div className="grid gap-3 sm:grid-cols-2">
                {detail.capabilities.map((cap) => (
                  <div
                    key={cap.category}
                    className="rounded-lg border border-enterprise-200 bg-white p-4"
                  >
                    <h4 className="text-xs font-semibold text-enterprise-900 mb-1.5">
                      {cap.category}
                    </h4>
                    <p className="text-xs text-enterprise-600 leading-relaxed">
                      {cap.description}
                    </p>
                  </div>
                ))}
              </div>
            </Section>
          </Container>

          {/* Flagship IP */}
          <Container size="narrow">
            <Section
              title="Flagship Platforms & IP"
              icon={<Award className="w-4 h-4" />}
            >
              <div className="grid gap-3 sm:grid-cols-2">
                {detail.flagship.map((f) => (
                  <div
                    key={f.platform}
                    className="rounded-lg border border-enterprise-200 bg-white p-4"
                  >
                    <h4 className="text-xs font-bold text-enterprise-900 mb-0.5">
                      {f.platform}
                    </h4>
                    <div className="text-[10px] text-emerald-600 font-medium mb-1.5">
                      {f.purpose}
                    </div>
                    <p className="text-xs text-enterprise-600 leading-relaxed">
                      {f.feature}
                    </p>
                  </div>
                ))}
              </div>
            </Section>
          </Container>

          {/* Proof Points */}
          <Container size="narrow">
            <Section
              title="Proof Points"
              icon={<CheckCircle2 className="w-4 h-4" />}
            >
              <ul className="space-y-2">
                {detail.proofPoints.map((point, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                    <span className="text-sm text-enterprise-700 leading-relaxed">
                      {point}
                    </span>
                  </li>
                ))}
              </ul>
            </Section>
          </Container>

          {/* Analyst Take */}
          {detail.analystTake && (
            <Container size="narrow">
              <Section
                title="Analyst Take"
                icon={<MessageSquareQuote className="w-4 h-4" />}
              >
                <div className="rounded-lg bg-enterprise-900 p-5">
                  <p className="text-sm text-enterprise-200 leading-relaxed font-newspaper italic">
                    {detail.analystTake}
                  </p>
                </div>
              </Section>
            </Container>
          )}
        </>
      )}

    </div>
  );
}

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-enterprise-500">{icon}</span>
        <h2 className="text-base font-display font-semibold text-enterprise-900">
          {title}
        </h2>
      </div>
      {children}
    </section>
  );
}
