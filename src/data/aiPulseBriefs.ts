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
