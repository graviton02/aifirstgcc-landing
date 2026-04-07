import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/sections/Footer";
import { ThoughtLeadershipArticleClient } from "@/components/resource-pages/ThoughtLeadershipArticleClient";
import {
  loadBlogPosts,
  getPostBySlug,
  getPostsByTheme,
  thoughtLeadershipThemes,
} from "@/data/thoughtLeadershipContent";
import { articleJsonLd, breadcrumbJsonLd, serializeJsonLd } from "@/lib/json-ld";

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://orbys360.com";

export async function generateStaticParams() {
  const posts = loadBlogPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const posts = loadBlogPosts();
  const post = getPostBySlug(slug, posts);

  if (!post) {
    return { title: "Article Not Found | Orbys360" };
  }

  const url = `${BASE_URL}/thought-leadership/${post.slug}`;

  return {
    title: `${post.title} | Orbys360`,
    description: post.excerpt.slice(0, 160),
    alternates: { canonical: url },
    openGraph: {
      title: `${post.title} | Orbys360`,
      description: post.excerpt.slice(0, 160),
      url,
      type: "article",
      siteName: "Orbys360",
      publishedTime: post.publishDate,
    },
    twitter: {
      card: "summary_large_image",
      title: `${post.title} | Orbys360`,
      description: post.excerpt.slice(0, 160),
    },
  };
}

export default async function ThoughtLeadershipArticlePage({ params }: Props) {
  const { slug } = await params;
  const posts = loadBlogPosts();
  const post = getPostBySlug(slug, posts);

  if (!post) {
    notFound();
  }

  const relatedPosts = getPostsByTheme(post.theme, posts)
    .filter((p) => p.slug !== post.slug)
    .slice(0, 3);

  const jsonLd = [
    articleJsonLd({
      title: post.title,
      description: post.excerpt,
      url: `/thought-leadership/${post.slug}`,
      publishedTime: post.publishDate,
      tags: post.tags,
    }),
    breadcrumbJsonLd([
      { name: "Home", url: BASE_URL },
      { name: "Thought Leadership", url: `${BASE_URL}/thought-leadership` },
      {
        name: post.title,
        url: `${BASE_URL}/thought-leadership/${post.slug}`,
      },
    ]),
  ];

  return (
    <>
      <Navbar />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
      />
      <ThoughtLeadershipArticleClient
        post={post}
        relatedPosts={relatedPosts}
        themes={thoughtLeadershipThemes}
      />
      <Footer />
    </>
  );
}
