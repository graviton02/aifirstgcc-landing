"use client"

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronDown, Clock, ArrowLeft, ArrowRight, Brain, BookOpen } from 'lucide-react'
import { getTopicById, type LearningPart, type LearningTopic } from '@/data/agenticAiContent'
import ReactMarkdown from 'react-markdown'

interface Props {
  topicId: string
  learningContent: LearningPart[]
}

export function ThoughtbookClient({ topicId, learningContent }: Props) {
  const router = useRouter()
  const [selectedTopic, setSelectedTopic] = useState<LearningTopic | null>(null)
  const [expandedParts, setExpandedParts] = useState<string[]>(['foundations'])
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (topicId) {
      const topic = getTopicById(topicId)
      if (topic) {
        setSelectedTopic(topic)
        const containingPart = learningContent.find(part =>
          part.topics.some(t => t.id === topicId)
        )
        if (containingPart) {
          setExpandedParts(prev => {
            if (!prev.includes(containingPart.id)) {
              return [...prev, containingPart.id]
            }
            return prev
          })
        }
      }
    } else {
      const first = learningContent[0]?.topics[0]
      if (first) {
        setSelectedTopic(first)
        router.replace(`/thoughtbook/${first.id}`)
      }
    }
  }, [topicId, learningContent, router])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [selectedTopic?.id])

  const togglePartExpansion = (partId: string) => {
    setExpandedParts(prev =>
      prev.includes(partId)
        ? prev.filter(id => id !== partId)
        : [...prev, partId]
    )
  }

  const selectTopic = (topic: LearningTopic) => {
    setSelectedTopic(topic)
    setIsMobileSidebarOpen(false)
    router.push(`/thoughtbook/${topic.id}`)
  }

  const allTopics = learningContent.flatMap(part => part.topics)

  const getNextTopic = (): LearningTopic | null => {
    if (!selectedTopic) return null
    const currentIndex = allTopics.findIndex(topic => topic.id === selectedTopic.id)
    return currentIndex < allTopics.length - 1 ? allTopics[currentIndex + 1] : null
  }

  const getPreviousTopic = (): LearningTopic | null => {
    if (!selectedTopic) return null
    const currentIndex = allTopics.findIndex(topic => topic.id === selectedTopic.id)
    return currentIndex > 0 ? allTopics[currentIndex - 1] : null
  }

  const totalTopics = learningContent.reduce((total, part) => total + part.topics.length, 0)
  const currentTopicIndex = selectedTopic ? allTopics.findIndex(t => t.id === selectedTopic.id) + 1 : 0

  if (!selectedTopic) {
    return (
      <div className="pt-28 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-enterprise-100 mb-4">
              <Brain className="w-6 h-6 text-enterprise-400" />
            </div>
            <p className="text-enterprise-500 font-medium">Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  const nextTopic = getNextTopic()
  const previousTopic = getPreviousTopic()

  return (
    <div className="pt-20 min-h-screen bg-enterprise-50/40">
      {/* Page Header */}
      <div className="border-b border-enterprise-200/60 bg-white">
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
                A comprehensive guide to understanding, implementing, and mastering agentic AI systems in enterprise environments.
              </p>
              <div className="mt-3 flex items-center gap-4 text-xs text-enterprise-400">
                <span className="flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5" />
                  {totalTopics} topics
                </span>
                <span className="w-1 h-1 rounded-full bg-enterprise-300" />
                <span>{learningContent.length} parts</span>
                {currentTopicIndex > 0 && (
                  <>
                    <span className="w-1 h-1 rounded-full bg-enterprise-300" />
                    <span>Reading {currentTopicIndex} of {totalTopics}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sidebar toggle */}
      <div className="lg:hidden sticky top-16 z-30 bg-white/90 backdrop-blur-sm border-b border-enterprise-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <button
            onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            className="flex items-center justify-between w-full py-3 text-sm"
          >
            <span className="font-medium text-enterprise-700 truncate pr-4">
              {selectedTopic.title}
            </span>
            <ChevronDown className={`w-4 h-4 text-enterprise-400 flex-shrink-0 transition-transform duration-200 ${isMobileSidebarOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <div className="flex flex-col lg:grid lg:grid-cols-[18rem_1fr] xl:grid-cols-[20rem_1fr] gap-6 lg:gap-8">

          {/* Sidebar */}
          <aside className={`${isMobileSidebarOpen ? 'block' : 'hidden'} lg:block`}>
            <div className="lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:overflow-hidden lg:flex lg:flex-col bg-white rounded-xl border border-enterprise-200/60 shadow-sm">
              <div className="px-4 py-3.5 border-b border-enterprise-100">
                <h2 className="font-display font-semibold text-sm text-enterprise-800">Contents</h2>
                <p className="text-xs text-enterprise-400 mt-0.5">
                  {totalTopics} topics across {learningContent.length} parts
                </p>
              </div>

              <div className="overflow-y-auto flex-1 overscroll-contain max-h-[50vh] lg:max-h-none">
                <nav className="p-2">
                  {learningContent.map((part: LearningPart) => {
                    const isExpanded = expandedParts.includes(part.id)
                    const hasActiveTopic = part.topics.some(t => t.id === selectedTopic?.id)
                    return (
                      <div key={part.id} className="mb-0.5">
                        <button
                          onClick={() => togglePartExpansion(part.id)}
                          className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg text-left transition-colors duration-150 ${
                            hasActiveTopic
                              ? 'bg-purple-50/60 text-purple-800'
                              : 'text-enterprise-700 hover:bg-enterprise-50'
                          }`}
                        >
                          <div className="min-w-0">
                            <div className="font-medium text-sm truncate">{part.title}</div>
                            <div className="text-xs text-enterprise-400 mt-0.5">{part.topics.length} topics</div>
                          </div>
                          <ChevronDown
                            className={`w-3.5 h-3.5 flex-shrink-0 text-enterprise-400 transition-transform duration-200 ${
                              isExpanded ? 'rotate-0' : '-rotate-90'
                            }`}
                          />
                        </button>

                        <div
                          className={`overflow-hidden transition-all duration-250 ease-out ${
                            isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
                          }`}
                        >
                          <div className="ml-2 pl-2 border-l border-enterprise-100 space-y-px py-1">
                            {part.topics.map((topic: LearningTopic) => {
                              const isActive = selectedTopic?.id === topic.id
                              return (
                                <button
                                  key={topic.id}
                                  onClick={() => selectTopic(topic)}
                                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors duration-150 group ${
                                    isActive
                                      ? 'bg-purple-100/80 text-purple-900 font-medium'
                                      : 'text-enterprise-600 hover:bg-enterprise-50 hover:text-enterprise-800'
                                  }`}
                                >
                                  <div className="truncate">{topic.title}</div>
                                  <div className={`flex items-center gap-1 mt-0.5 text-xs ${
                                    isActive ? 'text-purple-500' : 'text-enterprise-400'
                                  }`}>
                                    <Clock className="w-3 h-3" />
                                    {topic.readingTime} min
                                  </div>
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </nav>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main ref={contentRef} className="min-w-0">
            <article className="bg-white rounded-xl border border-enterprise-200/60 shadow-sm">
              <header className="px-5 sm:px-8 pt-6 sm:pt-8 pb-5 border-b border-enterprise-100">
                <h2 className="font-display text-2xl sm:text-3xl text-enterprise-900 tracking-tight leading-tight">
                  {selectedTopic.title}
                </h2>
                <div className="flex items-center gap-3 mt-3">
                  <span className="inline-flex items-center gap-1.5 text-sm text-enterprise-400">
                    <Clock className="w-4 h-4" />
                    {selectedTopic.readingTime} min read
                  </span>
                </div>
              </header>

              <div className="px-5 sm:px-8 py-6 sm:py-8">
                <div className="prose prose-slate max-w-none
                  prose-headings:font-display prose-headings:text-enterprise-900 prose-headings:tracking-tight
                  prose-p:text-enterprise-700 prose-p:leading-relaxed
                  prose-strong:text-enterprise-800 prose-strong:font-semibold
                  prose-li:text-enterprise-700
                  prose-blockquote:border-purple-300 prose-blockquote:text-enterprise-500 prose-blockquote:not-italic
                  prose-code:text-purple-700 prose-code:bg-purple-50 prose-code:rounded prose-code:px-1.5 prose-code:py-0.5 prose-code:text-sm prose-code:font-mono prose-code:before:content-none prose-code:after:content-none
                  prose-pre:bg-enterprise-900 prose-pre:text-enterprise-100 prose-pre:rounded-xl
                ">
                  <ReactMarkdown
                    components={{
                      h1: ({ children }) => <h1 className="text-2xl sm:text-3xl font-display font-bold mt-8 mb-4 first:mt-0 text-enterprise-900">{children}</h1>,
                      h2: ({ children }) => <h2 className="text-xl sm:text-2xl font-display font-semibold mt-8 mb-3 text-enterprise-900">{children}</h2>,
                      h3: ({ children }) => <h3 className="text-lg sm:text-xl font-display font-semibold mt-6 mb-2 text-enterprise-800">{children}</h3>,
                      p: ({ children }) => <p className="mb-4 leading-relaxed text-enterprise-700">{children}</p>,
                      ul: ({ children }) => <ul className="mb-4 pl-5 space-y-1.5">{children}</ul>,
                      ol: ({ children }) => <ol className="mb-4 pl-5 space-y-1.5 list-decimal">{children}</ol>,
                      li: ({ children }) => <li className="text-enterprise-700 list-disc marker:text-enterprise-300">{children}</li>,
                      strong: ({ children }) => <strong className="font-semibold text-enterprise-800">{children}</strong>,
                      blockquote: ({ children }) => (
                        <blockquote className="border-l-3 border-purple-300 pl-4 my-5 text-enterprise-500">
                          {children}
                        </blockquote>
                      ),
                      code: ({ children, className }) => {
                        const isBlock = className?.includes('language-')
                        if (isBlock) {
                          return <code className={className}>{children}</code>
                        }
                        return (
                          <code className="bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded text-sm font-mono">
                            {children}
                          </code>
                        )
                      },
                      pre: ({ children }) => (
                        <pre className="bg-enterprise-900 text-enterprise-100 p-5 rounded-xl overflow-x-auto my-5 text-sm">
                          {children}
                        </pre>
                      ),
                    }}
                  >
                    {selectedTopic.content}
                  </ReactMarkdown>
                </div>

                {/* Prev/Next Navigation */}
                <div className="flex flex-col sm:flex-row justify-between items-stretch gap-3 mt-10 pt-6 border-t border-enterprise-100">
                  <div className="flex-1">
                    {previousTopic && (
                      <button
                        onClick={() => selectTopic(previousTopic)}
                        className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border border-enterprise-200 text-left hover:border-purple-200 hover:bg-purple-50/30 transition-colors duration-150 group"
                      >
                        <ArrowLeft className="w-4 h-4 text-enterprise-400 group-hover:text-purple-500 flex-shrink-0 transition-colors" />
                        <div className="min-w-0">
                          <div className="text-xs text-enterprise-400 group-hover:text-purple-400 transition-colors">Previous</div>
                          <div className="text-sm font-medium text-enterprise-700 group-hover:text-purple-800 truncate transition-colors">{previousTopic.title}</div>
                        </div>
                      </button>
                    )}
                  </div>
                  <div className="flex-1">
                    {nextTopic && (
                      <button
                        onClick={() => selectTopic(nextTopic)}
                        className="w-full flex items-center justify-end gap-3 px-4 py-3.5 rounded-xl border border-enterprise-200 text-right hover:border-purple-200 hover:bg-purple-50/30 transition-colors duration-150 group"
                      >
                        <div className="min-w-0">
                          <div className="text-xs text-enterprise-400 group-hover:text-purple-400 transition-colors">Next</div>
                          <div className="text-sm font-medium text-enterprise-700 group-hover:text-purple-800 truncate transition-colors">{nextTopic.title}</div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-enterprise-400 group-hover:text-purple-500 flex-shrink-0 transition-colors" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </article>
          </main>
        </div>
      </div>
    </div>
  )
}
