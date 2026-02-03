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
    slug: '2026-02-03',
    date: '2026-02-03',
    editorHeadline:
      'Singapore\u2019s governance framework, AWS\u2013NTT Data agentic AI pact, and Databricks\u2019 infrastructure reality check define the enterprise AI agenda',
    topDevelopments: [
      {
        headline: 'Singapore releases world\u2019s first agentic AI governance framework',
        description:
          'Singapore unveiled a national agentic AI governance framework designed to guide enterprises in operationalizing autonomy with structured accountability, technical controls, and human oversight. A multi\u2011country ASEAN initiative is now helping companies interpret and implement the framework across regulated environments.',
        source: {
          label: 'PR Newswire',
          url: 'https://www.prnewswire.com/apac/news-releases/singapore-launches-worlds-first-agentic-ai-governance-framework-302675601.html',
        },
      },
      {
        headline: 'NTT Data and AWS sign multi\u2011year agentic AI agreement',
        description:
          'NTT Data partnered with Amazon Web Services (AWS) in a multi\u2011year agreement to help enterprises modernise legacy infrastructure and adopt responsible agentic AI. The collaboration aims to accelerate cloud migrations and embed agentic systems into scalable, secure enterprise architecture.',
        source: {
          label: 'Tahawul Tech',
          url: 'https://www.tahawultech.com/home-slide/ntt-datamulti-year-agentic-ai-agreement/',
        },
      },
      {
        headline: 'Databricks highlights governance as key barrier to agentic AI scale',
        description:
          'A Databricks report published today underscores that enterprises have progressed with generative AI, but fragmented data infrastructure and governance remain the top constraints to scaling agentic AI into reliable operational workflows.',
        source: {
          label: 'Databricks',
          url: 'https://www.databricks.com/blog/infrastructure-strategies-driving-next-wave-enterprise-ai',
        },
      },
    ],
    useCase: {
      title: 'Autonomous Incident Detection and Remediation in Enterprise IT Operations',
      description:
        'Large enterprises are deploying agentic AI agents as real\u2011time systems of record for IT operations. These agents continuously ingest event streams and telemetry from cloud environments, detect anomalies across distributed services, and initiate remediation actions \u2014 e.g., restarting failed containers, scaling services, or adjusting network rules \u2014 while escalating only critical or novel conditions to human engineers. In contrast with traditional alert\u2011based systems, these agents execute goal\u2011oriented actions with guardrails defined by policy engines, reducing mean time to resolution (MTTR) by automating detection, prioritization, and response across the stack. This real, non\u2011vendor deployment reflects how organizations operationalize AI autonomy to drive measurable uptime and reliability improvements.',
      source: {
        label: 'Databricks',
        url: 'https://www.databricks.com/blog/infrastructure-strategies-driving-next-wave-enterprise-ai',
      },
    },
    enterpriseImpact: [
      'Governance enters enterprise risk mandates: Singapore\u2019s framework signals that policy\u2011led governance will move from internal best practice to regulated expectation, forcing enterprises and GCCs to formalize controls for autonomous systems.',
      'Cloud and legacy modernisation accelerates: The AWS + NTT Data collaboration illustrates a broader shift: modernisation is a prerequisite for agentic AI, with legacy environments re\u2011architected to support secure, autonomous execution.',
      'Data and governance now strategic differentiators: Databricks\u2019 analysis confirms that once enterprises solve governance and data architecture, they unlock scalable agent workflows \u2014 not just pilots. Successful GCCs will lead this shift.',
    ],
    opportunities: [
      {
        title: 'Governance\u2011driven operational maturity',
        description:
          'Frameworks like Singapore\u2019s provide a template for actionable guardrails, enabling organizations to scale autonomy with compliance, auditability, and performance measurement.',
      },
      {
        title: 'Autonomous execution in core IT services',
        description:
          'Agentic agents deployed in operations, security, and service delivery create closed\u2011loop automation that significantly improves reliability and responsiveness at scale.',
      },
      {
        title: 'Modernisation as competitive edge',
        description:
          'Partnerships such as AWS + NTT Data demonstrate that aligning cloud infrastructure with agentic AI unlocks higher\u2011order automation, positioning GCCs as strategic enterprise transformation hubs.',
      },
      {
        title: 'Data governance as deployment foundation',
        description:
          'Enterprises unifying data, analytics, and AI under a governed, contextual layer are better positioned to shift agentic models from experimentation to production.',
      },
    ],
    risks: [
      {
        title: 'Governance lags behind adoption',
        description:
          'While adoption is growing rapidly, governance structures and controls are still immature in most enterprises; this gap introduces operational risk, regulatory exposure, and auditability blind spots.',
      },
      {
        title: 'Fragmented infrastructure limits reliability',
        description:
          'Legacy systems and siloed data create brittle foundations for agentic execution, risking unreliable action and undermining trust in autonomous systems.',
      },
      {
        title: 'Cost and token economics pressure budgets',
        description:
          'As enterprise agents make more requests and execute deeper logic chains, token consumption and compute usage escalate, prompting the need for AI FinOps and real\u2011time cost accountability.',
      },
      {
        title: 'Talent and skills shortages',
        description:
          'Strong demand for agentic AI engineering and governance roles is outpacing supply, challenging GCCs and enterprises to build and retain the talent necessary for deployment at scale.',
      },
    ],
  },
  {
    slug: '2026-02-02',
    date: '2026-02-02',
    editorHeadline:
      'Singapore sets global precedent with agentic AI governance framework as enterprise adoption surges ahead of security readiness',
    topDevelopments: [
      {
        headline: 'Singapore launches world\u2019s first agentic AI governance framework',
        description:
          'Singapore has introduced the first national governance framework for agentic AI, aimed at helping enterprises adopt autonomous AI with structured risk, security, and accountability requirements. Regional industry partners including Microsoft are collaborating to help organisations operationalise the new standards. This marks a milestone in formalising governance for autonomous systems beyond pilots into regulated environments.',
        source: {
          label: 'PR Newswire',
          url: 'https://www.prnewswire.com/apac/news-releases/singapore-launches-worlds-first-agentic-ai-governance-framework-302675602.html',
        },
      },
      {
        headline: 'Databricks reports surge in AI agent adoption despite governance gaps',
        description:
          'New findings from Databricks\u2019 2026 State of AI Agents report show a significant increase in enterprise use of autonomous AI agents. Organisations are rapidly transitioning from simple chatbots to multi\u2011agent systems that reason, plan, and execute across business workflows, even as governance and production scaling remain bottlenecks for many.',
        source: {
          label: 'SiliconANGLE',
          url: 'https://siliconangle.com/2026/01/27/databricks-reports-finds-surge-ai-agent-adoption-despite-governance-bottlenecks',
        },
      },
      {
        headline: 'Security teams rethinking architectures for autonomous AI agents',
        description:
          'Enterprise security is confronting fundamental challenges as autonomous AI agents gain decision\u2011making ability and access to sensitive cloud systems. New reporting underscores how traditional InfoSec and SaaS security models were not designed for machine actors with autonomous behaviour, increasing risk exposure and prompting reevaluation of identity and runtime protections.',
        source: {
          label: 'WebProNews',
          url: 'https://www.webpronews.com/the-collision-course-how-agentic-ai-forces-infosec-and-saas-teams-to-rethink-enterprise-data-protection/',
        },
      },
    ],
    useCase: {
      title: 'Automated Regulatory and Risk Reporting with AI Agents',
      description:
        'Large financial and compliance organisations are deploying autonomous AI agents to generate, validate, and submit regulatory reports across multiple jurisdictions. These agents connect to core databases, interpret regulatory text, reconcile transaction and audit data, and produce structured filings. Instead of manual compilation and verification, agents run continuous monitoring and produce compliant reports with built\u2011in audit trails, reducing cycle time by over 60% and improving accuracy for high\u2011volume, cross\u2011border reporting functions. This real enterprise use case illustrates how agentic systems extend beyond assistance to operational execution in governance\u2011critical domains.',
      source: {
        label: 'Intelligent CIO',
        url: 'https://www.intelligentcio.com/north-america/2026/01/08/top-10-predictions-for-2026-how-agentic-ai-erp-will-redefine-the-enterprise/',
      },
    },
    enterpriseImpact: [
      'Governance becomes a competitive imperative: National frameworks like Singapore\u2019s signal that governments are now formalising expectations for agentic AI oversight \u2014 pushing enterprises and GCCs to build or mature governance functions immediately.',
      'Transition into production accelerates: Databricks\u2019 data reveals enterprises are not just experimenting but deploying multi\u2011agent AI strategically, even though many have not yet fully governed production workflows in place.',
      'Security posture overhaul: As autonomous agents act within core SaaS and cloud environments, traditional security models are inadequate \u2014 requiring enterprises and GCCs to adopt agent\u2011aware identity, monitoring, and risk controls.',
    ],
    opportunities: [
      {
        title: 'Governance\u2011first enterprise strategy',
        description:
          'Formal frameworks and standards emerging at national and industry levels offer enterprises a roadmap to scale agentic AI with accountability and compliance baked in \u2014 allowing GCCs to differentiate by expertise in governance, risk, and compliance (GRC) integration.',
      },
      {
        title: 'Operational scale\u2011up with autonomous execution',
        description:
          'As organisations transition from pilots to multi\u2011agent systems across ERP, risk, finance, and security workflows, there\u2019s a clear path to productivity and speed gains, enabling GCCs to drive measurable outcomes rather than incremental automation.',
      },
      {
        title: 'Embedding AI in core data and decision infrastructure',
        description:
          'Multi\u2011agent AI is reshaping core infrastructure \u2014 such as auto\u2011generation of databases and real\u2011time planning processes \u2014 offering GCCs the chance to architect data\u2011centric platforms tuned for autonomous execution.',
      },
    ],
    risks: [
      {
        title: 'Shadow agents and security blind spots',
        description:
          'Independent agent proliferation across systems can bypass conventional SecOps controls, creating invisible actors with access to sensitive systems. Without identity\u2011anchored governance, this increases attack surfaces and compliance gaps.',
      },
      {
        title: 'Production scalability constraints',
        description:
          'Despite rapid adoption, only a segment of enterprises have effectively deployed agentic AI at full scale. Common bottlenecks include governance, evaluation rigor, and infrastructure maturity \u2014 leading to stalled ROI for many organisations.',
      },
      {
        title: 'Data infrastructure as a bottleneck',
        description:
          'Agentic systems expose underlying data fragilities; without real\u2011time, reliable database frameworks and telemetry, agents can produce inconsistent outcomes or drift from intended business logic, amplifying operational risk.',
      },
    ],
  },
  {
    slug: '2026-01-31',
    date: '2026-01-31',
    editorHeadline:
      'Enterprise data architectures and security models face urgent rethinking as agentic AI scales into production workflows',
    topDevelopments: [
      {
        headline: 'New enterprise data architecture demands emerge for agentic AI scaling',
        description:
          'As enterprises increasingly deploy autonomous agents, traditional centralized data infrastructures are proving inadequate. Emerging best practices emphasize distributed, governance\u2011centric architectures to support real\u2011time agent decisions, observability, and security \u2014 highlighting that data readiness, not model capability, is the chief bottleneck in scaling AI at enterprise scale.',
        source: {
          label: 'Frontier Enterprise',
          url: 'https://www.frontier-enterprise.com/building-data-architectures-for-agentic-ai-success/',
        },
      },
      {
        headline: 'Security risk spotlight: agentic AI exposes perimeter blind spots',
        description:
          'Recent analysis reveals that unmanaged AI agents, operating inside authorized permissions, can bypass traditional security controls \u2014 creating \u201Cblind spots\u201D for enterprise defenses and exposing API keys or credentials. This raises immediate concerns for governance, identity, and risk teams as agentic systems move into production environments.',
        source: {
          label: 'VentureBeat',
          url: 'https://venturebeat.com/security/openclaw-agentic-ai-security-risk-ciso-guide/',
        },
      },
      {
        headline: 'Mastercard and enterprise players advance agentic AI integration guidance',
        description:
          'Major enterprise players, including Mastercard, are announcing new frameworks and capabilities to help businesses integrate agentic AI into operations, signalling that the market is transitioning from experimentation to practical deployment strategies across real\u2011world workflows.',
        source: {
          label: 'CIO Africa',
          url: 'https://cioafrica.co/mastercard-unveils-agent-suite-to-support-enterprise-adoption-of-agentic-ai/',
        },
      },
    ],
    useCase: {
      title: 'AI\u2011Driven ERP Workflow Automation with Agentic Agents',
      description:
        'Enterprises are now integrating autonomous agents directly into core ERP processes \u2014 not just for analytics but for active decisioning and execution. Examples include AI agents automatically coordinating order processing, inventory adjustments, and exception management within ERP systems. These agents interact with transactional data, apply business rules, and execute outcomes while logging audit trails \u2014 enabling reduced cycle times, fewer manual handoffs, and scalability across finance and supply chain functions. Real adoption stories show reduced processing times and operational cost gains as core systems become autonomously responsive to change.',
      source: {
        label: 'Intelligent CIO',
        url: 'https://www.intelligentcio.com/north-america/2026/01/08/top-10-predictions-for-2026-how-agentic-ai-erp-will-redefine-the-enterprise/',
      },
    },
    enterpriseImpact: [
      'Data and governance now strategic imperatives: As agentic AI systems proliferate beyond pilots into operational workflows, enterprises and GCCs must evolve data architectures and governance models to ensure reliability and compliance.',
      'Security teams face new attack surfaces: Traditional perimeter controls are insufficient for autonomous agents that make decisions and execute actions, driving demand for identity\u2011centric risk frameworks and runtime observability.',
      'GCCs become enablers of enterprise\u2011wide AI deployment: With players like Mastercard operationalizing agentic AI guidance, GCCs are positioned to lead enterprise integration, monitoring, and orchestration of agentic workflows \u2014 moving beyond support functions into strategic automation roles.',
    ],
    opportunities: [
      {
        title: 'Autonomous process orchestration at scale',
        description:
          'Agentic AI embedded in core systems such as ERP can transform routine operational workflows into seamlessly automated sequences, enabling productivity gains and faster cycle times across finance, supply chain, and service functions.',
      },
      {
        title: 'Next\u2011gen data infrastructure and governance leadership',
        description:
          'Enterprises and GCCs that build distributed, real\u2011time data architectures tailored for agentic AI can unlock strategic advantages in observability, reliability, and compliance \u2014 accelerating AI adoption across units.',
      },
      {
        title: 'Strategic value creation beyond cost reduction',
        description:
          'As agentic AI moves into revenue\u2011impacting functions like customer decisioning, order orchestration, and predictive operations, GCCs can capture higher value roles in innovation, strategy, and business outcome delivery.',
      },
    ],
    risks: [
      {
        title: 'Security governance gaps with autonomous agents',
        description:
          'Agentic systems operating with granted permissions can evade traditional detection, exposing enterprises to unauthorized actions, credential leakage, and audit blind spots unless identity and runtime controls are strengthened.',
      },
      {
        title: 'Data architecture bottlenecks',
        description:
          'Legacy, centralized data systems are ill\u2011equipped for real\u2011time, autonomous AI decisioning, creating latency, quality, and integration challenges that hamper execution reliability and visibility.',
      },
      {
        title: 'Operational complexity and model risk',
        description:
          'As agents coordinate multi\u2011step processes, governance and compliance frameworks must keep pace to manage decision boundaries, explainability, and rollback mechanisms \u2014 gaps in these areas can lead to amplified mistakes at scale.',
      },
    ],
  },
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
