import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  Inbox,
  MapPin,
  Search,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/sections/Footer";
import { Container } from "@/components/shared/Container";
import { providerData, type ProviderSummary } from "@/data/providerDirectoryData";

const PAGE_SIZE = 12;

export const metadata = {
  title: "AI Provider Ecosystem | Orbys360",
  description:
    "Explore the curated network of technology service providers, AI specialists, and consulting firms driving AI-first GCC transformation.",
  alternates: {
    canonical: "/providers",
  },
};

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function getParam(
  params: Record<string, string | string[] | undefined>,
  key: string
) {
  const value = params[key];
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function providersHref(params: { search?: string; page?: number }) {
  const next = new URLSearchParams();
  if (params.search) next.set("search", params.search);
  if (params.page && params.page > 1) next.set("page", String(params.page));
  const qs = next.toString();
  return qs ? `/providers?${qs}` : "/providers";
}

export default async function ProvidersPage({ searchParams }: PageProps) {
  const params = (await searchParams) ?? {};
  const search = getParam(params, "search").trim();
  const requestedPage = Number(getParam(params, "page") || "1");
  const page = Number.isFinite(requestedPage) ? Math.max(1, requestedPage) : 1;
  const filtered = providerData.filter((provider) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      provider.name.toLowerCase().includes(q) ||
      provider.tagline.toLowerCase().includes(q)
    );
  });
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginatedProviders = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  return (
    <>
      <Navbar />
      <main className="pt-28 pb-16">
        <Container size="wide">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-100 to-enterprise-50 flex items-center justify-center border border-emerald-200/50">
                <Building2 className="w-5 h-5 text-emerald-600" />
              </div>
              <h1 className="text-display-sm font-display text-enterprise-900">
                Provider Ecosystem
              </h1>
            </div>
            <p className="text-enterprise-600 max-w-2xl leading-relaxed">
              Explore the curated network of technology service providers, AI
              specialists, and consulting firms driving AI-first GCC
              transformation across the ecosystem.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6 mb-8 pb-8 border-b border-enterprise-200">
            <div className="flex items-center gap-2 text-sm text-enterprise-600">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="font-medium">{providerData.length} AI providers</span>
            </div>
          </div>

          <div className="mb-6">
            <form action="/providers" className="relative max-w-xl">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-enterprise-400" />
              <input
                type="text"
                name="search"
                defaultValue={search}
                placeholder="Search by provider name..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-enterprise-200 bg-white text-enterprise-900 placeholder:text-enterprise-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-300 text-sm transition-shadow"
              />
            </form>
          </div>

          {search && (
            <div className="flex flex-wrap items-center gap-2 mb-6">
              <span className="text-xs text-enterprise-500">Filters:</span>
              <span className="inline-flex items-center gap-1 pl-2.5 pr-1.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-200">
                &quot;{search}&quot;
                <Link
                  href="/providers"
                  className="p-0.5 hover:bg-emerald-100 rounded-full transition-colors"
                  aria-label="Clear provider search"
                >
                  <X className="w-3 h-3" />
                </Link>
              </span>
            </div>
          )}

          <p className="text-sm text-enterprise-500 mb-5">
            {filtered.length} provider{filtered.length !== 1 ? "s" : ""} found
          </p>

          {filtered.length === 0 && (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-enterprise-100 mb-4">
                <Inbox className="w-7 h-7 text-enterprise-400" />
              </div>
              <h2 className="text-lg font-semibold text-enterprise-900 mb-1">
                No providers found
              </h2>
              <p className="text-sm text-enterprise-500 max-w-sm mx-auto">
                Try adjusting your search.
              </p>
            </div>
          )}

          {paginatedProviders.length > 0 && (
            <>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {paginatedProviders.map((provider) => (
                  <ProviderCard key={provider.id} provider={provider} />
                ))}
              </div>
              <ServerPagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filtered.length}
                search={search}
              />
            </>
          )}

          <div className="mt-12 rounded-xl border border-enterprise-200 bg-gradient-to-br from-enterprise-50 to-white p-8 text-center">
            <h2 className="text-lg font-display font-semibold text-enterprise-900 mb-2">
              Join the Provider Ecosystem
            </h2>
            <p className="text-sm text-enterprise-600 max-w-lg mx-auto mb-5">
              Are you a technology service provider or AI specialist? Join the
              Orbys360 ecosystem to connect with GCC organizations seeking
              AI-first transformation partners.
            </p>
            <a
              href="/#signup"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-enterprise-900 text-white text-sm font-medium hover:bg-enterprise-800 transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              Join Waitlist
            </a>
          </div>
        </Container>
      </main>
      <Footer />
    </>
  );
}

function ProviderCard({ provider }: { provider: ProviderSummary }) {
  const initials = provider.name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <Link
      href={`/providers/${provider.id}`}
      prefetch={false}
      className="group rounded-xl border border-enterprise-200 bg-white hover:border-emerald-200 hover:shadow-card-hover transition-all duration-300 overflow-hidden flex flex-col"
    >
      <div className="p-6 flex-1 flex flex-col">
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
            <div className="shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br from-enterprise-800 to-enterprise-900 flex items-center justify-center text-white text-sm font-bold">
              {initials}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-semibold text-enterprise-900 group-hover:text-emerald-700 transition-colors truncate">
              {provider.name}
            </h2>
          </div>
        </div>

        <p className="text-sm text-enterprise-600 line-clamp-2 mb-5 flex-1 leading-relaxed">
          {provider.tagline}
        </p>

        <div className="space-y-2 text-xs text-enterprise-500">
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{provider.locations}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-3.5 h-3.5 shrink-0" />
            <span>{provider.employees}</span>
          </div>
        </div>

        <div className="pt-4 border-t border-enterprise-100 mt-4 flex items-center justify-between">
          <span className="text-xs text-enterprise-400">View profile</span>
          <ArrowRight className="w-4 h-4 text-enterprise-300 group-hover:text-emerald-500 group-hover:translate-x-0.5 transition-all" />
        </div>
      </div>
    </Link>
  );
}

function ServerPagination({
  currentPage,
  totalPages,
  totalItems,
  search,
}: {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  search: string;
}) {
  if (totalPages <= 1) return null;

  return (
    <div className="mt-10 space-y-3">
      <p className="text-center text-xs text-enterprise-500">
        Showing {(currentPage - 1) * PAGE_SIZE + 1}-
        {Math.min(currentPage * PAGE_SIZE, totalItems)} of {totalItems}
      </p>
      <div className="flex items-center justify-center gap-2">
        {getPaginationRange(currentPage, totalPages).map((page, index) =>
          page === "..." ? (
            <span key={`ellipsis-${index}`} className="px-2 text-enterprise-400">
              ...
            </span>
          ) : (
            <Link
              key={page}
              href={providersHref({ search, page })}
              prefetch={false}
              className={`inline-flex w-9 h-9 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                page === currentPage
                  ? "bg-purple-600 text-white"
                  : "border border-enterprise-200 text-enterprise-600 hover:bg-enterprise-50"
              }`}
            >
              {page}
            </Link>
          )
        )}
      </div>
    </div>
  );
}

function getPaginationRange(current: number, total: number): Array<number | "..."> {
  if (total <= 7) return Array.from({ length: total }, (_, index) => index + 1);
  const pages: Array<number | "..."> = [1];
  if (current > 3) pages.push("...");
  for (let page = Math.max(2, current - 1); page <= Math.min(total - 1, current + 1); page += 1) {
    pages.push(page);
  }
  if (current < total - 2) pages.push("...");
  pages.push(total);
  return pages;
}
