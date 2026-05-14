import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Clock,
  Inbox,
  Search,
  Star,
  X,
} from "lucide-react";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/sections/Footer";
import { Container } from "@/components/shared/Container";
import {
  loadBlogPosts,
  thoughtLeadershipThemes,
  type BlogPost,
  type ThoughtLeadershipTheme,
  type ThemeInfo,
} from "@/data/thoughtLeadershipContent";

const PAGE_SIZE = 9;

const themeColorMap: Record<ThoughtLeadershipTheme, string> = {
  "strategic-role-ai-gcc": "bg-blue-50 text-blue-700 border-blue-200",
  "ai-enterprise-functions": "bg-purple-50 text-purple-700 border-purple-200",
  "benchmarks-maturity": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "talent-culture-org": "bg-amber-50 text-amber-700 border-amber-200",
  "technology-ecosystem": "bg-cyan-50 text-cyan-700 border-cyan-200",
  "risk-ethics-policy": "bg-rose-50 text-rose-700 border-rose-200",
};

export const metadata = {
  title: "Thought Leadership | Orbys360",
  description:
    "In-depth articles on AI-first GCC transformation — governance frameworks, talent strategy, operational models, and benchmarking best practices.",
  alternates: { canonical: "https://www.orbys360.com/thought-leadership" },
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

function isTheme(value: string): value is ThoughtLeadershipTheme {
  return thoughtLeadershipThemes.some((theme) => theme.id === value);
}

function listingHref(params: {
  search?: string;
  theme?: string;
  page?: number;
}) {
  const next = new URLSearchParams();
  if (params.search) next.set("search", params.search);
  if (params.theme) next.set("theme", params.theme);
  if (params.page && params.page > 1) next.set("page", String(params.page));
  const qs = next.toString();
  return qs ? `/thought-leadership?${qs}` : "/thought-leadership";
}

export default async function ThoughtLeadershipPage({ searchParams }: PageProps) {
  const params = (await searchParams) ?? {};
  const search = getParam(params, "search").trim();
  const themeParam = getParam(params, "theme");
  const activeTheme = isTheme(themeParam) ? themeParam : "";
  const requestedPage = Number(getParam(params, "page") || "1");
  const page = Number.isFinite(requestedPage) ? Math.max(1, requestedPage) : 1;
  const blogPosts = loadBlogPosts();
  const filtered = blogPosts.filter((post) => {
    if (activeTheme && post.theme !== activeTheme) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      post.title.toLowerCase().includes(q) ||
      post.excerpt.toLowerCase().includes(q)
    );
  });
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginatedPosts = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );
  const activeThemeInfo = thoughtLeadershipThemes.find(
    (theme) => theme.id === activeTheme
  );

  return (
    <>
      <Navbar />
      <main className="pt-28 pb-16">
        <Container size="wide">
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-100 to-blue-50 flex items-center justify-center border border-purple-200/50">
                <BookOpen className="w-5 h-5 text-purple-600" />
              </div>
              <h1 className="text-display-sm font-display text-enterprise-900">
                Thought Leadership
              </h1>
            </div>
            <p className="text-enterprise-600 max-w-2xl leading-relaxed">
              In-depth articles on AI-first GCC transformation — governance
              frameworks, talent strategy, operational models, and benchmarking
              best practices from the AI-First GCC Research Team.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            <Link
              href={listingHref({ search })}
              prefetch={false}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium border transition-all duration-200 ${
                !activeTheme
                  ? "bg-enterprise-900 text-white border-enterprise-900 shadow-sm"
                  : "bg-white text-enterprise-600 border-enterprise-200 hover:border-enterprise-300 hover:bg-enterprise-50"
              }`}
            >
              All Topics
            </Link>
            {thoughtLeadershipThemes.map((theme) => (
              <Link
                key={theme.id}
                href={listingHref({
                  search,
                  theme: activeTheme === theme.id ? "" : theme.id,
                })}
                prefetch={false}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium border transition-all duration-200 ${
                  activeTheme === theme.id
                    ? `${themeColorMap[theme.id]} border shadow-sm`
                    : "bg-white text-enterprise-600 border-enterprise-200 hover:border-enterprise-300 hover:bg-enterprise-50"
                }`}
              >
                {theme.title}
              </Link>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <form action="/thought-leadership" className="flex-1 relative">
              {activeTheme && <input type="hidden" name="theme" value={activeTheme} />}
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-enterprise-400" />
              <input
                type="text"
                name="search"
                defaultValue={search}
                placeholder="Search articles by title or topic..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-enterprise-200 bg-white text-enterprise-900 placeholder:text-enterprise-400 focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-300 text-sm transition-shadow"
              />
            </form>
          </div>

          {(search || activeTheme) && (
            <div className="flex flex-wrap items-center gap-2 mb-6">
              <span className="text-xs text-enterprise-500">Filters:</span>
              {search && (
                <FilterChip
                  label={`"${search}"`}
                  href={listingHref({ theme: activeTheme })}
                />
              )}
              {activeTheme && activeThemeInfo && (
                <FilterChip
                  label={activeThemeInfo.title}
                  href={listingHref({ search })}
                />
              )}
              <Link
                href="/thought-leadership"
                prefetch={false}
                className="text-xs text-enterprise-500 hover:text-enterprise-700 underline"
              >
                Clear all
              </Link>
            </div>
          )}

          <p className="text-sm text-enterprise-500 mb-5">
            {filtered.length} article{filtered.length !== 1 ? "s" : ""} found
          </p>

          {filtered.length === 0 && (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-enterprise-100 mb-4">
                <Inbox className="w-7 h-7 text-enterprise-400" />
              </div>
              <h2 className="text-lg font-semibold text-enterprise-900 mb-1">
                No articles found
              </h2>
              <p className="text-sm text-enterprise-500 max-w-sm mx-auto">
                Try adjusting your search or theme filter to find what
                you&apos;re looking for.
              </p>
            </div>
          )}

          {paginatedPosts.length > 0 && (
            <>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {paginatedPosts.map((post) => (
                  <ArticleCard
                    key={post.id}
                    post={post}
                    themes={thoughtLeadershipThemes}
                  />
                ))}
              </div>
              <ServerPagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filtered.length}
                search={search}
                theme={activeTheme}
              />
            </>
          )}
        </Container>
      </main>
      <Footer />
    </>
  );
}

