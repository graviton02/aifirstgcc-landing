export interface ToolItem {
  key: string
  title: string
  description: string
  icon: string
  what: string
  why: string
  who: string[]
  how: string[]
  outcome: string
  ctaType: 'link' | 'download'
  ctaLabel: string
  ctaHref: string
  audience: string[]
}

export const tools: ToolItem[] = [
  {
    key: 'selfAssessment',
    title: 'AI-First GCC Self-Assessment',
    description:
      'A structured diagnostic framework that enables GCCs to objectively evaluate their readiness and maturity across seven transformation pillars — from strategy to impact.',
    icon: 'ClipboardCheck',
    what: 'The AI-First GCC Self-Assessment Tool is a structured diagnostic framework that enables Global Capability Centers (GCCs) to objectively evaluate their readiness and maturity across seven transformation pillars — from strategy to impact. It helps leadership identify strengths, capability gaps, and priority areas for improvement by systematically assessing vision, talent, technology, governance, innovation, and realized outcomes.',
    why: 'Provides a holistic view of maturity across strategy, people, process, and technology dimensions. Highlights where the GCC is leading, lagging, or misaligned to enterprise goals. Converts diagnostic findings into a prioritized transformation roadmap.',
    who: [
      'GCC leadership teams reviewing transformation progress',
      'Strategy and transformation offices conducting baseline assessments',
      'AI COEs and digital innovation teams evaluating maturity',
      'HR and L&D leaders designing capability-building programs',
    ],
    how: [
      'Conduct the assessment across diagnostic questions with five maturity options',
      'Generate maturity scores for each pillar and overall readiness',
      'Identify strengths & gaps with opportunity zones',
      'Develop action roadmap addressing talent, infrastructure, governance',
      'Review & reassess periodically to track progress',
    ],
    outcome:
      'A fact-driven readiness report that becomes the foundation for chartering the GCC\'s AI-First journey — ensuring every investment, initiative, and governance decision is anchored in data, alignment, and measurable progress.',
    ctaType: 'link',
    ctaLabel: 'Start Assessment',
    ctaHref: '/self-assessment',
    audience: ['GCC Leadership', 'Strategy', 'AI COE'],
  },
  {
    key: 'charter',
    title: 'AI-First Charter',
    description:
      'A structured framework that helps GCCs define their AI Vision, Governance, and Execution Blueprint — converting abstract AI ambitions into a tangible charter document.',
    icon: 'FileText',
    what: 'The AI-First Charter Tool is a structured framework that helps Global Capability Centers (GCCs) define their AI Vision, Governance, and Execution Blueprint. It guides GCC leadership through the process of articulating purpose, setting principles, establishing governance, prioritizing use cases, and operationalizing talent, technology, and ethics.',
    why: 'Establishes a unified AI vision across GCC, HQ, and business units. Translates scattered AI efforts into a cohesive charter with clear ownership and governance. Defines measurable objectives, decision rights, and review cadences for every AI investment.',
    who: [
      'GCC leadership developing an AI-first mandate',
      'Digital transformation offices formalizing AI governance',
      'AI COE and innovation teams creating scalable playbooks',
      'Risk, compliance, and data officers ensuring responsible AI use',
    ],
    how: [
      'Start with the Charter Template — define the why, vision, and guiding principles',
      'Set Strategic Objectives — translate principles into measurable KPIs',
      'Establish Governance — document AI Council, decision rights, and prioritization',
      'Define Data & Technology Foundations — clarify infrastructure and platforms',
      'Build Talent & Ecosystem Plans — identify key roles and partnerships',
      'Operationalize Value & Review — create scorecards and feedback loops',
    ],
    outcome:
      'A living AI-First Charter that connects purpose to execution, aligns leadership around shared principles, ensures ethical compliance, and creates measurable enterprise impact.',
    ctaType: 'download',
    ctaLabel: 'Download Template',
    ctaHref: '/tools/GCC AI Charter.pptx',
    audience: ['GCC Leadership', 'Digital Transformation', 'Compliance'],
  },
  {
    key: 'skillsTaxonomy',
    title: 'AI Skills Taxonomy',
    description:
      'A standardized reference model that enables GCCs to map, benchmark, and visualize the current proficiency levels of their workforce across critical AI skill areas.',
    icon: 'GraduationCap',
    what: 'The AI Skills Taxonomy Tool is a standardized reference model that enables Global Capability Centers (GCCs) to map, benchmark, and visualize the current proficiency levels of their workforce across critical AI skill areas. It helps teams capture an accurate snapshot of enterprise AI readiness by organizing skills into structured families and applying consistent proficiency rubrics.',
    why: 'Understand current AI capability distribution across functions and roles. Compare skill maturity across teams, locations, and business units. Identify priority areas for upskilling, hiring, or role redesign.',
    who: [
      'GCC capability leaders and practice heads',
      'HR and L&D teams designing AI skill programs',
      'PMOs and AI CoEs tracking capability evolution',
    ],
    how: [
      'Select Skill Family — AI Foundations, Data & ML Engineering, GenAI & Prompting, etc.',
      'Map relevant skills for your team or function',
      'Rate proficiency using the 5-level rubric (Awareness to Expert)',
      'Analyze & plan with gap identification and targeted upskilling',
    ],
    outcome:
      'A skills intelligence baseline for AI across the GCC — providing leaders with data-driven insight into where talent stands today and what capabilities must be built for tomorrow.',
    ctaType: 'download',
    ctaLabel: 'Download Taxonomy',
    ctaHref: '/tools/AI Skills Taxonomy (1).xlsx',
    audience: ['HR & L&D', 'Practice Heads', 'AI CoE'],
  },
  {
    key: 'workflowKit',
    title: 'Agentic Workflow Mapping Kit',
    description:
      'A structured framework for discovering, designing, and operationalizing autonomous AI agents within enterprise workflows — from discovery to governance to scaling.',
    icon: 'GitBranch',
    what: 'The Agentic Workflow Mapping Kit is a structured framework that helps GCCs identify, design, and operationalize autonomous and semi-autonomous AI agents within enterprise workflows. It guides teams through discovery, segmentation, design, governance, and scaling phases.',
    why: 'Translates abstract automation opportunities into clearly defined agentic roles and workflows. Integrates compliance, ethics, and escalation mechanisms directly into workflow blueprints. Provides reusable templates for rapid deployment across multiple business functions.',
    who: [
      'AI centers of excellence building enterprise-wide agent initiatives',
      'PMOs and transformation offices overseeing workflow redesign',
      'Function heads (IT, HR, finance, engineering) exploring AI optimization',
      'Risk, compliance, and governance teams ensuring responsible deployment',
    ],
    how: [
      'Workflow Discovery — map existing processes and stakeholder inputs',
      'Activity Segmentation — break workflows into atomic activities',
      'Agentic Fit Assessment — score autonomy potential and cognitive complexity',
      'Agent Design Canvas — blueprint each agent\'s role, tools, and triggers',
      'Governance & Guardrails — apply risk tiers and compliance frameworks',
      'Value Tracking & Scaling — measure impact and institutionalize success',
    ],
    outcome:
      'GCCs evolve into Agentic Transformation Hubs — orchestrating intelligent, compliant, and value-driven operations with a repeatable system for designing and scaling AI workflows.',
    ctaType: 'download',
    ctaLabel: 'Download Kit',
    ctaHref: '/tools/GCC AI Charter.pptx',
    audience: ['AI CoE', 'PMO', 'Enterprise Architects'],
  },
  {
    key: 'businessCase',
    title: 'Agent Business Case Template',
    description:
      'A structured framework for evaluating, justifying, and planning AI Agent initiatives — from problem definition to investment-ready business case.',
    icon: 'Calculator',
    what: 'The Agent Business Case Tool is a structured framework that helps Global Capability Centers (GCCs) evaluate, justify, and plan AI Agent initiatives. It walks teams through a step-by-step process to define the problem, quantify the value, assess risks, design a roadmap, and build a complete case for executive buy-in.',
    why: 'Provides executive-ready justification for AI agent investments. Aligns with the AI-First Charter, compliance, and risk policies. Brings together business, IT, and compliance teams in one process.',
    who: [
      'Business leaders evaluating ROI and impact',
      'Technology teams designing integrations and platforms',
      'Risk and compliance teams ensuring responsible AI use',
      'GCC leadership driving AI-first transformation',
    ],
    how: [
      'Start with the Template — define the problem, scope, and value',
      'Fill in Metrics & Data — quantify costs, savings, and adoption goals',
      'Assess Risks & Alternatives — document mitigations and fallback plans',
      'Finalize & Review — generate a business-ready case for decision-making',
    ],
    outcome:
      'Every AI Agent initiative moves from idea to investment-ready case with speed, structure, and strategic alignment.',
    ctaType: 'download',
    ctaLabel: 'Download Template',
    ctaHref: '/tools/Agent Business Case Template-2.pptx',
    audience: ['Business Leaders', 'Technology', 'Compliance'],
  },
  {
    key: 'useCaseCapture',
    title: 'Use Case Capture Form',
    description:
      'A structured intake form for capturing, categorizing, and documenting AI use cases across the enterprise — ensuring every opportunity is recorded with consistent detail.',
    icon: 'ClipboardList',
    what: 'The AI Use Case Capture Form is a standardized intake document that enables teams across the GCC to submit, describe, and categorize potential AI use cases. It captures business context, expected impact, data requirements, and stakeholder information in a consistent format.',
    why: 'Creates a single pipeline for AI opportunities across all functions. Ensures consistent documentation that accelerates evaluation and prioritization. Reduces duplicated efforts and surfaces cross-functional synergies.',
    who: [
      'Function heads submitting AI opportunities',
      'AI CoE teams managing the use case pipeline',
      'PMOs tracking transformation portfolio',
      'Business analysts documenting requirements',
    ],
    how: [
      'Download and distribute the capture form template',
      'Fill in use case details: business problem, expected outcome, data needs',
      'Submit to AI CoE or transformation office for review',
      'Track status through the prioritization pipeline',
    ],
    outcome:
      'A comprehensive, standardized pipeline of AI opportunities that enables data-driven prioritization and resource allocation across the GCC.',
    ctaType: 'download',
    ctaLabel: 'Download Form',
    ctaHref: '/tools/AI Use Case Capture Form.pptx',
    audience: ['All Functions', 'AI CoE', 'PMO'],
  },
  {
    key: 'useCasePrioritization',
    title: 'Use Case Prioritization Tool',
    description:
      'A scoring and ranking framework for evaluating AI use cases against business value, feasibility, risk, and strategic alignment — helping GCCs invest in the right initiatives.',
    icon: 'BarChart3',
    what: 'The AI Use Case Prioritization Tool is a multi-criteria decision framework that helps GCC leadership evaluate and rank AI use cases based on business value, technical feasibility, organizational readiness, risk profile, and strategic alignment.',
    why: 'Replaces gut-feel prioritization with structured scoring. Enables transparent trade-off decisions across competing initiatives. Aligns investment allocation with enterprise AI strategy and governance mandates.',
    who: [
      'GCC leadership making investment decisions',
      'AI CoE teams managing the use case portfolio',
      'PMOs and strategy offices allocating resources',
      'Steering committees reviewing transformation pipeline',
    ],
    how: [
      'Import captured use cases from the Capture Form',
      'Score each use case against weighted evaluation criteria',
      'Review rankings and adjust weights based on strategic priorities',
      'Select top-priority use cases for execution and resource allocation',
    ],
    outcome:
      'A prioritized, defensible portfolio of AI initiatives ranked by impact and feasibility — enabling GCCs to focus resources on the highest-value opportunities with clear executive justification.',
    ctaType: 'download',
    ctaLabel: 'Download Tool',
    ctaHref: '/tools/AI Use Case Prioritization Tool.pptx',
    audience: ['GCC Leadership', 'AI CoE', 'Strategy'],
  },
]
