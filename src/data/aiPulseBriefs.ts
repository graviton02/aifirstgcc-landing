import type { DailyBrief } from './aiPulseTypes'

// ──────────────────────────────────────────────
// TEMPLATE — copy, fill in, and paste at the top of the array
// ──────────────────────────────────────────────
// {
//   slug: 'YYYY-MM-DD',
//   date: 'YYYY-MM-DD',
//   editorHeadline: '',
//   topDevelopments: [
//     { headline: '', description: '', source: { label: '', url: '' } },
//     { headline: '', description: '', source: { label: '', url: '' } },
//     { headline: '', description: '', source: { label: '', url: '' } },
//   ],
//   useCase: { title: '', description: '', source: { label: '', url: '' } },
//   enterpriseImpact: [''],
//   opportunities: [{ title: '', description: '' }],
//   risks: [{ title: '', description: '' }],
// },
// ──────────────────────────────────────────────

export const dailyBriefs: DailyBrief[] = [
  {
    slug: '2026-01-30',
    date: '2026-01-30',
    editorHeadline:
      'Enterprise agentic AI adoption accelerates — governance, identity, and cost efficiency emerge as defining battlegrounds',
    topDevelopments: [
      {
        headline: 'Enterprise agentic AI adoption surges, with governance and identity risks emerging',
        description:
          'Recent studies and reporting show accelerated enterprise use of agentic AI systems but also highlight governance gaps and security concerns around identity and access for autonomous agents. Uncontrolled agent credentials and weak operational oversight pose new risks if organizations scale without sufficient safeguards.',
        source: {
          label: 'The Register',
          url: 'https://www.theregister.com/2026/01/29/ai_agent_identity_security/',
        },
      },
      {
        headline: 'Enterprise agentic AI linked to significant operational cost reductions',
        description:
          'Benchmark findings released today indicate that autonomous AI systems are replacing manual workflows across key enterprise functions — including operations, finance, and marketing — and delivering up to 38% reduction in operational costs in early adopter environments.',
        source: {
          label: 'Barchart',
          url: 'https://www.barchart.com/story/news/3731ew-report-agentic-ai-reduces-operational-costs-by-up-to-38',
        },
      },
      {
        headline: 'Databricks research highlights deepening enterprise agent use and governance benefits',
        description:
          'A new state-of-the-industry report from Databricks shows a sharp rise in coordinated AI agent use across workflows in global organizations, and underscores that strong governance correlates with higher production deployment rates for AI projects.',
        source: {
          label: 'Databricks',
          url: 'https://www.databricks.com/blog/enterprise-ai-agent-trends-top-use-cases-governance-evaluations-and-more',
        },
      },
    ],
    useCase: {
      title: 'AI-Driven Security Incident Triage and Response Acceleration',
      description:
        'Enterprises are deploying agentic AI to autonomously triage and correlate security alerts in real time, prioritizing threats and feeding contextual information into SOC workflows. These systems ingest telemetry from EDR, identity, network, email, and cloud sources, drastically reducing mean time to detect and respond by surfacing only verified high-priority issues for human analysts — enabling zero dwell investigated alerts.',
      source: {
        label: 'The Hacker News',
        url: 'https://thehackernews.com/2026/01/from-triage-to-threat-hunts-how-ai.html',
      },
    },
    enterpriseImpact: [
      'Operational acceleration meets governance pressure: Organizations are unlocking tangible cost and efficiency gains from autonomous agents, but GCCs and enterprise teams must prioritize identity, access, and behavioral governance to avoid security blind spots.',
      'GCCs become strategic hubs: With enterprise AI adoption increasing, GCCs are positioned to lead in agentic workflow integration, governance frameworks, and cost optimization, rather than traditional task execution.',
      'Shift from pilots to production discipline: Research indicates that structured governance practices directly correlate with successful agent deployments at scale — making governance expertise a differentiator for service delivery teams.',
    ],
    opportunities: [
      {
        title: 'Cost efficiency at scale',
        description:
          'Enterprises can achieve significant operational cost reductions by embedding autonomous agents into repeatable workflows across marketing, finance, and IT operations — unlocking headcount-agnostic scaling.',
      },
      {
        title: 'Differentiated GCC value via governance leadership',
        description:
          'GCCs that build and operationalize agentic AI governance frameworks, identity controls, and observability layers can position themselves as strategic partners in AI-driven transformation, rather than back-office execution centers.',
      },
      {
        title: 'Production-ready AI with measurable outcomes',
        description:
          'The latest enterprise data shows that automated workflows, when coupled with governance and monitoring, boost the percentage of AI projects moved into production, strengthening ROI realization.',
      },
    ],
    risks: [
      {
        title: 'Security and identity exposure',
        description:
          'Agent credentials and access control gaps can inadvertently grant broad, unchecked permissions, resulting in security blind spots and attack surfaces if not tightly governed.',
      },
      {
        title: 'Governance lag vs adoption pace',
        description:
          "Rapid agentic AI adoption continues to outpace enterprises' safety, governance, and compliance frameworks, leaving organizations vulnerable to operational and reputational risk.",
      },
      {
        title: 'Data management and integration challenges',
        description:
          'As agents act autonomously across domains, legacy data architectures may struggle to provide reliable and secure contextualized access, increasing risks around data integrity, compliance, and decision quality.',
      },
    ],
  },
  {
    slug: '2026-01-29',
    date: '2026-01-29',
    editorHeadline: 'Agentic AI shifts from pilot programs to production across security, operations, and enterprise deployments',
    topDevelopments: [
      {
        headline: 'Agent-based AI systems expand into live security and defense operations',
        description:
          'Autonomous, multi-agent systems are increasingly being deployed in real-world security and defense environments, handling coordination, prioritization, and decision support with human oversight rather than operating purely as experimental pilots.',
        source: {
          label: 'BusinessWire',
          url: 'https://www.businesswire.com/news/home/20260128851511/en/Palladyne-AI-Awarded-U.S.-Air-Force-Contract-to-Advance-Swarming-Capabilities-for-Integrated-Cross-Domain-Operations',
        },
      },
      {
        headline: 'Domain-specific AI models outperform general-purpose systems in production',
        description:
          'New AI models built for narrow domains such as weather forecasting, cybersecurity, and industrial monitoring are demonstrating higher accuracy and reliability than general-purpose models when deployed in production environments.',
        source: {
          label: 'Reuters',
          url: 'https://www.reuters.com/sustainability/climate-energy/hong-kong-scientists-launch-ai-model-better-predict-extreme-weather-20201-28/',
        },
      },
      {
        headline: 'Global AI leadership discussions shift from research to execution readiness',
        description:
          'Experts increasingly point out that long-term AI leadership depends less on model innovation and more on operational capabilities such as infrastructure, data pipelines, and deployment maturity.',
        source: {
          label: 'The Guardian',
          url: 'https://www.theguardian.com/world/2026/jan/28/china-lags-behind-us-at-ai-frontier-but-could-quickly-catch-up-say-experts',
        },
      },
    ],
    useCase: {
      title: 'Autonomous Security Operations (SecOps) Triage and Escalation',
      description:
        'AI agents are being used to continuously monitor security alerts, correlate signals across tools, and autonomously triage incidents. Only high-confidence threats are escalated to human analysts, reducing noise and response times in 24\u00d77 security operations. This use case is gaining adoption in large enterprises with complex security estates where manual triage has become a bottleneck.',
      source: {
        label: 'The Hacker News',
        url: 'https://thehackernews.com/2026/01/from-triage-to-threat-hunts-how-ai.html',
      },
    },
    enterpriseImpact: [
      'GCCs are increasingly expected to operate AI-enabled functions, not just support experimentation.',
      'Agent-based systems shift responsibility toward run, monitor, and govern models, rather than build-only roles.',
      'This accelerates demand for GCCs that can combine domain expertise, operational discipline, and AI oversight.',
    ],
    opportunities: [
      {
        title: 'Non-linear scale in operations',
        description:
          'Agent-based automation in security, IT operations, and finance enables GCCs to absorb higher workloads without proportional headcount growth.',
      },
      {
        title: 'Ownership of AI orchestration layers',
        description:
          'Enterprises are consolidating AI capabilities into internal platforms, creating opportunities for GCCs to own orchestration, monitoring, and optimization at scale.',
      },
      {
        title: 'Faster production deployment',
        description:
          'Domain-specific AI reduces experimentation cycles, allowing enterprises to move from proof-of-concept to production more quickly.',
      },
    ],
    risks: [
      {
        title: 'Governance gaps in autonomous systems',
        description:
          'Without clear escalation logic, audit trails, and decision boundaries, agent-based systems can introduce operational and compliance risks.',
      },
      {
        title: 'Vendor dependency and control loss',
        description:
          'Heavy reliance on external platforms may limit enterprise control over AI behavior, data flows, and long-term adaptability.',
      },
      {
        title: 'Blurry accountability models',
        description:
          'As AI systems take on decision-making roles, unclear ownership between business teams, IT, and GCCs can slow response during incidents.',
      },
    ],
  },
]
