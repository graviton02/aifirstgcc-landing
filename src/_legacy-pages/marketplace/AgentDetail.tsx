import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Bot,
  Star,
  ExternalLink,
  MapPin,
  Building2,
  Globe,
  MessageSquare,
  Lightbulb,
  Factory,
  Puzzle,
  TrendingUp,
  Play,
  ShieldCheck,
  Lock,
  CheckCircle2,
  SearchX,
  Layers,
  Cpu,
  Database,
} from 'lucide-react'
import { Container } from '@/components/shared/Container'
import { ContactProviderModal } from '@/components/shared/ContactProviderModal'
import { ShortlistButton } from '@/components/shared/ShortlistButton'
import { useAgentDetail, useAgentProvider } from '@/hooks/use-agents'
import { useUserRole } from '@/auth/useUserRole'
import { cn } from '@/lib/utils'
import type { Agent } from '@/types/agent'
import type { ProviderProfile } from '@/types/provider'

// TODO: Remove dummy data after visual validation
const DUMMY_AGENT: Agent = {
  id: 'dummy-001',
  agent_name: 'InvoiceFlow AI',
  tagline: 'Intelligent invoice processing that eliminates manual data entry',
  description:
    'InvoiceFlow AI is an enterprise-grade document intelligence agent that automates the entire accounts payable workflow. Using advanced OCR, NLP, and machine learning models, it extracts line-item data from invoices in any format — PDF, scanned images, or email attachments — matches them against purchase orders, flags discrepancies, and routes approvals automatically. Designed for organizations processing 500+ invoices per month, it reduces processing time by 85% while improving accuracy to 99.2%. The agent integrates seamlessly with major ERP systems including SAP, Oracle, and NetSuite, and learns your organization\'s specific coding rules and approval hierarchies over time.',
  category: 'Finance & Accounting',
  provider_profile_id: 'dummy-provider-001',
  logo_url: null,
  tags: ['Invoice Automation', 'AP Workflow', 'Document AI', 'ERP Integration', 'OCR'],
  use_cases: [
    {
      title: 'Automated Invoice Capture',
      description:
        'Ingest invoices from email, upload portals, and EDI feeds. Extract header and line-item data with 99%+ accuracy regardless of format or language.',
    },
    {
      title: 'PO Matching & Exception Handling',
      description:
        'Three-way match invoices against purchase orders and goods receipts. Automatically flag price variances, quantity mismatches, and duplicate submissions for review.',
    },
    {
      title: 'Smart Approval Routing',
      description:
        'Route invoices through configurable approval workflows based on amount thresholds, cost centers, and department rules. Escalate stale approvals automatically.',
    },
  ],
  industries: ['Financial Services', 'Healthcare', 'Manufacturing', 'Retail & E-Commerce', 'Government & Public Sector'],
  integration_type: 'API + Pre-built Connectors',
  supported_platforms: ['SAP S/4HANA', 'Oracle ERP Cloud', 'NetSuite', 'Microsoft Dynamics 365', 'QuickBooks Enterprise'],
  data_requirements:
    'Invoice documents (PDF, TIFF, PNG, or email), purchase order data via ERP API, and vendor master data. Initial setup requires a sample of 50 coded invoices for model calibration. All data is processed in your region and never leaves your cloud boundary.',
  impact_metrics: [
    { type: 'Processing Time', value: '85%', description: 'Reduction in average invoice processing time from receipt to payment' },
    { type: 'Accuracy Rate', value: '99.2%', description: 'Data extraction accuracy across all invoice formats and languages' },
    { type: 'Cost Savings', value: '$4.20', description: 'Average savings per invoice compared to manual processing at $6.10' },
    { type: 'Straight-Through Rate', value: '72%', description: 'Invoices processed end-to-end without human intervention' },
  ],
  demo_url: 'https://demo.invoiceflow.ai/sandbox',
  compliance_certifications: ['SOC 2 Type II', 'ISO 27001', 'GDPR Compliant'],
  security_features: ['End-to-End Encryption', 'Role-Based Access Control', 'Audit Trail Logging'],
  rating: 4.7,
  review_count: 28,
  status: 'active',
  created_at: '2025-11-15T00:00:00Z',
  updated_at: '2026-01-20T00:00:00Z',
}

