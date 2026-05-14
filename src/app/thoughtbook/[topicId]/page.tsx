import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import ReactMarkdown from "react-markdown";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Brain,
  Clock,
} from "lucide-react";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/sections/Footer";
import {
  agenticAILearningContent,
  getTopicById,
  getAllTopics,
  type LearningTopic,
} from "@/data/agenticAiContent";

type TopicIndexPart = {
  id: string;
  title: string;
  topics: Array<Pick<LearningTopic, "id" | "title" | "readingTime">>;
};

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

  const allTopics = getAllTopics();
  const currentTopicIndex = allTopics.findIndex((item) => item.id === topic.id);
  const previousTopic = currentTopicIndex > 0 ? allTopics[currentTopicIndex - 1] : null;
  const nextTopic =
    currentTopicIndex < allTopics.length - 1 ? allTopics[currentTopicIndex + 1] : null;
  const indexParts: TopicIndexPart[] = agenticAILearningContent.map((part) => ({
    id: part.id,
    title: part.title,
    topics: part.topics.map((item) => ({
      id: item.id,
      title: item.title,
      readingTime: item.readingTime,
    })),
  }));

  return (
    <>
      <Navbar />
      <main className="pt-20 min-h-screen bg-enterprise-50/40">
        <header className="border-b border-enterprise-200/60 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
            <div className="flex items-start gap-4">
              <div className="hidden sm:flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-100 to-blue-100 flex-shrink-0 mt-0.5">
                <Brain className="w-6 h-6 text-purple-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="font-display text-2xl sm:text-3xl lg:text-display-sm text-enterprise-900 tracking-tight">
                  Agentic AI Thoughtbook
                </h1>
                <p className="mt-1.5 text-enterprise-500 text-sm sm:text-base max-w-2xl">
                  A comprehensive guide to understanding, implementing, and
                  mastering agentic AI systems in enterprise environments.
                </p>
                <div className="mt-3 flex items-center gap-4 text-xs text-enterprise-400">
                  <span className="flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5" />
                    {allTopics.length} topics
                  </span>
                  <span className="w-1 h-1 rounded-full bg-enterprise-300" />
                  <span>{indexParts.length} parts</span>
                  <span className="w-1 h-1 rounded-full bg-enterprise-300" />
                  <span>
                    Reading {currentTopicIndex + 1} of {allTopics.length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="lg:hidden sticky top-16 z-30 bg-white/90 backdrop-blur-sm border-b border-enterprise-200/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="py-3 text-sm font-medium text-enterprise-700 truncate">
              {topic.title}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          <div className="flex flex-col lg:grid lg:grid-cols-[18rem_1fr] xl:grid-cols-[20rem_1fr] gap-6 lg:gap-8">
            <aside>
              <div className="lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:overflow-hidden lg:flex lg:flex-col bg-white rounded-xl border border-enterprise-200/60 shadow-sm">
                <div className="px-4 py-3.5 border-b border-enterprise-100">
                  <h2 className="font-display font-semibold text-sm text-enterprise-800">
                    Contents
                  </h2>
                  <p className="text-xs text-enterprise-400 mt-0.5">
                    {allTopics.length} topics across {indexParts.length} parts
                  </p>
                </div>

                <nav className="overflow-y-auto flex-1 overscroll-contain max-h-[50vh] lg:max-h-none p-2">
                  {indexParts.map((part) => {
                    const hasActiveTopic = part.topics.some((item) => item.id === topic.id);
                    return (
                      <div key={part.id} className="mb-0.5">
                        <div
                          className={`w-full px-3 py-2.5 rounded-lg ${
                            hasActiveTopic
                              ? "bg-purple-50/60 text-purple-800"
                              : "text-enterprise-700"
                          }`}
                        >
                          <div className="font-medium text-sm truncate">{part.title}</div>
                          <div className="text-xs text-enterprise-400 mt-0.5">
                            {part.topics.length} topics
                          </div>
                        </div>
                        <div className="ml-2 pl-2 border-l border-enterprise-100 space-y-px py-1">
                          {part.topics.map((item) => {
                            const isActive = item.id === topic.id;
                            return (
                              <Link
                                key={item.id}
                                href={`/thoughtbook/${item.id}`}
                                prefetch={false}
                                className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors duration-150 group ${
                                  isActive
                                    ? "bg-purple-100/80 text-purple-900 font-medium"
                                    : "text-enterprise-600 hover:bg-enterprise-50 hover:text-enterprise-800"
                                }`}
                              >
                                <div className="truncate">{item.title}</div>
                                <div
                                  className={`flex items-center gap-1 mt-0.5 text-xs ${
                                    isActive ? "text-purple-500" : "text-enterprise-400"
                                  }`}
                                >
                                  <Clock className="w-3 h-3" />
                                  {item.readingTime} min
                                </div>
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </nav>
              </div>
            </aside>

            <article className="min-w-0 bg-white rounded-xl border border-enterprise-200/60 shadow-sm">
              <header className="px-5 sm:px-8 pt-6 sm:pt-8 pb-5 border-b border-enterprise-100">
                <h2 className="font-display text-2xl sm:text-3xl text-enterprise-900 tracking-tight leading-tight">
                  {topic.title}
                </h2>
                <div className="flex items-center gap-3 mt-3">
                  <span className="inline-flex items-center gap-1.5 text-sm text-enterprise-400">
                    <Clock className="w-4 h-4" />
                    {topic.readingTime} min read
                  </span>
                </div>
              </header>

              <div className="px-5 sm:px-8 py-6 sm:py-8">
                <div
                  className="prose prose-slate max-w-none
                  prose-headings:font-display prose-headings:text-enterprise-900 prose-headings:tracking-tight
                  prose-p:text-enterprise-700 prose-p:leading-relaxed
                  prose-strong:text-enterprise-800 prose-strong:font-semibold
                  prose-li:text-enterprise-700
                  prose-blockquote:border-purple-300 prose-blockquote:text-enterprise-500 prose-blockquote:not-italic
                  prose-code:text-purple-700 prose-code:bg-purple-50 prose-code:rounded prose-code:px-1.5 prose-code:py-0.5 prose-code:text-sm prose-code:font-mono prose-code:before:content-none prose-code:after:content-none
                  prose-pre:bg-enterprise-900 prose-pre:text-enterprise-100 prose-pre:rounded-xl"
                >
                  <ReactMarkdown
                    components={{
                      h1: ({ children }) => (
                        <h1 className="text-2xl sm:text-3xl font-display font-bold mt-8 mb-4 first:mt-0 text-enterprise-900">
                          {children}
                        </h1>
                      ),
                      h2: ({ children }) => (
                        <h2 className="text-xl sm:text-2xl font-display font-semibold mt-8 mb-3 text-enterprise-900">
                          {children}
                        </h2>
                      ),
                      h3: ({ children }) => (
                        <h3 className="text-lg sm:text-xl font-display font-semibold mt-6 mb-2 text-enterprise-800">
                          {children}
                        </h3>
                      ),
                      p: ({ children }) => (
                        <p className="mb-4 leading-relaxed text-enterprise-700">
                          {children}
                        </p>
                      ),
                      ul: ({ children }) => <ul className="mb-4 pl-5 space-y-1.5">{children}</ul>,
                      ol: ({ children }) => (
                        <ol className="mb-4 pl-5 space-y-1.5 list-decimal">
                          {children}
                        </ol>
                      ),
                      li: ({ children }) => (
                        <li className="text-enterprise-700 list-disc marker:text-enterprise-300">
                          {children}
                        </li>
                      ),
                      strong: ({ children }) => (
                        <strong className="font-semibold text-enterprise-800">
                          {children}
                        </strong>
                      ),
                      blockquote: ({ children }) => (
                        <blockquote className="border-l-3 border-purple-300 pl-4 my-5 text-enterprise-500">
                          {children}
                        </blockquote>
                      ),
                      code: ({ children, className }) => {
                        const isBlock = className?.includes("language-");
                        if (isBlock) return <code className={className}>{children}</code>;
                        return (
                          <code className="bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded text-sm font-mono">
                            {children}
                          </code>
                        );
                      },
                      pre: ({ children }) => (
                        <pre className="bg-enterprise-900 text-enterprise-100 p-5 rounded-xl overflow-x-auto my-5 text-sm">
                          {children}
                        </pre>
                      ),
                    }}
                  >
                    {topic.content}
                  </ReactMarkdown>
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-stretch gap-3 mt-10 pt-6 border-t border-enterprise-100">
                  <div className="flex-1">
                    {previousTopic && (
                      <TopicNavLink topic={previousTopic} direction="previous" />
                    )}
                  </div>
                  <div className="flex-1">
                    {nextTopic && <TopicNavLink topic={nextTopic} direction="next" />}
                  </div>
                </div>
              </div>
            </article>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

function TopicNavLink({
  topic,
  direction,
}: {
  topic: LearningTopic;
  direction: "previous" | "next";
}) {
  const isPrevious = direction === "previous";
  return (
    <Link
      href={`/thoughtbook/${topic.id}`}
      prefetch={false}
      className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border border-enterprise-200 hover:border-purple-200 hover:bg-purple-50/30 transition-colors duration-150 group ${
        isPrevious ? "text-left" : "justify-end text-right"
      }`}
    >
      {isPrevious && (
        <ArrowLeft className="w-4 h-4 text-enterprise-400 group-hover:text-purple-500 flex-shrink-0 transition-colors" />
      )}
      <div className="min-w-0">
        <div className="text-xs text-enterprise-400 group-hover:text-purple-400 transition-colors">
          {isPrevious ? "Previous" : "Next"}
        </div>
        <div className="text-sm font-medium text-enterprise-700 group-hover:text-purple-800 truncate transition-colors">
          {topic.title}
        </div>
      </div>
      {!isPrevious && (
        <ArrowRight className="w-4 h-4 text-enterprise-400 group-hover:text-purple-500 flex-shrink-0 transition-colors" />
      )}
    </Link>
  );
}
