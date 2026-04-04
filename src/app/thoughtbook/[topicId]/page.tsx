import { notFound } from "next/navigation";
import { Metadata } from "next";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/sections/Footer";
import { ThoughtbookClient } from "@/components/resource-pages/ThoughtbookClient";
import {
  agenticAILearningContent,
  getTopicById,
  getAllTopics,
} from "@/data/agenticAiContent";

export function generateStaticParams() {
  const allTopics = getAllTopics();
  return allTopics.map((topic) => ({ topicId: topic.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ topicId: string }>;
}): Promise<Metadata> {
  const { topicId } = await params;
  const topic = getTopicById(topicId);
  if (!topic) return { title: "Not Found | Orbys360" };

  return {
    title: `${topic.title} — Agentic AI Thoughtbook | Orbys360`,
    description: `Learn about ${topic.title}. Part of the Agentic AI Thoughtbook — a comprehensive guide to agentic AI in enterprise environments.`,
    alternates: { canonical: `https://www.orbys360.com/thoughtbook/${topicId}` },
  };
}

export default async function ThoughtbookTopicPage({
  params,
}: {
  params: Promise<{ topicId: string }>;
}) {
  const { topicId } = await params;
  const topic = getTopicById(topicId);
  if (!topic) notFound();

  return (
    <>
      <Navbar />
      <ThoughtbookClient
        topicId={topicId}
        learningContent={agenticAILearningContent}
      />
      <Footer />
    </>
  );
}