const DUMMY_PROVIDER: ProviderProfile = {
  id: 'dummy-provider-001',
  user_id: 'dummy-user',
  organization_id: 'dummy-org',
  company_name: 'Nexus Automation',
  location: 'Dubai, UAE',
  company_size: '51-200',
  logo_url: null,
  website: 'https://nexusautomation.ai',
  category: 'tsp',
  status: 'approved',
  created_at: '2025-09-01T00:00:00Z',
  updated_at: '2025-09-01T00:00:00Z',
}

// ---------------------------------------------------------------------------

const USE_CASE_ICONS = [Lightbulb, Layers, Cpu]

export default function AgentDetail() {
  const { agentId } = useParams<{ agentId: string }>()
  const { data: realAgent, isLoading: agentLoading } = useAgentDetail(agentId)
  const agent = realAgent ?? DUMMY_AGENT // TODO: Remove fallback after validation
  const { data: realProvider, isLoading: providerLoading } = useAgentProvider(agent?.provider_profile_id)
  const provider = realProvider ?? DUMMY_PROVIDER // TODO: Remove fallback after validation

  const isLoading = agentLoading

  // 404
  if (!isLoading && !realAgent && agentId !== 'dummy-001' && !DUMMY_AGENT) {
    return <NotFoundState />
  }

  return (
    <div className="pt-28 pb-16 min-h-screen bg-gradient-to-b from-enterprise-50/60 via-white to-white">
      <Container size="wide">
        {/* Back link */}
        <Link
          to="/marketplace"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-enterprise-500 hover:text-enterprise-800 transition-colors mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
          Back to Marketplace
        </Link>

        {isLoading ? (
          <LoadingSkeleton />
        ) : (
          <div className="flex flex-col lg:flex-row gap-8 xl:gap-12">
            {/* ---- Main Content ---- */}
            <div className="flex-1 min-w-0">
              <HeroSection agent={agent} />

              <div className="mt-10 space-y-10">
                <OverviewSection description={agent.description} />

                {agent.use_cases.length > 0 && (
                  <UseCasesSection useCases={agent.use_cases} />
                )}

                {agent.industries.length > 0 && (
                  <IndustriesSection industries={agent.industries} />
                )}

                {(agent.integration_type || agent.supported_platforms.length > 0 || agent.data_requirements) && (
                  <HowItWorksSection agent={agent} />
                )}

                {agent.impact_metrics.length > 0 && (
                  <ImpactSection metrics={agent.impact_metrics} />
                )}

                {agent.demo_url && (
                  <DemoSection url={agent.demo_url} />
                )}

                {(agent.compliance_certifications.length > 0 || agent.security_features.length > 0) && (
                  <ComplianceSection
                    certifications={agent.compliance_certifications}
                    securityFeatures={agent.security_features}
                  />
                )}
              </div>
            </div>

            {/* ---- Sidebar ---- */}
            <div className="lg:w-[340px] xl:w-[360px] flex-shrink-0">
              <div className="lg:sticky lg:top-28">
                <ProviderSidebar provider={provider} agent={agent} isLoading={providerLoading && !realProvider} />
              </div>
            </div>
          </div>
        )}
      </Container>
    </div>
  )
}

// ===========================================================================
// Hero
// ===========================================================================

