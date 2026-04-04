const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://orbys360.com";

// Agent detail page -- SoftwareApplication schema
export function agentJsonLd(
  agent: {
    slug: string;
    agent_name: string;
    tagline?: string;
    description: string;
    category?: string;
    source_url?: string;
    integrations?: string[];
    rating?: number | null;
    review_count?: number | null;
  },
  company?: {
    name: string;
    slug: string;
    website?: string;
  },
  summary?: {
    overallRating?: number | null;
    reviewCount?: number | null;
  }
) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: agent.agent_name,
    description: agent.tagline || agent.description.slice(0, 160),
    url: `${BASE_URL}/agents/${agent.slug}`,
    applicationCategory: agent.category || "BusinessApplication",
    operatingSystem: "Cloud",
    ...(company && {
      author: {
        "@type": "Organization",
        name: company.name,
        url: company.website || `${BASE_URL}/companies/${company.slug}`,
      },
    }),
    ...(agent.source_url && { sameAs: agent.source_url }),
    ...((summary?.reviewCount ?? agent.review_count ?? 0) > 0 &&
      (summary?.overallRating ?? agent.rating) != null && {
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: String(summary?.overallRating ?? agent.rating),
          reviewCount: String(summary?.reviewCount ?? agent.review_count),
          bestRating: "5",
          worstRating: "1",
        },
      }),
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      description: "Contact for pricing",
    },
  };
}

// Company profile page -- Organization schema
export function companyJsonLd(company: {
  slug: string;
  name: string;
  description: string;
  website: string;
  headquarters?: string;
  founded?: number;
  logo_url?: string;
}, summary?: {
  overallRating?: number | null;
  reviewCount?: number | null;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: company.name,
    description: company.description.slice(0, 160),
    url: company.website,
    sameAs: `${BASE_URL}/companies/${company.slug}`,
    ...(company.logo_url && {
      logo: company.logo_url.startsWith("http")
        ? company.logo_url
        : `${BASE_URL}${company.logo_url}`,
    }),
    ...(company.headquarters && {
      address: {
        "@type": "PostalAddress",
        addressLocality: company.headquarters,
      },
    }),
    ...(company.founded && { foundingDate: String(company.founded) }),
    ...((summary?.reviewCount ?? 0) > 0 &&
      summary?.overallRating != null && {
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: String(summary.overallRating),
          reviewCount: String(summary.reviewCount),
          bestRating: "5",
          worstRating: "1",
        },
      }),
  };
}

// Category page -- CollectionPage schema
export function categoryJsonLd(category: string, agentCount: number) {
  const slug = category
    .toLowerCase()
    .replace(/[&\s]+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${category} AI Agents`,
    description: `Browse ${agentCount} verified AI agents for ${category}. Compare features, integrations, and outcomes on Orbys360.`,
    url: `${BASE_URL}/categories/${slug}`,
    isPartOf: {
      "@type": "WebSite",
      name: "Orbys360",
      url: BASE_URL,
    },
  };
}

// Breadcrumb schema -- reusable for any page
export function breadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

// AI Pulse article page -- NewsArticle schema
export function newsArticleJsonLd(article: {
  title: string;
  description: string;
  url: string;
  datePublished: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    description: article.description,
    url: `${BASE_URL}${article.url}`,
    datePublished: article.datePublished,
    publisher: {
      "@type": "Organization",
      name: "Orbys360",
      url: BASE_URL,
    },
    isPartOf: {
      "@type": "WebSite",
      name: "Orbys360",
      url: BASE_URL,
    },
  };
}

// Thought Leadership article page -- Article schema
export function articleJsonLd(article: {
  title: string;
  description: string;
  url: string;
  publishedTime?: string;
  tags?: string[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description.slice(0, 160),
    url: `${BASE_URL}${article.url}`,
    ...(article.publishedTime && { datePublished: article.publishedTime }),
    ...(article.tags &&
      article.tags.length > 0 && { keywords: article.tags.join(", ") }),
    publisher: {
      "@type": "Organization",
      name: "Orbys360",
      url: BASE_URL,
    },
    isPartOf: {
      "@type": "WebSite",
      name: "Orbys360",
      url: BASE_URL,
    },
  };
}

// Directory page -- WebPage with search action
export function directoryJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "AI Agent Directory",
    description:
      "Browse and compare verified AI agents across industries and functions.",
    url: `${BASE_URL}/directory`,
    isPartOf: {
      "@type": "WebSite",
      name: "Orbys360",
      url: BASE_URL,
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${BASE_URL}/directory?q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    },
  };
}
