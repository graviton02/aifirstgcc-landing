import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/sections/Footer";
import { ThoughtLeadershipClient } from "@/components/resource-pages/ThoughtLeadershipClient";
import { loadBlogPosts, thoughtLeadershipThemes } from "@/data/thoughtLeadershipContent";
import { Suspense } from "react";

export const metadata = {
  title: "Thought Leadership | Orbys360",
  description:
    "In-depth articles on AI-first GCC transformation — governance frameworks, talent strategy, operational models, and benchmarking best practices.",
  alternates: { canonical: "https://www.orbys360.com/thought-leadership" },
};

export default function ThoughtLeadershipPage() {
  const blogPosts = loadBlogPosts();

  return (
    <>
      <Navbar />
      <Suspense>
        <ThoughtLeadershipClient
          blogPosts={blogPosts}
          themes={thoughtLeadershipThemes}
        />
      </Suspense>
      <Footer />
    </>
  );
}
