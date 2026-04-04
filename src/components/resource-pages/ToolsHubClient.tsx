"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { AnimatePresence, motion } from "framer-motion"
import {
  Wrench,
  ClipboardCheck,
  FileText,
  GraduationCap,
  GitBranch,
  Calculator,
  ClipboardList,
  BarChart3,
  Download,
  ArrowRight,
  Users,
  Target,
  Lightbulb,
  CheckCircle2,
  X,
  type LucideIcon,
} from "lucide-react"
import { Container } from "@/components/shared/Container"
import { tools, type ToolItem } from "@/data/toolsContent"

const iconMap: Record<string, LucideIcon> = {
  ClipboardCheck,
  FileText,
  GraduationCap,
  GitBranch,
  Calculator,
  ClipboardList,
  BarChart3,
}

export function ToolsHubClient() {
  const [selectedTool, setSelectedTool] = useState<ToolItem | null>(null)

  const closeModal = useCallback(() => setSelectedTool(null), [])

  useEffect(() => {
    if (!selectedTool) return
    document.body.style.overflow = "hidden"
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal()
    }
    window.addEventListener("keydown", handleEsc)
    return () => {
      document.body.style.overflow = ""
      window.removeEventListener("keydown", handleEsc)
    }
  }, [selectedTool, closeModal])

  return (
    <div className="pt-28 pb-16">
      <Container size="wide">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-100 to-enterprise-50 flex items-center justify-center border border-blue-200/50">
              <Wrench className="w-5 h-5 text-blue-600" />
            </div>
            <h1 className="text-display-sm font-display text-enterprise-900">
              AI-First Tools
            </h1>
          </div>
          <p className="text-enterprise-600 max-w-2xl leading-relaxed">
            Practical frameworks and templates for GCC leaders driving AI-first
            transformation. From self-assessment to business case development —
            structured tools that accelerate every stage of the journey.
          </p>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-6 mb-8 pb-8 border-b border-enterprise-200">
          <div className="flex items-center gap-2 text-sm text-enterprise-600">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="font-medium">{tools.length} tools</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-enterprise-600">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="font-medium">
              {tools.filter((t) => t.ctaType === "download").length} downloadable
              templates
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-enterprise-600">
            <div className="w-2 h-2 rounded-full bg-purple-500" />
            <span className="font-medium">
              {tools.filter((t) => t.ctaType === "link").length} interactive
            </span>
          </div>
        </div>

        {/* Tool cards */}
        <div className="grid gap-4 md:grid-cols-2">
          {tools.map((tool) => (
            <ToolCard
              key={tool.key}
              tool={tool}
              onDetails={() => setSelectedTool(tool)}
            />
          ))}
        </div>
      </Container>

      {/* Details modal */}
      <AnimatePresence>
        {selectedTool && (
          <ToolModal tool={selectedTool} onClose={closeModal} />
        )}
      </AnimatePresence>
    </div>
  )
}

function ToolCard({
  tool,
  onDetails,
}: {
  tool: ToolItem
  onDetails: () => void
}) {
  const Icon = iconMap[tool.icon] || Wrench

  return (
    <div className="rounded-xl border bg-white overflow-hidden transition-all duration-300 border-enterprise-200 hover:border-enterprise-300 hover:shadow-card">
      <div className="p-5">
        <div className="flex items-start gap-4">
          <div className="shrink-0 w-10 h-10 rounded-lg flex items-center justify-center bg-enterprise-100 text-enterprise-600">
            <Icon className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-enterprise-900 mb-1">
              {tool.title}
            </h3>
            <p className="text-xs text-enterprise-600 leading-relaxed line-clamp-2">
              {tool.description}
            </p>
          </div>
        </div>

        {/* Audience tags */}
        <div className="flex flex-wrap gap-1.5 mt-3 ml-14">
          {tool.audience.map((a) => (
            <span
              key={a}
              className="px-2 py-0.5 rounded-md bg-enterprise-50 text-enterprise-500 text-[10px] font-medium"
            >
              {a}
            </span>
          ))}
        </div>

        {/* Actions row */}
        <div className="flex items-center justify-between mt-4 ml-14">
          {tool.ctaType === "link" ? (
            <Link
              href={tool.ctaHref}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-enterprise-900 text-white text-xs font-medium hover:bg-enterprise-800 transition-colors"
            >
              {tool.ctaLabel}
              <ArrowRight className="w-3 h-3" />
            </Link>
          ) : (
            <a
              href={tool.ctaHref}
              download
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-enterprise-900 text-white text-xs font-medium hover:bg-enterprise-800 transition-colors"
            >
              <Download className="w-3 h-3" />
              {tool.ctaLabel}
            </a>
          )}

          <button
            onClick={onDetails}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-blue-200 bg-blue-50 text-blue-600 text-xs font-medium hover:bg-blue-100 hover:border-blue-300 transition-colors"
          >
            Details
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  )
}