function FilterChip({ label, href }: { label: string; href: string }) {
  return (
    <span className="inline-flex items-center gap-1 pl-2.5 pr-1.5 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-medium border border-purple-200">
      {label}
      <Link
        href={href}
        prefetch={false}
        className="p-0.5 hover:bg-purple-100 rounded-full transition-colors"
        aria-label={`Remove ${label} filter`}
      >
        <X className="w-3 h-3" />
      </Link>
    </span>
  );
}

function ArticleCard({ post, themes }: { post: BlogPost; themes: ThemeInfo[] }) {
  const themeInfo = themes.find((theme) => theme.id === post.theme);
  const colors =
    themeColorMap[post.theme] ||
    "bg-enterprise-50 text-enterprise-600 border-enterprise-200";

  return (
    <Link
      href={`/thought-leadership/${post.slug}`}
      prefetch={false}
      className="group rounded-xl border border-enterprise-200 bg-white hover:border-purple-200 hover:shadow-card-hover transition-all duration-300 overflow-hidden flex flex-col"
    >
      <div
        className={`h-1 w-full ${colors.split(" ")[0]} opacity-60 group-hover:opacity-100 transition-opacity`}
      />

      <div className="p-5 flex-1 flex flex-col">
        <div className="flex items-center justify-between gap-2 mb-3">
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium border ${colors}`}
          >
            {themeInfo?.title.split(" ").slice(0, 3).join(" ") || post.theme}
          </span>
          {post.featured && (
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-600 border border-amber-200 text-[10px] font-medium">
              <Star className="w-2.5 h-2.5" />
              Featured
            </span>
          )}
        </div>

        <h2 className="text-base font-semibold text-enterprise-900 group-hover:text-purple-700 transition-colors line-clamp-2 mb-2">
          {post.title}
        </h2>

        <p className="text-sm text-enterprise-600 line-clamp-3 mb-4 flex-1 leading-relaxed">
          {post.excerpt}
        </p>

        <div className="flex items-center justify-between pt-4 border-t border-enterprise-100 text-xs text-enterprise-400">
          <span className="inline-flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {post.readTimeMinutes} min read
          </span>
          <span className="inline-flex items-center gap-1 text-purple-600 font-medium group-hover:gap-1.5 transition-all">
            Read
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
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
  theme,
}: {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  search: string;
  theme: string;
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
              href={listingHref({ search, theme, page })}
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