function HeroSection({ agent }: { agent: Agent }) {
  return (
    <div className="flex flex-col sm:flex-row items-start gap-5">
      {/* Logo */}
      {agent.logo_url ? (
        <img
          src={agent.logo_url}
          alt={agent.agent_name}
          className="w-20 h-20 rounded-2xl object-cover border border-enterprise-200 shadow-card flex-shrink-0"
        />
      ) : (
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-card">
          <Bot className="w-9 h-9 text-white" />
        </div>
      )}

      <div className="flex-1 min-w-0">
        {/* Name + Category */}
        <div className="flex flex-wrap items-center gap-3 mb-1.5">
          <h1 className="text-2xl sm:text-display-sm font-display font-bold text-enterprise-900 leading-tight">
            {agent.agent_name}
          </h1>
          <span className="inline-flex px-2.5 py-0.5 rounded-lg bg-purple-100 text-purple-700 text-xs font-semibold whitespace-nowrap">
            {agent.category}
          </span>
        </div>

        {/* Tagline */}
        {agent.tagline && (
          <p className="text-base text-enterprise-600 mt-1 leading-relaxed">{agent.tagline}</p>
        )}

        {/* Rating + Tags row */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-4">
          {agent.rating > 0 && (
            <div className="flex items-center gap-1.5">
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      'w-4 h-4',
                      i < Math.round(agent.rating)
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-enterprise-200 fill-enterprise-200',
                    )}
                  />
                ))}
              </div>
              <span className="text-sm font-semibold text-enterprise-800">{agent.rating.toFixed(1)}</span>
              <span className="text-sm text-enterprise-400">({agent.review_count} reviews)</span>
            </div>
          )}

          {agent.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {agent.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded-md bg-enterprise-100 text-enterprise-600 text-xs font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ===========================================================================
// Overview
// ===========================================================================

function OverviewSection({ description }: { description: string }) {
  return (
    <section>
      <SectionHeading title="Overview" />
      <p className="text-enterprise-600 leading-relaxed text-[15px]">{description}</p>
    </section>
  )
}

// ===========================================================================
// Use Cases
// ===========================================================================

function UseCasesSection({ useCases }: { useCases: Agent['use_cases'] }) {
  return (
    <section>
      <SectionHeading title="Use Cases" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {useCases.map((uc, i) => {
          const Icon = USE_CASE_ICONS[i % USE_CASE_ICONS.length]
          return (
            <div
              key={uc.title}
              className="rounded-xl border border-enterprise-200 bg-white p-5 hover:shadow-card transition-shadow"
            >
              <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center mb-3">
                <Icon className="w-4.5 h-4.5 text-purple-600" />
              </div>
              <h4 className="text-sm font-semibold text-enterprise-900 mb-1.5">{uc.title}</h4>
              <p className="text-xs text-enterprise-500 leading-relaxed">{uc.description}</p>
            </div>
          )
        })}
      </div>
    </section>
  )
}

// ===========================================================================
// Industries
// ===========================================================================

function IndustriesSection({ industries }: { industries: string[] }) {
  return (
    <section>
      <SectionHeading title="Industries Served" icon={Factory} />
      <div className="flex flex-wrap gap-2">
        {industries.map((ind) => (
          <span
            key={ind}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-enterprise-200 bg-white text-enterprise-700 text-sm font-medium shadow-sm"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
            {ind}
          </span>
        ))}
      </div>
    </section>
  )
}

// ===========================================================================
// How It Works
// ===========================================================================

function HowItWorksSection({ agent }: { agent: Agent }) {
  return (
    <section>
      <SectionHeading title="How It Works" icon={Puzzle} />

      <div className="space-y-5">
        {/* Integration type */}
        {agent.integration_type && (
          <div className="rounded-xl border border-enterprise-200 bg-white p-5">
            <div className="flex items-center gap-2 mb-2">
              <Puzzle className="w-4 h-4 text-purple-500" />
              <h4 className="text-sm font-semibold text-enterprise-800">Integration Type</h4>
            </div>
            <p className="text-sm text-enterprise-600">{agent.integration_type}</p>
          </div>
        )}

        {/* Supported platforms */}
        {agent.supported_platforms.length > 0 && (
          <div className="rounded-xl border border-enterprise-200 bg-white p-5">
            <div className="flex items-center gap-2 mb-3">
              <Layers className="w-4 h-4 text-purple-500" />
              <h4 className="text-sm font-semibold text-enterprise-800">Supported Platforms</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {agent.supported_platforms.map((p) => (
                <span
                  key={p}
                  className="px-3 py-1 rounded-lg bg-enterprise-50 border border-enterprise-100 text-enterprise-700 text-xs font-medium"
                >
                  {p}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Data requirements */}
        {agent.data_requirements && (
          <div className="rounded-xl border border-enterprise-200 bg-white p-5">
            <div className="flex items-center gap-2 mb-2">
              <Database className="w-4 h-4 text-purple-500" />
              <h4 className="text-sm font-semibold text-enterprise-800">Data Requirements</h4>
            </div>
            <p className="text-sm text-enterprise-500 leading-relaxed">{agent.data_requirements}</p>
          </div>
        )}
      </div>
    </section>
  )
}

// ===========================================================================
// Impact Metrics
// ===========================================================================

function ImpactSection({ metrics }: { metrics: Agent['impact_metrics'] }) {
  return (
    <section>
      <SectionHeading title="Impact Metrics" icon={TrendingUp} />
      <div className="grid gap-4 sm:grid-cols-2">
        {metrics.map((m) => (
          <div
            key={m.type}
            className="rounded-xl border border-enterprise-200 bg-white p-5 relative overflow-hidden"
          >
            <div
              className="absolute top-0 left-0 w-1 h-full rounded-r-full"
              style={{
                background: 'linear-gradient(180deg, #7c3aed 0%, #6366f1 100%)',
              }}
            />
            <p className="text-xs font-semibold text-purple-600 uppercase tracking-wider mb-1">{m.type}</p>
            <p className="text-2xl font-display font-bold text-enterprise-900 mb-1">{m.value}</p>
            <p className="text-xs text-enterprise-500 leading-relaxed">{m.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

// ===========================================================================
// Demo
// ===========================================================================

function DemoSection({ url }: { url: string }) {
  return (
    <section>
      <SectionHeading title="Live Demo" icon={Play} />
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-center gap-4 rounded-xl border border-purple-200 bg-gradient-to-r from-purple-50 to-indigo-50 p-5 hover:shadow-card transition-all"
      >
        <div className="w-12 h-12 rounded-xl bg-purple-600 flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-105 transition-transform">
          <Play className="w-5 h-5 text-white ml-0.5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-enterprise-900">Try the interactive demo</p>
          <p className="text-xs text-enterprise-500 truncate mt-0.5">{url}</p>
        </div>
        <ExternalLink className="w-4 h-4 text-enterprise-400 flex-shrink-0 group-hover:text-purple-600 transition-colors" />
      </a>
    </section>
  )
}

// ===========================================================================
// Compliance & Security
// ===========================================================================

function ComplianceSection({
  certifications,
  securityFeatures,
}: {
  certifications: string[]
  securityFeatures: string[]
}) {
  return (
    <section>
      <SectionHeading title="Compliance & Security" icon={ShieldCheck} />
      <div className="space-y-5">
        {certifications.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-enterprise-500 uppercase tracking-wider mb-3">Certifications</h4>
            <div className="flex flex-wrap gap-2.5">
              {certifications.map((cert) => (
                <span
                  key={cert}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-green-200 bg-green-50 text-green-800 text-xs font-semibold"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {cert}
                </span>
              ))}
            </div>
          </div>
        )}
        {securityFeatures.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-enterprise-500 uppercase tracking-wider mb-3">Security Features</h4>
            <div className="flex flex-wrap gap-2.5">
              {securityFeatures.map((feat) => (
                <span
                  key={feat}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-enterprise-200 bg-enterprise-50 text-enterprise-700 text-xs font-semibold"
                >
                  <Lock className="w-3.5 h-3.5" />
                  {feat}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

// ===========================================================================
// Provider Sidebar
// ===========================================================================

function ProviderSidebar({
  provider,
  agent,
  isLoading,
}: {
  provider: ProviderProfile | null
  agent: Agent
  isLoading: boolean
}) {
  const { role } = useUserRole()
  const [contactOpen, setContactOpen] = useState(false)

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-enterprise-200 bg-white p-6 animate-pulse shadow-card">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-enterprise-100" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-enterprise-100 rounded w-3/4" />
            <div className="h-3 bg-enterprise-100 rounded w-1/2" />
          </div>
        </div>
        <div className="space-y-3">
          <div className="h-10 bg-enterprise-100 rounded-xl" />
          <div className="h-10 bg-enterprise-100 rounded-xl" />
        </div>
      </div>
    )
  }

  if (!provider) return null

  const categoryLabel = provider.category === 'tsp' ? 'Technology Services' : 'Startup'
  const isGcc = role === 'gcc'

  return (
    <>
      <div className="rounded-2xl border border-enterprise-200 bg-white shadow-card overflow-hidden">
        {/* Decorative top bar */}
        <div className="h-1.5 bg-gradient-to-r from-purple-500 via-indigo-500 to-purple-600" />

        <div className="p-6">
          {/* Provider info */}
          <div className="flex items-center gap-3 mb-4">
            {provider.logo_url ? (
              <img
                src={provider.logo_url}
                alt={provider.company_name}
                className="w-12 h-12 rounded-xl object-cover border border-enterprise-200"
              />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-enterprise-100 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-enterprise-400" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-enterprise-900 truncate">{provider.company_name}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3 text-enterprise-400 flex-shrink-0" />
                <p className="text-xs text-enterprise-500 truncate">{provider.location}</p>
              </div>
            </div>
          </div>

          {/* Category badge */}
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-enterprise-50 text-enterprise-600 text-xs font-medium mb-5">
            <Building2 className="w-3 h-3" />
            {categoryLabel}
          </span>

          {/* Action buttons */}
          <div className="space-y-2.5">
            {isGcc ? (
              <button
                onClick={() => setContactOpen(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700 transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                Contact Provider
              </button>
            ) : (
              <button
                disabled
                title="Sign in as a GCC organization to contact providers"
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 text-white text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                Contact Provider
              </button>
            )}
            <ShortlistButton agentId={agent.id} variant="full" />
          </div>

          {/* Website */}
          {provider.website && (
            <a
              href={provider.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 mt-4 pt-4 border-t border-enterprise-100 text-xs font-medium text-purple-600 hover:text-purple-700 transition-colors"
            >
              <Globe className="w-3.5 h-3.5" />
              Visit website
              <ExternalLink className="w-3 h-3 ml-auto" />
            </a>
          )}
        </div>
      </div>

      {isGcc && (
        <ContactProviderModal
          isOpen={contactOpen}
          onClose={() => setContactOpen(false)}
          provider={provider}
          agent={agent}
        />
      )}
    </>
  )
}

// ===========================================================================
// Section heading helper
// ===========================================================================

function SectionHeading({
  title,
  icon: Icon,
}: {
  title: string
  icon?: React.ComponentType<{ className?: string }>
}) {
  return (
    <div className="flex items-center gap-2 mb-4">
      {Icon && <Icon className="w-4.5 h-4.5 text-purple-500" />}
      <h3 className="text-lg font-display font-bold text-enterprise-900">{title}</h3>
    </div>
  )
}

// ===========================================================================
// Loading skeleton
// ===========================================================================

function LoadingSkeleton() {
  return (
    <div className="flex flex-col lg:flex-row gap-8 xl:gap-12 animate-pulse">
      {/* Main */}
      <div className="flex-1">
        <div className="flex items-start gap-5 mb-10">
          <div className="w-20 h-20 rounded-2xl bg-enterprise-100" />
          <div className="flex-1 space-y-3">
            <div className="h-7 bg-enterprise-100 rounded w-2/3" />
            <div className="h-4 bg-enterprise-100 rounded w-1/2" />
            <div className="flex gap-2">
              <div className="h-5 bg-enterprise-100 rounded w-16" />
              <div className="h-5 bg-enterprise-100 rounded w-14" />
              <div className="h-5 bg-enterprise-100 rounded w-20" />
            </div>
          </div>
        </div>
        <div className="space-y-3">
          <div className="h-4 bg-enterprise-100 rounded w-full" />
          <div className="h-4 bg-enterprise-100 rounded w-5/6" />
          <div className="h-4 bg-enterprise-100 rounded w-4/6" />
        </div>
        <div className="grid gap-4 sm:grid-cols-3 mt-10">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-36 bg-enterprise-100 rounded-xl" />
          ))}
        </div>
      </div>
      {/* Sidebar */}
      <div className="lg:w-[340px]">
        <div className="rounded-2xl border border-enterprise-200 bg-white p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-enterprise-100" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-enterprise-100 rounded w-3/4" />
              <div className="h-3 bg-enterprise-100 rounded w-1/2" />
            </div>
          </div>
          <div className="space-y-3">
            <div className="h-10 bg-enterprise-100 rounded-xl" />
            <div className="h-10 bg-enterprise-100 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  )
}

// ===========================================================================
// 404 state
// ===========================================================================

function NotFoundState() {
  return (
    <div className="pt-28 pb-16 min-h-screen">
      <Container>
        <div className="text-center max-w-md mx-auto py-20">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-enterprise-100 mb-5">
            <SearchX className="w-7 h-7 text-enterprise-400" />
          </div>
          <h1 className="text-xl font-display font-bold text-enterprise-900 mb-2">Agent not found</h1>
          <p className="text-sm text-enterprise-500 mb-6">
            This agent may have been removed or the link may be incorrect.
          </p>
          <Link
            to="/marketplace"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Marketplace
          </Link>
        </div>
      </Container>
    </div>
  )
}