function ToolModal({
  tool,
  onClose,
}: {
  tool: ToolItem
  onClose: () => void
}) {
  const Icon = iconMap[tool.icon] || Wrench

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />

      {/* Modal panel */}
      <motion.div
        className="relative w-full max-w-2xl max-h-[85vh] flex flex-col rounded-2xl bg-white border border-enterprise-200 shadow-xl overflow-hidden"
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal header */}
        <div className="shrink-0 bg-white border-b border-enterprise-100 px-6 py-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="shrink-0 w-10 h-10 rounded-lg flex items-center justify-center bg-blue-100 text-blue-600">
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-enterprise-900">
                  {tool.title}
                </h2>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {tool.audience.map((a) => (
                    <span
                      key={a}
                      className="px-2 py-0.5 rounded-md bg-enterprise-50 text-enterprise-500 text-[10px] font-medium"
                    >
                      {a}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-enterprise-400 hover:text-enterprise-600 hover:bg-enterprise-50 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal body -- scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* What */}
          <DetailSection
            icon={<Lightbulb className="w-4 h-4" />}
            title="What is this?"
            content={tool.what}
          />

          {/* Why */}
          <DetailSection
            icon={<Target className="w-4 h-4" />}
            title="Why use it?"
            content={tool.why}
          />

          {/* Who */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-enterprise-500" />
              <span className="text-sm font-semibold text-enterprise-800">
                Who should use it?
              </span>
            </div>
            <ul className="space-y-1.5 ml-6">
              {tool.who.map((item, i) => (
                <li
                  key={i}
                  className="text-sm text-enterprise-600 leading-relaxed list-disc"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* How */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <GitBranch className="w-4 h-4 text-enterprise-500" />
              <span className="text-sm font-semibold text-enterprise-800">
                How it works
              </span>
            </div>
            <ol className="space-y-1.5 ml-6">
              {tool.how.map((step, i) => (
                <li
                  key={i}
                  className="text-sm text-enterprise-600 leading-relaxed list-decimal"
                >
                  {step}
                </li>
              ))}
            </ol>
          </div>

          {/* Outcome */}
          <div className="rounded-lg bg-blue-50/60 border border-blue-100 p-4">
            <div className="flex items-center gap-2 mb-1.5">
              <CheckCircle2 className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-semibold text-blue-800">
                Outcome
              </span>
            </div>
            <p className="text-sm text-blue-700 leading-relaxed">
              {tool.outcome}
            </p>
          </div>
        </div>

        {/* Modal footer with CTA */}
        <div className="shrink-0 bg-white border-t border-enterprise-100 px-6 py-4">
          {tool.ctaType === "link" ? (
            <Link
              href={tool.ctaHref}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-enterprise-900 text-white text-sm font-medium hover:bg-enterprise-800 transition-colors"
            >
              {tool.ctaLabel}
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <a
              href={tool.ctaHref}
              download
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-enterprise-900 text-white text-sm font-medium hover:bg-enterprise-800 transition-colors"
            >
              <Download className="w-4 h-4" />
              {tool.ctaLabel}
            </a>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

function DetailSection({
  icon,
  title,
  content,
}: {
  icon: React.ReactNode
  title: string
  content: string
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-1.5">
        <span className="text-enterprise-500">{icon}</span>
        <span className="text-sm font-semibold text-enterprise-800">
          {title}
        </span>
      </div>
      <p className="text-sm text-enterprise-600 leading-relaxed ml-6">
        {content}
      </p>
    </div>
  )
}
