import { redirect } from "next/navigation";
import { agenticAILearningContent } from "@/data/agenticAiContent";

export const metadata = {
  title: "Agentic AI Thoughtbook | Orbys360",
  description:
    "A comprehensive guide to understanding, implementing, and mastering agentic AI systems in enterprise environments.",
  alternates: { canonical: "https://www.orbys360.com/thoughtbook" },
};

export default function ThoughtbookIndexPage() {
  const firstTopicId = agenticAILearningContent[0]?.topics[0]?.id;
  if (firstTopicId) {
    redirect(`/thoughtbook/${firstTopicId}`);
  }
  return null;
}
