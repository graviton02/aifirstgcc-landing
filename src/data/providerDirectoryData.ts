// Provider Directory Data
// Contains all 27 curated service provider profiles for the Provider Directory page

export type ProviderSummary = {
  id: string
  name: string
  category: string
  tagline: string
  locations: string
  employees: string
  logo?: string
  detail?: ProviderDetail
}

export type ProviderDetail = {
  overview: Array<{ label: string; value: string }>
  analystSummary: string
  positioning: string[]
  capabilities: Array<{ category: string; description: string }>
  flagship: Array<{ platform: string; purpose: string; feature: string }>
  proofPoints: string[]
  analystTake?: string
  notes?: string
}

export const providerData: ProviderSummary[] = [
  // === PROVIDER 1: Accenture ===
  {
    id: 'accenture',
    name: 'Accenture',
    category: 'Enterprise AI & Agentic Transformation',
    tagline: 'Enterprise Reinvention through Responsible, Agentic AI.',
    locations: 'Dublin HQ • India: Bengaluru, Hyderabad, Pune, Gurugram',
    employees: '750,000+ employees',
    logo: '/providers/Accenture.png',
    detail: {
      overview: [
        { label: 'Category', value: 'Enterprise AI & Agentic Transformation' },
        { label: 'Headquarters', value: 'Dublin, Ireland' },
        { label: 'India Presence', value: 'Bengaluru, Hyderabad, Pune, Gurugram' },
        { label: 'Founded', value: '1989' },
        { label: 'Employees', value: '750,000+ globally' },
        { label: 'AI Focus Tagline', value: 'Enterprise Reinvention through Responsible, Agentic AI.' }
      ],
      analystSummary:
        'Accenture represents the benchmark for scaled, industrialized AI delivery in global enterprises. Its narrative centers on "Enterprise Reinvention powered by AI", emphasizing AI as the next foundational layer of digital transformation. Accenture\'s approach integrates data readiness, responsible governance, and multi-agent orchestration — operationalizing AI beyond pilots into enterprise-grade programs. The firm\'s AI Refinery platform and Distiller agentic SDKs form the backbone of its agentic delivery architecture, supported by deep hyperscaler alliances (Microsoft, Google, AWS, NVIDIA). Its combination of proprietary IP, responsible AI frameworks, and workforce-wide AI literacy programs differentiates it as a systemic AI enabler rather than a tactical services provider.',
      positioning: [
        'AI as the Core of Reinvention: AI positioned not as a capability, but as the new operating model for enterprises.',
        'Governed Agentic Ecosystems: Flagship frameworks (AI Refinery, Distiller) enable orchestrated, multi-agent systems with compliance built in.',
        'Responsible AI by Design: Embedded across every delivery unit, reinforced by a formal Responsible AI Toolkit.',
        'Scale + Ecosystem Power: $3B AI investment, 450+ agents live on partner marketplaces, deep partnerships with hyperscalers.',
        'Proof by Practice: Demonstrates maturity through internal adoption (AI Refinery for Marketing, Agentic Workforce pilots).'
      ],
      capabilities: [
        { category: 'AI Advisory & Reinvention', description: 'C-suite programs anchored around AI Navigator for Enterprise; roadmap and ROI modeling for AI transformation.' },
        { category: 'Platformized Delivery', description: 'Industrialized platforms (AI Refinery, SynOps) enable repeatable, governed deployments across industries.' },
        { category: 'Agentic AI Systems', description: 'Distiller and Trusted Agent Huddle frameworks for multi-agent orchestration with lifecycle governance.' },
        { category: 'Responsible AI & Compliance', description: 'Bias detection, explainability, audit trails, and ethical AI embedded in design and delivery.' },
        { category: 'Industry Packs', description: 'Sector-specific agent templates (12+ verticals) including healthcare, retail, manufacturing, BFSI.' }
      ],
      flagship: [
        { platform: 'AI Refinery', purpose: 'Core orchestration layer for enterprise AI', feature: 'Multi-agent orchestration, model governance, prebuilt connectors' },
        { platform: 'Distiller SDKs', purpose: 'Developer toolkit for agentic workflows', feature: 'SDKs for agent lifecycle, communication, distillation' },
        { platform: 'SynOps', purpose: 'Intelligent operations backbone', feature: 'AI copilots for finance, HR, and shared services' },
        { platform: 'LearnVantage', purpose: 'Workforce AI fluency platform', feature: 'Role-based AI learning and certification' },
        { platform: 'GenWizard', purpose: 'Application modernization engine', feature: 'AI-led code refactoring and risk control' }
      ],
      proofPoints: [
        '450+ enterprise AI agents in live production across client engagements.',
        '$3B investment in AI over three years to scale infrastructure and R&D.',
        'AI Refinery for Industry launched with prebuilt agents in manufacturing, BFSI, and healthcare.',
        'Internal productivity impact: Accenture reports measurable uplift in marketing and finance functions through agentic pilots.'
      ],
      analystTake:
        'Accenture\'s differentiation is systemic scale — AI embedded in every layer of its delivery architecture, talent engine, and client engagement model. Its agentic evolution (via Distiller and AI Refinery) positions it as one of the few providers capable of operationalizing AI ecosystems rather than isolated use cases. For GCCs, Accenture provides a clear blueprint for AI-native operations, offering frameworks, governance structures, and industry maturity that make it the de facto reference model for large-scale AI enablement.'
    }
  },

  // === PROVIDER 2: TCS ===
  {
    id: 'tcs',
    name: 'Tata Consultancy Services',
    category: 'Enterprise AI & Agentic Transformation',
    tagline: 'Bringing AI into the fabric of the enterprise.',
    locations: 'Mumbai HQ • India: Pan-India delivery centers',
    employees: '600,000+ employees',
    logo: '/providers/TCS.png',
    detail: {
      overview: [
        { label: 'Category', value: 'Enterprise AI & Agentic Transformation' },
        { label: 'Headquarters', value: 'Mumbai, India' },
        { label: 'India Presence', value: 'Mumbai, Bengaluru, Hyderabad, Pune, Chennai, Kolkata, Delhi-NCR' },
        { label: 'Founded', value: '1968' },
        { label: 'Employees', value: '600,000+ globally' },
        { label: 'AI Focus Tagline', value: 'Bringing AI into the fabric of the enterprise.' }
      ],
      analystSummary:
        'TCS positions itself as a large-scale AI transformation partner with deep enterprise integration capability across IT, operations, and industry domains. Its narrative centers on "Bringing AI into the fabric of the enterprise" - emphasizing foundation model engineering, responsible AI, and industry-contextualized solutions built on its Business 4.0 and Machine First frameworks. TCS blends hyperscaler-native services with proprietary accelerators like TCS Cognix, ignio (via Digitate), and the TCS AI.Cloud Suite to enable governed, scalable AI deployments across global enterprises.',
      positioning: [
        'AI as a Fabric Layer: AI is positioned as a pervasive layer across applications, infrastructure, and business processes under the Machine First Delivery Model.',
        'Responsible AI Integration: Ethical governance, risk controls, data lineage, and domain-compliant guardrails embedded in all AI programs.',
        'Platformized Transformation: Cognix and AI.Cloud Suite provide modular AI building blocks for industry-specific transformation.',
        'Industrialized AI Operations: Digitate\'s ignio enables autonomous operations, predictive remediation, and AI-driven SRE at scale.',
        'Scale + Global Delivery Model: 600,000+ workforce, deep domain consulting, and hyper-scaled delivery centers enable end-to-end AI lifecycle execution.',
        'Ecosystem Partnerships: Long-standing, deep hyperscaler partnerships accelerate enterprise-grade modernization and generative AI adoption.'
      ],
      capabilities: [
        { category: 'AI Advisory & Reinvention', description: 'Enterprise-scale AI visioning, maturity assessment, ROI modeling, data readiness, and responsible adoption strategies.' },
        { category: 'Platformized Delivery', description: 'Cognix and TCS AI.Cloud frameworks provide prebuilt components and accelerators for governed AI deployment across industries.' },
        { category: 'Agentic AI Systems', description: 'Multi-agent architectures for IT operations, customer experience, supply chain, and financial services, powered by ignio and service orchestration layers.' },
        { category: 'Responsible AI & Compliance', description: 'Bias controls, model explainability, audit trails, and industry-specific compliance for BFSI, healthcare, and telecom.' },
        { category: 'Industry Packs', description: 'Sector AI templates across BFSI, retail, manufacturing, life sciences, telecom, energy, and public sector.' }
      ],
      flagship: [
        { platform: 'Cognix', purpose: 'Digital transformation platform', feature: 'Prebuilt AI modules for IT, BFSI, manufacturing, CX' },
        { platform: 'ignio (Digitate)', purpose: 'Autonomous enterprise operations', feature: 'Self-healing IT ops, predictive remediation, agentic workflows' },
        { platform: 'TCS AI.Cloud Suite', purpose: 'Cloud-native AI enablement', feature: 'Foundation model accelerators, data governance, deployment pipelines' },
        { platform: 'TCS TwinX', purpose: 'Enterprise digital twin platform', feature: 'Scenario simulation, risk modeling, large-scale experimentation' },
        { platform: 'TCS Customer Intelligence & Insights', purpose: 'Customer analytics engine', feature: 'AI-led hyper-personalization, segmentation, churn modeling' },
        { platform: 'TCS MasterCraft', purpose: 'Modernization & governance', feature: 'AI-assisted code refactoring, lifecycle automation' }
      ],
      proofPoints: [
        'Thousands of enterprise AI deployments across IT operations, BFSI, telecom, and retail.',
        'Significant AI investment focused on foundation models, autonomous operations, and cloud-native accelerators.',
        'Cognix adoption across global Fortune 500 clients driving measurable reductions in operational effort and improved process efficiency.',
        'ignio scaled globally, recognized for its autonomous enterprise capabilities and predictive ops performance.'
      ]
    }
  },

  // === PROVIDER 3: Infosys ===
  {
    id: 'infosys',
    name: 'Infosys',
    category: 'Enterprise AI & Agentic Transformation',
    tagline: 'AI-first enterprise modernization powered by Topaz.',
    locations: 'Bengaluru HQ • Global delivery network',
    employees: '320,000+ employees',
    logo: '/providers/Infosys.webp',
    detail: {
      overview: [
        { label: 'Category', value: 'Enterprise AI & Agentic Transformation' },
        { label: 'Headquarters', value: 'Bengaluru, India' },
        { label: 'India Presence', value: 'Bengaluru, Pune, Hyderabad, Chennai, Mysuru, NCR' },
        { label: 'Founded', value: '1981' },
        { label: 'Employees', value: '320,000+ globally' },
        { label: 'AI Focus Tagline', value: 'AI-first enterprise modernization.' }
      ],
      analystSummary:
        'Infosys positions itself as a transformation partner focused on scaling AI responsibly across enterprise landscapes, combining engineering depth with industry-contextualized intelligence. Its strategic narrative centers on "AI-first enterprise modernization", powered by Infosys Topaz - a comprehensive suite spanning generative AI models, responsible AI frameworks, and industry use-case libraries. The firm emphasizes end-to-end AI adoption: from data engineering and cloud readiness to multi-agent system design and responsible governance.',
      positioning: [
        'AI-First Enterprise Model: Topaz positions AI not as an add-on but as the core driver of modernization across apps, data, and operations.',
        'Responsible AI by Default: Embedded safeguards, lineage, and governance frameworks ensure compliance across regulated industries.',
        'Federated AI Architecture: Combines generative AI, multi-agent systems, analytics, and automation under a single enterprise framework.',
        'Engineering-Led Modernization: Large-scale legacy-to-cloud transformation with AI-enabled refactoring and workload optimization.',
        'Industry Contextualization: Over 200+ prebuilt industry use cases across BFSI, retail, manufacturing, telecom, healthcare.',
        'Value Assurance: "AI Value Realization Framework" ensures outcomes tied to productivity, experience, and operational efficiency.'
      ],
      capabilities: [
        { category: 'AI Advisory & Reinvention', description: 'AI roadmapping, transformation blueprints, productivity modeling, enterprise readiness and maturity assessments.' },
        { category: 'Platformized Delivery', description: 'Powered by Topaz - industry and function-specific AI modules and accelerators for repeatable, governed AI deployments.' },
        { category: 'Agentic AI Systems', description: 'AI agents for IT operations, customer engagement, financial decisioning, supply chain planning, and HR workflows.' },
        { category: 'Responsible AI & Compliance', description: 'Model governance, bias detection, interpretability, domain-specific guardrails for BFSI, healthcare, retail, and telecom.' },
        { category: 'Industry Packs', description: 'Manufacturing digital twins, BFSI fraud detection, retail personalization engines, telecom network intelligence, and healthcare automation use cases.' }
      ],
      flagship: [
        { platform: 'Infosys Topaz', purpose: 'Enterprise generative AI and automation suite', feature: '12,000+ AI assets, model libraries, industry agents' },
        { platform: 'Infosys Polycloud & Cobalt', purpose: 'Cloud acceleration and AI-ready infrastructure', feature: 'Multi-cloud governance, AI-native deployment templates' },
        { platform: 'Infosys Cortex', purpose: 'Customer experience intelligence', feature: 'AI-driven personalization, omnichannel orchestration' },
        { platform: 'Infosys Live Enterprise', purpose: 'Adaptive enterprise operations backbone', feature: 'Continuous sensing, autonomous workflows, digital twins' },
        { platform: 'Infosys Modernization Suite', purpose: 'Legacy modernization & code transformation', feature: 'AI-led code conversion, dependency mapping, risk scoring' }
      ],
      proofPoints: [
        '20,000+ AI use cases deployed across global Fortune 500 clients via Topaz assets.',
        'Extensive hyperscaler partnerships enabling accelerated enterprise-grade generative AI adoption.',
        'Measured productivity gains in operations, CX, and engineering functions through agentic workflows.',
        'Topaz adoption momentum, with strong traction in BFSI, retail, manufacturing, and telecom modernization programs.'
      ]
    }
  },

  // === PROVIDER 4: Genpact ===
  {
    id: 'genpact',
    name: 'Genpact',
    category: 'Enterprise AI & Agentic Transformation',
    tagline: 'AI-driven Intelligent Operations.',
    locations: 'New York HQ • India: Gurugram, Bengaluru, Hyderabad, Jaipur, Kolkata',
    employees: '115,000+ employees',
    logo: '/providers/Genpact.png',
    detail: {
      overview: [
        { label: 'Category', value: 'Enterprise AI & Agentic Transformation' },
        { label: 'Headquarters', value: 'New York, USA' },
        { label: 'India Presence', value: 'Gurugram, Bengaluru, Hyderabad, Jaipur, Kolkata' },
        { label: 'Founded', value: '1997' },
        { label: 'Employees', value: '115,000+ globally' },
        { label: 'AI Focus Tagline', value: 'AI-driven Intelligent Operations.' }
      ],
      analystSummary:
        'Genpact positions itself as an operations-focused AI transformation partner, combining process excellence with data engineering and applied generative AI. Its narrative centers on "AI-driven Intelligent Operations", integrating deep domain workflows with analytics, automation, and multi-agent orchestration. With its Data-Tech-AI fabric and the Genpact Cora platform, the firm focuses on operationalizing AI at scale for finance, supply chain, risk management, and customer operations.',
      positioning: [
        'Process-First AI: AI embedded directly into finance, accounting, procurement, and customer operations using digital operations blueprints.',
        'AI + Human-in-the-Loop: Robust governance, human controls, and risk-managed workflows for regulated industries.',
        'Cora as the Operational AI Backbone: A modular suite providing automation, analytics, and agentic orchestration across functions.',
        'Industry-Specific Expertise: Deep domain specialization in BFSI, CPG, healthcare, manufacturing, and retail operations.',
        'Scalable Transformation Delivery: Distributed global delivery centers enable rapid, repeatable AI deployment at scale.',
        'Outcome-Focused Engagements: Productivity uplift, SLA automation, and process-cycle-time reduction as core value drivers.'
      ],
      capabilities: [
        { category: 'AI Advisory & Reinvention', description: 'AI/ML readiness assessments, operational transformation blueprints, ROI frameworks, and responsible adoption strategies.' },
        { category: 'Platformized Delivery', description: 'Cora Digital Operations Platform delivers governed, scalable automation and AI components across enterprise workflows.' },
        { category: 'Agentic AI Systems', description: 'AI agents for finance operations, procurement optimization, customer service orchestration, and supply chain intelligence.' },
        { category: 'Responsible AI & Compliance', description: 'Controls for model bias, explainability, regulatory compliance, and safe human-machine collaboration in high-risk functions.' },
        { category: 'Industry Packs', description: 'Prebuilt AI templates for BFSI risk analytics, CPG demand forecasting, healthcare claims automation, and supply chain resilience.' }
      ],
      flagship: [
        { platform: 'Genpact Cora', purpose: 'AI-led digital operations platform', feature: 'Automation + analytics + multi-agent orchestration' },
        { platform: 'Cora Finance Ops', purpose: 'AI-powered finance transformation', feature: 'Predictive insights, reconciliation automation, risk scoring' },
        { platform: 'Cora Supply Chain', purpose: 'Intelligent supply chain engine', feature: 'Demand sensing, inventory optimization, real-time decision agents' },
        { platform: 'Cora Customer Service', purpose: 'Customer operations optimization', feature: 'Agentic workflows, sentiment intelligence, SLA prediction' },
        { platform: 'Lean Digital', purpose: 'Transformation methodology', feature: 'Process re-engineering powered by data & AI accelerators' }
      ],
      proofPoints: [
        'Thousands of AI-driven operational deployments across finance, supply chain, and customer service.',
        'Strong momentum with Cora, now used by major Fortune 500 clients to automate core operational workflows.',
        'Measured productivity improvements, including cycle-time reduction, automated SLA adherence, and error-rate drops.',
        'Deep industry credibility in BFSI, CPG, manufacturing, and healthcare operations, reinforced by domain-led AI programs.'
      ]
    }
  },

  // === PROVIDER 5: Fractal ===
  {
    id: 'fractal',
    name: 'Fractal',
    category: 'Enterprise AI & Decision Intelligence',
    tagline: 'AI for better decisions at scale.',
    locations: 'New York HQ • India: Mumbai, Bengaluru, Gurugram, Chennai',
    employees: '4,500+ employees',
    logo: '/providers/Fractal.png',
    detail: {
      overview: [
        { label: 'Category', value: 'Enterprise AI & Decision Intelligence' },
        { label: 'Headquarters', value: 'New York, USA' },
        { label: 'India Presence', value: 'Mumbai, Bengaluru, Gurugram, Chennai' },
        { label: 'Founded', value: '2000' },
        { label: 'Employees', value: '4,500+ globally' },
        { label: 'AI Focus Tagline', value: 'AI for better decisions at scale.' }
      ],
      analystSummary:
        'Fractal positions itself as a specialist in decision intelligence, applied AI, and enterprise-wide data-driven transformation. Its narrative centers on "AI for better decisions at scale", built through a portfolio of products and services including Crux Intelligence, Qure.ai, Flyfish, and Eugenie. The firm blends advanced analytics, generative AI, and machine learning with strong design thinking via its Fractal Analytics + Final Mile integration to help enterprises operationalize AI in mission-critical workflows.',
      positioning: [
        'Decision Intelligence as Core: AI is framed as an enabler of better enterprise decisions - across revenue, risk, supply chain, and customer experience.',
        'Product-Led AI Portfolio: Qure.ai, Eugenie, Flyfish, and Crux enable plug-and-play AI adoption across verticals.',
        'Deep Data Science Expertise: Strong scientific talent base with advanced ML, optimization, and generative AI capabilities.',
        'Human-Centered AI: Final Mile\'s behavioral science integration strengthens adoption, trust, and model interpretability.',
        'Industry Depth: Long-standing strengths in CPG, retail, healthcare, insurance, and financial services.',
        'Outcome-Oriented Engagements: Focus on measurable value - improved forecasting accuracy, risk reduction, operational lift.'
      ],
      capabilities: [
        { category: 'AI Advisory & Reinvention', description: 'Transformation roadmaps, AI strategy development, value modeling, and readiness assessments anchored in decision intelligence frameworks.' },
        { category: 'Platformized Delivery', description: 'Modular AI products and accelerators such as Flyfish and Eugenie simplify deployment and governance.' },
        { category: 'Agentic AI Systems', description: 'Intelligent agents for forecasting, risk scoring, customer insights, medical imaging, anomaly detection, and operational decision automation.' },
        { category: 'Responsible AI & Compliance', description: 'Bias monitoring, explainability layers, clinical-grade compliance (via Qure.ai), and safe adoption frameworks for regulated industries.' },
        { category: 'Industry Packs', description: 'CPG demand intelligence, healthcare diagnostics, retail pricing optimization, insurance underwriting, and manufacturing quality intelligence.' }
      ],
      flagship: [
        { platform: 'Flyfish', purpose: 'Enterprise decision intelligence engine', feature: 'Advanced forecasting, optimization, and decision automation' },
        { platform: 'Qure.ai', purpose: 'AI for medical imaging & diagnostics', feature: 'CE/FDA-grade models for radiology, triage, and disease detection' },
        { platform: 'Eugenie', purpose: 'Industrial anomaly detection & root-cause platform', feature: 'Real-time sensor analytics and predictive alerts' },
        { platform: 'Crux Intelligence', purpose: 'AI-driven business insights platform', feature: 'Natural-language insights and automated decision support' },
        { platform: 'Final Mile', purpose: 'Behavioral science-led adoption', feature: 'Human-centered design, increasing AI trust and usability' }
      ],
      proofPoints: [
        'Rapid adoption of Qure.ai across global healthcare systems for radiology workflows and disease screening.',
        'Significant lift in forecasting and supply chain accuracy for CPG and retail clients using Flyfish.',
        'Eugenie deployed across manufacturing plants worldwide, reducing downtime and improving quality control.',
        'Recognized globally in AI/analytics rankings for its decision intelligence and applied AI impact.'
      ]
    }
  },

  // === PROVIDER 6: Deloitte ===
  {
    id: 'deloitte',
    name: 'Deloitte',
    category: 'Enterprise AI & Agentic Transformation',
    tagline: 'Trust, responsible innovation, and sector-specific AI impact.',
    locations: 'New York HQ • India: Hyderabad, Bengaluru, Mumbai, Gurugram, Pune, Chennai',
    employees: '450,000+ employees',
    logo: '/providers/Deloitte.png',
    detail: {
      overview: [
        { label: 'Category', value: 'Enterprise AI & Agentic Transformation' },
        { label: 'Headquarters', value: 'New York, USA' },
        { label: 'India Presence', value: 'Hyderabad, Bengaluru, Mumbai, Gurugram, Pune, Chennai' },
        { label: 'Founded', value: '1845' },
        { label: 'Employees', value: '450,000+ globally' },
        { label: 'AI Focus Tagline', value: 'Trust, responsible innovation, and sector-specific AI impact.' }
      ],
      analystSummary:
        'Deloitte positions itself as a global transformation partner with a broad, multidisciplinary approach to AI adoption, emphasizing trust, responsible innovation, and sector-specific impact. Its strategic narrative, delivered through Deloitte AI Institute and Trustworthy AI, focuses on embedding AI across business, technology, and risk functions. Deloitte leverages deep industry consulting, extensive cloud alliances, and a federated global delivery network to support clients in architecting and scaling AI programs.',
      positioning: [
        'Trustworthy AI as a Core Proposition: Built-in governance, ethics, model risk management, and compliance across all AI solutions.',
        'Multidisciplinary Delivery: Strategy, cyber, risk, engineering, operations, and industry depth integrated under one umbrella.',
        'Converge Platforms: Industry-specific digital platforms that accelerate AI and analytics modernization.',
        'End-to-End AI Engineering: AI architecture, model development, MLOps, and enterprise-grade deployment at scale.',
        'Deep Alliances: Extensive partnerships with AWS, Google Cloud, Microsoft, NVIDIA, Databricks, and Snowflake.',
        'Strong Public Sector & Regulated Industry Footprint: BFSI, healthcare, government, and energy transformation programs.'
      ],
      capabilities: [
        { category: 'AI Advisory & Reinvention', description: 'AI strategy, operating model design, value realization frameworks, and enterprise governance implementation.' },
        { category: 'Platformized Delivery', description: 'Converge and Deloitte Ascend provide modular industry accelerators, data models, and AI building blocks.' },
        { category: 'Agentic AI Systems', description: 'AI agents for financial services, healthcare administration, customer operations, risk scoring, and supply chain orchestration.' },
        { category: 'Responsible AI & Compliance', description: 'Trustworthy AI for ethics, fairness, explainability, security, and industry-specific compliance (BFSI, healthcare, public sector).' },
        { category: 'Industry Packs', description: 'Prebuilt AI assets for financial crime detection, clinical operations, customer 360, energy optimization, government modernization.' }
      ],
      flagship: [
        { platform: 'Deloitte Converge', purpose: 'Industry-specific digital transformation platforms', feature: 'Embedded data models, AI accelerators, and cloud-native workflows' },
        { platform: 'AI Studio', purpose: 'Enterprise AI development & experimentation', feature: 'Model development, rapid prototyping, and MLOps pipelines' },
        { platform: 'Deloitte Ascend', purpose: 'Cloud + AI modernization framework', feature: 'Scalable architecture templates for regulated enterprises' },
        { platform: 'Trustworthy AI', purpose: 'Governance and risk framework', feature: 'Fairness, transparency, auditability, and compliance controls' },
        { platform: 'Digital Contact Center (DCCP)', purpose: 'Customer operations modernization', feature: 'Agentic CX workflows, generative AI orchestration' }
      ],
      proofPoints: [
        'Global leadership in AI governance, widely recognized for Trustworthy AI frameworks.',
        'Converge platform deployments across BFSI, healthcare, and government enabling rapid, industry-specific AI adoption.',
        'Large-scale generative AI programs with Fortune 500 clients leveraging cloud and data modernization initiatives.',
        'Extensive cross-functional teams, combining strategy, engineering, and regulatory expertise to deliver enterprise-wide AI transformation.'
      ]
    }
  },

  // === PROVIDER 7: PwC ===
  {
    id: 'pwc',
    name: 'PwC',
    category: 'Enterprise AI & Agentic Transformation',
    tagline: 'Human-led, Tech-powered AI transformation.',
    locations: 'London HQ • India: Delhi-NCR, Mumbai, Bengaluru, Hyderabad, Kolkata, Pune, Chennai',
    employees: '360,000+ employees',
    logo: '/providers/PwC.png',
    detail: {
      overview: [
        { label: 'Category', value: 'Enterprise AI & Agentic Transformation' },
        { label: 'Headquarters', value: 'London, United Kingdom' },
        { label: 'India Presence', value: 'Delhi-NCR, Mumbai, Bengaluru, Hyderabad, Kolkata, Pune, Chennai' },
        { label: 'Founded', value: '1849' },
        { label: 'Employees', value: '360,000+ globally' },
        { label: 'AI Focus Tagline', value: 'Human-led, Tech-powered AI transformation.' }
      ],
      analystSummary:
        'PwC positions itself as a trusted business transformation and risk-governance partner for enterprise AI adoption, grounded in its "Human-led, Tech-powered" narrative. Through PwC Labs, Responsible AI frameworks, and extensive domain consulting, PwC focuses on enabling clients to redesign business models, modernize data estates, and deploy governed AI systems with measurable value and compliance.',
      positioning: [
        'Governance-First AI Adoption: PwC\'s Responsible AI approach integrates ethics, fairness, cybersecurity, and regulatory risk into every engagement.',
        'Human-Led, Tech-Powered: Strong emphasis on organizational adoption, change management, and people-driven value realization.',
        'PwC Labs: Proprietary engineering hub building reusable AI assets for audit, tax, risk, and industry-specific use cases.',
        'Industry Specialization: Deep vertical expertise in BFSI, healthcare, energy, consumer markets, and public sector reform.',
        'Regulatory Leadership: Advisory strength across AI regulation, financial compliance, privacy, and assurance.',
        'Broad Cloud & Data Alliances: Partnerships with AWS, Microsoft, Google Cloud, and Databricks to accelerate modernization.'
      ],
      capabilities: [
        { category: 'AI Advisory & Reinvention', description: 'Enterprise AI strategy, operating model creation, cost/value modeling, risk mitigation, and responsible deployment guidelines.' },
        { category: 'Platformized Delivery', description: 'PwC Labs accelerators, prebuilt pipelines, audit-/risk-focused AI modules, and sector-specific digital transformation toolkits.' },
        { category: 'Agentic AI Systems', description: 'Agents for compliance automation, customer interaction, financial risk analysis, tax advisory automation, and operational decisioning.' },
        { category: 'Responsible AI & Compliance', description: 'Model governance, explainability, algorithmic fairness assessments, and regulatory alignment for highly regulated sectors.' },
        { category: 'Industry Packs', description: 'Solutions for banking risk analytics, insurance operations, healthcare administration, supply chain optimization, and government modernization.' }
      ],
      flagship: [
        { platform: 'PwC Labs', purpose: 'AI, analytics, and automation development hub', feature: 'Prebuilt models for audit, tax, CX, and compliance' },
        { platform: 'Responsible AI Framework', purpose: 'Governance & ethical oversight', feature: 'Fairness, explainability, model lifecycle controls' },
        { platform: 'Halo', purpose: 'AI-enabled audit and assurance suite', feature: 'Continuous auditing, anomaly detection, risk scoring' },
        { platform: 'Perform Plus', purpose: 'Performance and productivity optimization', feature: 'Behavioral insights + AI-driven workflow improvement' },
        { platform: 'ProEdge', purpose: 'Workforce upskilling and digital adoption', feature: 'AI-driven skills mapping and transformation readiness' }
      ],
      proofPoints: [
        'Significant global investment in AI and cloud modernization, including large-scale generative AI programs with clients across industries.',
        'PwC Labs assets deployed across audit, tax, and advisory, enabling measurable productivity and risk reduction.',
        'Leadership in Responsible AI, with widely adopted governance and compliance frameworks.',
        'Strong traction in regulated sectors, leveraging audit + advisory integration for risk-managed AI transformations.'
      ]
    }
  },

  // === PROVIDER 8: Quantiphi ===
  {
    id: 'quantiphi',
    name: 'Quantiphi',
    category: 'AI-First Digital Transformation',
    tagline: 'Solving the toughest and most impactful business problems with AI and cloud.',
    locations: 'Marlborough, MA HQ • India: Mumbai, Bengaluru, Hyderabad, Pune',
    employees: '4,000+ employees',
    logo: '/providers/Quantiphi.png',
    detail: {
      overview: [
        { label: 'Category', value: 'AI-First Digital Transformation & Applied Machine Learning' },
        { label: 'Headquarters', value: 'Marlborough, Massachusetts, USA' },
        { label: 'India Presence', value: 'Mumbai, Bengaluru, Hyderabad, Pune' },
        { label: 'Founded', value: '2013' },
        { label: 'Employees', value: '4,000+ globally' },
        { label: 'AI Focus Tagline', value: 'Solving the toughest and most impactful business problems with AI and cloud.' }
      ],
      analystSummary:
        'Quantiphi positions itself as a pure-play, AI-native transformation partner specializing in machine learning engineering, cloud modernization, and generative AI solutions. Its narrative centers on "Solving the toughest and most impactful business problems with AI and cloud", leveraging deep hyperscaler partnerships (Google Cloud, AWS, NVIDIA) and strong engineering IP across vision, language, forecasting, and agentic systems.',
      positioning: [
        'AI-Native Engineering: One of the earliest AI-specialist partners with deep ML/GenAI capability across all hyperscaler ecosystems.',
        'Hyperscaler Leadership: Elite partnerships with Google Cloud, AWS, and NVIDIA drive enterprise-grade scale and performance.',
        'Accelerated AI Delivery: Prebuilt models, pipelines, and solution packs for vision, NLP, document AI, and multi-agent systems.',
        'Industry-Tailored AI Programs: Extensive domain solutions for healthcare, BFSI, public sector, media, and retail.',
        'End-to-End ML Ops: Full lifecycle from data engineering to model deployment, monitoring, and continuous optimization.',
        'High-Complexity Problem Solving: Strong reputation for tackling advanced ML challenges that require custom engineering.'
      ],
      capabilities: [
        { category: 'AI Advisory & Reinvention', description: 'AI strategy, value modeling, cloud modernization roadmaps, and responsible AI adoption frameworks.' },
        { category: 'Platformized Delivery', description: 'C2AI, AIDE, and GenAI solution kits offer modular, repeatable components for faster AI build-out.' },
        { category: 'Agentic AI Systems', description: 'Agents for document automation, customer service, claims management, content processing, and enterprise decisioning.' },
        { category: 'Responsible AI & Compliance', description: 'Bias monitoring, explainability, lineage tracking, and compliance alignment for healthcare, BFSI, and public sector mandates.' },
        { category: 'Industry Packs', description: 'Healthcare diagnostics, BFSI automation, retail demand intelligence, media analytics, and government digital modernization.' }
      ],
      flagship: [
        { platform: 'C2AI (Cloud to AI)', purpose: 'End-to-end AI transformation suite', feature: 'Prebuilt components for ML pipelines, automation, and deployment' },
        { platform: 'AIDE', purpose: 'Automated data extraction & document AI', feature: 'Vision, NLP, OCR, and hybrid ML models for complex documents' },
        { platform: 'GenAI Solution Packs', purpose: 'Domain-specific generative AI accelerators', feature: 'Agents for CX, knowledge mining, content creation, and summarization' },
        { platform: 'Healthcare Intelligence Suite', purpose: 'AI-driven clinical & operational insights', feature: 'Predictive analytics, medical imaging, triage models' },
        { platform: 'ML Ops & Monitoring Platform', purpose: 'Production lifecycle management', feature: 'CI/CD for models, monitoring, drift management' }
      ],
      proofPoints: [
        'Elite Google Cloud & AWS partner, recognized for AI innovation and high-impact ML deployments.',
        'Hundreds of enterprise AI solutions across healthcare, BFSI, public sector, media, and retail.',
        'AIDE and C2AI widely adopted, accelerating AI deployment cycles and reducing operational effort.',
        'Strong reputation for complex ML engineering, including vision, NLP, forecasting, and large-scale data platforms.'
      ]
    }
  },

  // === PROVIDER 9: Coforge ===
  {
    id: 'coforge',
    name: 'Coforge',
    category: 'AI Engineering & Digital Platforms',
    tagline: 'Transforming industries through AI-powered platforms and deeply contextualized operations.',
    locations: 'Noida HQ • India: Noida, Bengaluru, Hyderabad, Chennai, Mumbai, Pune',
    employees: '25,000+ employees',
    logo: '/providers/Coforge.png',
    detail: {
      overview: [
        { label: 'Category', value: 'AI Engineering, Digital Platforms & Industry-Specific Modernization' },
        { label: 'Headquarters', value: 'Noida, India' },
        { label: 'India Presence', value: 'Noida, Bengaluru, Hyderabad, Chennai, Mumbai, Pune' },
        { label: 'Founded', value: '1992' },
        { label: 'Employees', value: '25,000+ globally' },
        { label: 'AI Focus Tagline', value: 'Transforming industries through AI-powered platforms and deeply contextualized operations.' }
      ],
      analystSummary:
        'Coforge positions itself as a domain-intensive digital services and AI engineering partner with strong specialization in financial services, travel, transportation, and healthcare. Its narrative centers on "Transforming industries through AI-powered platforms and deeply contextualized operations". Coforge blends modern engineering, cloud modernization, and applied AI with deep knowledge of complex, high-transaction industries.',
      positioning: [
        'Industry-Deep Expertise: Strong specialization in BFSI, travel, logistics, and healthcare - enabling highly contextualized AI solutions.',
        'Platform-Driven Transformation: Digital platforms like Quasar and IntelliOps accelerate modernization and AI adoption.',
        'Cloud & Data Engineering Strength: End-to-end capabilities across cloud migration, modern data stacks, and ML engineering.',
        'Agentic Workflows & Intelligent Ops: AI-driven operations frameworks enabling predictive, autonomous, and high-efficiency processes.',
        'Outcome-Centric Delivery: Strong focus on operational efficiency, customer experience uplift, and business resilience.',
        'Agile, High-Touch Engagement Model: Lean governance and co-creation with clients enable faster transformation cycles.'
      ],
      capabilities: [
        { category: 'AI Advisory & Reinvention', description: 'AI strategy definition, value modeling, modernization roadmaps, and risk-managed implementation for regulated industries.' },
        { category: 'Platformized Delivery', description: 'Coforge Quasar, IntelliOps, and domain accelerators provide reusable components that shorten build time and improve governance.' },
        { category: 'Agentic AI Systems', description: 'Agents for claims automation, fraud detection, travel disruption management, customer operations, and predictive maintenance.' },
        { category: 'Responsible AI & Compliance', description: 'Controls for explainability, bias detection, data lineage, and compliance aligned to BFSI and healthcare regulatory standards.' },
        { category: 'Industry Packs', description: 'Solutions for insurance underwriting, travel demand intelligence, airline operations optimization, healthcare administration, and supply chain visibility.' }
      ],
      flagship: [
        { platform: 'Coforge Quasar', purpose: 'Cloud-native digital engineering platform', feature: 'Prebuilt microservices, APIs, and AI accelerators' },
        { platform: 'Coforge IntelliOps', purpose: 'Intelligent operations & automation suite', feature: 'Predictive insights, integrated ML, and process orchestration' },
        { platform: 'Travel & Hospitality Platforms', purpose: 'Industry-specific transformation for airlines & travel', feature: 'Disruption management, revenue optimization, customer personalization' },
        { platform: 'Insurance Suite', purpose: 'AI-driven insurance digitization', feature: 'Underwriting automation, claims intelligence, fraud analytics' },
        { platform: 'HealthX', purpose: 'Healthcare workflow modernization', feature: 'Clinical insights, care coordination, claims intelligence' }
      ],
      proofPoints: [
        'Significant traction in BFSI, powering underwriting, claims, and fraud analytics with AI-driven workflows.',
        'Strong global presence in travel & hospitality, enabling airline modernization and predictive operations.',
        'Quasar and IntelliOps platforms adopted to accelerate digital engineering and intelligent operations at scale.',
        'Consistent growth in data & AI programs, supported by cloud partnerships and industry-specialized delivery teams.'
      ]
    }
  },

  // === PROVIDER 10: LTIMindtree ===
  {
    id: 'ltimindtree',
    name: 'LTIMindtree',
    category: 'AI Engineering & Cloud Modernization',
    tagline: 'Building connected enterprises through AI, cloud, and experience engineering.',
    locations: 'Mumbai HQ • India: Mumbai, Bengaluru, Hyderabad, Pune, Chennai, Noida',
    employees: '82,000+ employees',
    logo: '/providers/LTIM.png',
    detail: {
      overview: [
        { label: 'Category', value: 'AI Engineering, Cloud Modernization & Industry Digital Platforms' },
        { label: 'Headquarters', value: 'Mumbai, India' },
        { label: 'India Presence', value: 'Mumbai, Bengaluru, Hyderabad, Pune, Chennai, Noida' },
        { label: 'Founded', value: '2022 (Merger of LTI and Mindtree)' },
        { label: 'Employees', value: '82,000+ globally' },
        { label: 'AI Focus Tagline', value: 'Building connected enterprises through AI, cloud, and experience engineering.' }
      ],
      analystSummary:
        'LTIMindtree positions itself as a scaled digital engineering and AI transformation partner with strong strengths in cloud, data modernization, and industry-specific platform solutions. Its narrative centers on "Building connected enterprises through AI, cloud, and experience engineering". Leveraging its Canvas.ai, AlphAI, and industry accelerators across BFSI, manufacturing, retail, travel, and energy, LTIM focuses on delivering AI-powered modernization with measurable business outcomes.',
      positioning: [
        'Merged Strengths: Combines LTI\'s enterprise delivery capabilities with Mindtree\'s digital engineering depth.',
        'AI + Cloud First Approach: AI-driven modernization embedded across apps, data, infrastructure, and customer experience.',
        'Platform Ecosystem: Canvas.ai, AlphAI, and industry platforms provide accelerators for faster AI deployment.',
        'Experience Engineering: Strong focus on digital experiences, omnichannel, and customer-centric AI workflows.',
        'Industry Depth: BFSI, retail, travel, hi-tech, manufacturing, and energy as core vertical strengths.',
        'Scaled Global Delivery: Agile pods + large transformation programs enable hybrid delivery at pace and scale.'
      ],
      capabilities: [
        { category: 'AI Advisory & Reinvention', description: 'AI strategy, modernization blueprints, value realization modeling, capability building, and governance frameworks.' },
        { category: 'Platformized Delivery', description: 'Canvas.ai and AlphAI enable reusable components for data engineering, ML pipelines, and cloud-native architectures.' },
        { category: 'Agentic AI Systems', description: 'Agents for banking operations, customer service, supply chain planning, anomaly detection, and digital workplace automation.' },
        { category: 'Responsible AI & Compliance', description: 'Governance, model monitoring, explainability, risk controls, and compliance aligned to BFSI, healthcare, and manufacturing.' },
        { category: 'Industry Packs', description: 'Retail personalization, airline disruption management, BFSI underwriting intelligence, manufacturing IoT analytics, and energy optimization.' }
      ],
      flagship: [
        { platform: 'Canvas.ai', purpose: 'AI + cloud engineering accelerator', feature: 'Data fabric, ML pipeline scaffolding, cloud-native templates' },
        { platform: 'AlphAI', purpose: 'Enterprise AI orchestration suite', feature: 'Multi-agent workflows, reusable AI microservices' },
        { platform: 'NxT Platform', purpose: 'Industry-specific digital platform', feature: 'IoT, predictive maintenance, digital twins for manufacturing' },
        { platform: 'Infinity Experience Platforms', purpose: 'Customer experience transformation', feature: 'Omnichannel orchestration, personalization engines' },
        { platform: 'CloudOps & AIOps Suite', purpose: 'Intelligent operations & cloud optimization', feature: 'Predictive insights, automated remediation' }
      ],
      proofPoints: [
        'Significant momentum post-merger, combining 82,000+ employees and deep domain capabilities.',
        'Canvas.ai and AlphAI deployed across BFSI, retail, travel, and manufacturing for accelerated AI modernization.',
        'Strong hyperscaler partnerships (AWS, Azure, GCP) powering cloud-native transformations.',
        'Growing portfolio of agentic and AI-powered operations, especially in banking, travel, and industrial sectors.'
      ]
    }
  },

  // === PROVIDER 11: Persistent Systems ===
  {
    id: 'persistent',
    name: 'Persistent Systems',
    category: 'Digital Engineering & AI Platforms',
    tagline: 'Engineering the modern enterprise through AI, cloud, and data-driven platforms.',
    locations: 'Pune HQ • India: Pune, Bengaluru, Hyderabad, Nagpur, Goa',
    employees: '23,000+ employees',
    logo: '/providers/Persistent.png',
    detail: {
      overview: [
        { label: 'Category', value: 'Digital Engineering, AI Platforms & Cloud Modernization' },
        { label: 'Headquarters', value: 'Pune, India' },
        { label: 'India Presence', value: 'Pune, Bengaluru, Hyderabad, Nagpur, Goa' },
        { label: 'Founded', value: '1990' },
        { label: 'Employees', value: '23,000+ globally' },
        { label: 'AI Focus Tagline', value: 'Engineering the modern enterprise through AI, cloud, and data-driven platforms.' }
      ],
      analystSummary:
        'Persistent Systems positions itself as a high-performance digital engineering and AI-led transformation partner with strong competencies in software product engineering, cloud modernization, data platforms, and applied machine learning. Its narrative centers on "Engineering the modern enterprise through AI, cloud, and data-driven platforms".',
      positioning: [
        'Product Engineering DNA: Deep expertise in building complex, large-scale software systems for ISVs and global enterprises.',
        'AI-Infused Modernization: AI accelerators and model deployment frameworks embedded across modernization and ops programs.',
        'Cloud-Native Strength: Strong execution record in multi-cloud architecture, containerization, and serverless engineering.',
        'Data Platform Expertise: Enterprise data fabrics, lakehouses, and MLOps frameworks built for high-volume environments.',
        'Experience-Led Engineering: Integrated design, UX, and ML-enabled customer journey orchestration.',
        'Agile, High-Quality Delivery: Engineering rigor and high customer retention driven by stable, long-term client relationships.'
      ],
      capabilities: [
        { category: 'AI Advisory & Reinvention', description: 'AI visioning, modernization roadmaps, opportunity sizing, and responsible AI strategy for enterprise reinvention.' },
        { category: 'Platformized Delivery', description: 'Accelerators such as CxIQ, Datafoundry, and MLOps pipelines offer modular components that compress engineering cycles.' },
        { category: 'Agentic AI Systems', description: 'Agents for IT operations, customer engagement, financial analytics, healthcare automation, and intelligent workflow orchestration.' },
        { category: 'Responsible AI & Compliance', description: 'Model governance, explainability, bias testing, and compliance with BFSI, healthcare, and regulated enterprise requirements.' },
        { category: 'Industry Packs', description: 'Prebuilt frameworks for BFSI modernization, healthcare data platforms, manufacturing analytics, and hi-tech product transformation.' }
      ],
      flagship: [
        { platform: 'Persistent CxIQ', purpose: 'Digital experience & personalization engine', feature: 'AI-led journey mapping and omnichannel orchestration' },
        { platform: 'Datafoundry', purpose: 'Modern data platform accelerator', feature: 'Lakehouse templates, ingestion pipelines, governance modules' },
        { platform: 'Persistent AIOps Suite', purpose: 'Intelligent IT operations', feature: 'Predictive insights, automated remediation, multi-cloud observability' },
        { platform: 'MLOps Accelerator', purpose: 'End-to-end ML lifecycle automation', feature: 'CI/CD for models, drift detection, monitoring dashboards' },
        { platform: 'Cloud Accelerators', purpose: 'Cloud migration & modernization', feature: 'IaC templates, microservices blueprints, API scaffolding' }
      ],
      proofPoints: [
        'Strong growth in digital engineering, driven by long-term ISV and BFSI partnerships.',
        'Datafoundry and CxIQ deployed across multiple enterprises for analytics modernization and CX uplift.',
        'Consistent leadership in cloud-native architectures, supported by partnerships with AWS, Azure, GCP, Snowflake, and Databricks.',
        'High client retention and delivery quality, with measurable impact across modernization, AI engineering, and product transformation.'
      ]
    }
  },

  // === PROVIDER 12: Mphasis ===
  {
    id: 'mphasis',
    name: 'Mphasis',
    category: 'AI Engineering & Cognitive Solutions',
    tagline: 'Future-proofing the enterprise with AI, cloud, and advanced engineering.',
    locations: 'Bengaluru HQ • India: Bengaluru, Pune, Chennai, Hyderabad, Noida, Mumbai',
    employees: '35,000+ employees',
    logo: '/providers/Mphasis.png',
    detail: {
      overview: [
        { label: 'Category', value: 'AI Engineering, Cloud & Cognitive Solutions, Digital Operations' },
        { label: 'Headquarters', value: 'Bengaluru, India' },
        { label: 'India Presence', value: 'Bengaluru, Pune, Chennai, Hyderabad, Noida, Mumbai' },
        { label: 'Founded', value: '1998' },
        { label: 'Employees', value: '35,000+ globally' },
        { label: 'AI Focus Tagline', value: 'Future-proofing the enterprise with AI, cloud, and advanced engineering.' }
      ],
      analystSummary:
        'Mphasis positions itself as a next-generation digital transformation and AI engineering partner with deep strengths in cloud modernization, cognitive automation, and domain-specific platforms for BFSI, logistics, and healthcare. Its narrative centers on "Future-proofing the enterprise with AI, cloud, and advanced engineering".',
      positioning: [
        'Front2Back Transformation Model: Business-first approach integrating customer journeys, data, and AI-driven operations.',
        'AI + Cloud Integrated Delivery: Deep capability across AWS, Azure, Google Cloud, and hybrid enterprise architectures.',
        'Cognitive Platforms: DeepInsights and CognitiveSense deliver prebuilt intelligence for BFSI, insurance, and logistics.',
        'Operations Modernization: NextOps frameworks for predictive, self-healing, and autonomous IT/operations.',
        'Strong BFSI Heritage: Deep domain expertise in banking, wealth management, insurance, and payments.',
        'Agile & Application Engineering Strength: Known for modernization, microservices, API engineering, and digital platforms.'
      ],
      capabilities: [
        { category: 'AI Advisory & Reinvention', description: 'AI roadmaps, modernization strategies, value modeling, enterprise data architecture, and responsible AI frameworks.' },
        { category: 'Platformized Delivery', description: 'Powered by DeepInsights, CognitiveSense, and NextOps for repeatable and governed AI deployments.' },
        { category: 'Agentic AI Systems', description: 'Agents for underwriting, fraud detection, claims processing, document intelligence, customer service, and IT operations.' },
        { category: 'Responsible AI & Compliance', description: 'Bias monitoring, explainability, governance, and regulatory alignment for BFSI and healthcare ecosystems.' },
        { category: 'Industry Packs', description: 'Solutions for banking KYC/AML, insurance straight-through processing, logistics optimization, and healthcare administration.' }
      ],
      flagship: [
        { platform: 'DeepInsights', purpose: 'Cognitive intelligence and analytics platform', feature: 'NLP, vision, and predictive models for BFSI and ops workflows' },
        { platform: 'CognitiveSense', purpose: 'Intelligent document & workflow automation', feature: 'OCR, NLP, entity extraction, rule engines' },
        { platform: 'NextOps', purpose: 'AI-led IT operations transformation', feature: 'Predictive alerts, auto-remediation, intelligent observability' },
        { platform: 'Front2Back Framework', purpose: 'Business-first transformation model', feature: 'Combines design thinking with AI-enabled operations' },
        { platform: 'Mphasis Digital Risk Platforms', purpose: 'BFSI risk automation', feature: 'Fraud analytics, compliance intelligence, risk scoring' }
      ],
      proofPoints: [
        'DeepInsights deployed across global BFSI clients, accelerating underwriting, claims, and fraud analytics.',
        'Significant traction in cloud-native modernization, supported by strong hyperscaler alliances.',
        'NextOps framework delivering measurable OPEX reduction, predictive IT stability, and automation-led productivity.',
        'Front2Back engagements driving customer experience uplift, operational efficiency, and domain-specific AI adoption.'
      ]
    }
  },

  // === PROVIDER 13: Capgemini ===
  {
    id: 'capgemini',
    name: 'Capgemini',
    category: 'AI & Data, Cloud Modernization',
    tagline: 'Intelligent Industry powered by AI, cloud, and data.',
    locations: 'Paris HQ • India: Bengaluru, Mumbai, Pune, Chennai, Hyderabad, Kolkata, Noida',
    employees: '340,000+ employees',
    logo: '/providers/Capgemini.png',
    detail: {
      overview: [
        { label: 'Category', value: 'AI & Data, Cloud Modernization, Digital Engineering, Industry Platforms' },
        { label: 'Headquarters', value: 'Paris, France' },
        { label: 'India Presence', value: 'Bengaluru, Mumbai, Pune, Chennai, Hyderabad, Kolkata, Noida' },
        { label: 'Founded', value: '1967' },
        { label: 'Employees', value: '340,000+ globally' },
        { label: 'AI Focus Tagline', value: 'Intelligent Industry powered by AI, cloud, and data.' }
      ],
      analystSummary:
        'Capgemini positions itself as a global digital transformation and AI engineering partner with strong expertise across consulting, cloud, data platforms, and industry-focused solutions. Its narrative centers on "Intelligent Industry powered by AI, cloud, and data", bringing together engineering, design, and technology to build integrated digital ecosystems.',
      positioning: [
        'Intelligent Industry Focus: Strong investments in cyber-physical systems, digital twins, and industrial AI.',
        'Perform AI Framework: Structured approach to implementing, scaling, and governing AI programs enterprise-wide.',
        'End-to-End Delivery: Combines consulting (Capgemini Invent) with deep engineering (Capgemini Engineering/Altran).',
        'Cloud + Data Integration: Strength across AWS, Azure, GCP and modern data platforms, enabling enterprise AI scale-out.',
        'Industry Specialization: BFSI, manufacturing, automotive, energy, telecom, retail, and public sector.',
        'Sustainability & Responsible AI: Leading frameworks for ethics, compliance, energy-efficient AI, and carbon-aware engineering.'
      ],
      capabilities: [
        { category: 'AI Advisory & Reinvention', description: 'AI strategy, digital operating model design, capability building, value realization, and responsible AI transformation blueprints.' },
        { category: 'Platformized Delivery', description: 'Perform AI, Intelligent Industry accelerators, and data modernization frameworks provide modular AI components for enterprise programs.' },
        { category: 'Agentic AI Systems', description: 'AI agents for customer service, industrial automation, supply chain orchestration, predictive maintenance, and IT operations.' },
        { category: 'Responsible AI & Compliance', description: 'Ethics-by-design, model risk frameworks, transparency tooling, bias testing, and compliance across regulated sectors.' },
        { category: 'Industry Packs', description: 'Manufacturing digital twin packs, automotive engineering accelerators, BFSI risk intelligence, energy optimization, and retail personalization.' }
      ],
      flagship: [
        { platform: 'Perform AI', purpose: 'Enterprise AI transformation framework', feature: 'Governance, ROI frameworks, scalable deployment patterns' },
        { platform: 'Intelligent Industry', purpose: 'Industry + engineering digital transformation', feature: 'Digital twins, edge computing, industrial automation' },
        { platform: 'Capgemini 360 Value', purpose: 'Sustainable transformation framework', feature: 'Business, environmental, and operational KPIs' },
        { platform: 'Capgemini Cloud Platform', purpose: 'Cloud modernization & governance', feature: 'Multi-cloud templates, landing zones, automation' },
        { platform: 'Digital Customer Operations', purpose: 'AI-powered customer experience', feature: 'NLP-driven routing, agent augmentation, personalization' }
      ],
      proofPoints: [
        'Perform AI scaled across global enterprises, enabling AI adoption in manufacturing, BFSI, and retail.',
        'Intelligent Industry platforms deployed, especially in automotive and industrial sectors for predictive operations and digital twins.',
        'Strong multi-cloud transformation delivery, backed by deep ecosystem partnerships and engineering capabilities.',
        'Recognized leadership in sustainable and responsible AI, with comprehensive frameworks for ethical and low-carbon AI adoption.'
      ]
    }
  },

  // === PROVIDER 14: Cognizant ===
  {
    id: 'cognizant',
    name: 'Cognizant',
    category: 'Enterprise AI & Digital Modernization',
    tagline: 'Modernizing the enterprise through cloud, data, and AI.',
    locations: 'Teaneck, NJ HQ • India: Chennai, Bengaluru, Hyderabad, Pune, Coimbatore, Kochi, Kolkata',
    employees: '350,000+ employees',
    logo: '/providers/Cognizant.png',
    detail: {
      overview: [
        { label: 'Category', value: 'AI & Analytics, Cloud Modernization, Digital Engineering, Industry Platforms' },
        { label: 'Headquarters', value: 'Teaneck, New Jersey, USA' },
        { label: 'India Presence', value: 'Chennai, Bengaluru, Hyderabad, Pune, Coimbatore, Kochi, Kolkata' },
        { label: 'Founded', value: '1994' },
        { label: 'Employees', value: '350,000+ globally' },
        { label: 'AI Focus Tagline', value: 'Modernizing the enterprise through cloud, data, and AI.' }
      ],
      analystSummary:
        'Cognizant positions itself as a large-scale digital transformation and AI-enabled services partner, blending consulting, engineering, and industry-specific delivery. Its narrative centers on "Modernizing the enterprise through cloud, data, and AI", powered by Cognizant Neuro, the Cognizant AI Labs ecosystem, and deep partnerships with AWS, Azure, and Google Cloud.',
      positioning: [
        'Neuro AI as the Transformation Core: Prebuilt accelerators for generative AI, automation, and multi-agent workflows.',
        'Domain-Centric Delivery: Strong specialization in BFSI, healthcare, pharma, retail, and manufacturing.',
        'Cloud + Data Modernization Strength: Expertise in application modernization, data platforms, and cloud-native architectures.',
        'Scaled Engineering Talent: Large global delivery footprint with agile pods and modernization squads.',
        'Outcome-Centric Engagements: Measurable business improvements across productivity, cost, experience, and operational resilience.',
        'Strategic Ecosystem Partnerships: Deep, long-standing alliances with all major hyperscalers and AI platform providers.'
      ],
      capabilities: [
        { category: 'AI Advisory & Reinvention', description: 'AI strategy, generative AI roadmaps, modernization blueprints, value realization frameworks, and governance models.' },
        { category: 'Platformized Delivery', description: 'Cognizant Neuro AI provides reusable components for model orchestration, workflow automation, and domain-specific intelligence.' },
        { category: 'Agentic AI Systems', description: 'Agents for claims automation, patient engagement, customer operations, retail planning, financial analytics, and IT operations.' },
        { category: 'Responsible AI & Compliance', description: 'Model explainability, risk assessments, governance workflows, and compliance frameworks tailored to healthcare, BFSI, and regulated sectors.' },
        { category: 'Industry Packs', description: 'Solutions for healthcare administration, BFSI KYC/AML, retail merchandising intelligence, pharma R&D, and manufacturing optimization.' }
      ],
      flagship: [
        { platform: 'Cognizant Neuro AI', purpose: 'Generative AI platform & accelerator suite', feature: 'Prebuilt agents, model pipelines, compliance guardrails' },
        { platform: 'TriZetto Healthcare Suite', purpose: 'Healthcare administration platform', feature: 'Claims processing, benefits management, analytics' },
        { platform: 'Cognizant Cloud Acceleration Suite', purpose: 'Cloud modernization & migration', feature: 'Landing zones, IaC, app modernization templates' },
        { platform: 'Cognizant Intelligent Process Automation', purpose: 'Automation & workflow intelligence', feature: 'RPA + AI orchestration + domain workflows' },
        { platform: 'Data & AI Modernization Toolkit', purpose: 'Data platform transformation', feature: 'Lakehouse patterns, ingestion pipelines, governance' }
      ],
      proofPoints: [
        'Neuro AI seeing strong enterprise adoption, powering pilots and production deployments across industries.',
        'Healthcare and BFSI remain core strengths, with major clients using Cognizant for modernization and AI programs.',
        'TriZetto widely adopted across U.S. payers and providers for operational transformation.',
        'Large-scale cloud transformation programs delivered with AWS, Azure, and Google Cloud alliances.'
      ]
    }
  },

  // === PROVIDER 17: EY ===
  {
    id: 'ey',
    name: 'EY',
    category: 'Enterprise AI & Business Transformation',
    tagline: 'Building a better working world through AI-powered transformation.',
    locations: 'London HQ • India: Bengaluru, Mumbai, Delhi-NCR, Hyderabad, Chennai, Kolkata',
    employees: '400,000+ employees',
    logo: '/providers/EY.png',
    detail: {
      overview: [
        { label: 'Category', value: 'AI Strategy, Business Transformation, Risk & Compliance' },
        { label: 'Headquarters', value: 'London, United Kingdom' },
        { label: 'India Presence', value: 'Bengaluru, Mumbai, Delhi-NCR, Hyderabad, Chennai, Kolkata' },
        { label: 'Founded', value: '1989' },
        { label: 'Employees', value: '400,000+ globally' },
        { label: 'AI Focus Tagline', value: 'Building a better working world through AI-powered transformation.' }
      ],
      analystSummary:
        'EY positions itself as a global leader in business transformation, combining deep industry expertise with AI-driven innovation. Through EY.ai and its comprehensive consulting practice, EY helps enterprises navigate complex transformations across finance, risk, supply chain, and customer operations with responsible AI at the core.',
      positioning: [
        'EY.ai Platform: Unified AI ecosystem combining strategy, technology, and governance for enterprise transformation.',
        'Trusted Advisor Heritage: Decades of industry expertise across audit, tax, consulting, and strategy.',
        'Risk & Compliance Leadership: Strong frameworks for AI governance, regulatory compliance, and responsible deployment.',
        'Industry-Deep Solutions: BFSI, healthcare, energy, government, and manufacturing specialization.',
        'Global Delivery Scale: Extensive delivery network with deep local market knowledge.',
        'Transformation Excellence: End-to-end capabilities from strategy through implementation and change management.'
      ],
      capabilities: [
        { category: 'AI Advisory & Reinvention', description: 'AI strategy development, business case creation, operating model design, and transformation roadmaps.' },
        { category: 'Platformized Delivery', description: 'EY.ai platform provides modular components for analytics, automation, and intelligent workflows.' },
        { category: 'Agentic AI Systems', description: 'Agents for financial operations, tax automation, audit analytics, risk monitoring, and compliance workflows.' },
        { category: 'Responsible AI & Compliance', description: 'Comprehensive AI governance, ethics frameworks, regulatory alignment, and audit-ready documentation.' },
        { category: 'Industry Packs', description: 'Solutions for financial services transformation, healthcare operations, energy transition, and public sector modernization.' }
      ],
      flagship: [
        { platform: 'EY.ai', purpose: 'Enterprise AI transformation platform', feature: 'Integrated AI capabilities across all EY services' },
        { platform: 'EY Fabric', purpose: 'Connected data & analytics platform', feature: 'Unified data management and AI-ready infrastructure' },
        { platform: 'EY Tax Technology', purpose: 'AI-powered tax automation', feature: 'Compliance automation, reporting, and analytics' },
        { platform: 'EY Helix', purpose: 'Audit analytics platform', feature: 'AI-driven audit procedures and risk assessment' }
      ],
      proofPoints: [
        'EY.ai investments driving significant growth in AI-enabled services across all practices.',
        'Strong adoption of AI-powered audit and tax solutions across global enterprises.',
        'Leadership in responsible AI frameworks for regulated industries.',
        'Deep transformation expertise across Fortune 500 clients worldwide.'
      ]
    }
  },

  // === PROVIDER 18: KPMG ===
  {
    id: 'kpmg',
    name: 'KPMG',
    category: 'Enterprise AI & Professional Services',
    tagline: 'Trusted AI transformation for the connected enterprise.',
    locations: 'Amstelveen HQ • India: Mumbai, Bengaluru, Delhi-NCR, Chennai, Hyderabad, Pune',
    employees: '265,000+ employees',
    logo: '/providers/KPMG.png',
    detail: {
      overview: [
        { label: 'Category', value: 'AI Advisory, Business Transformation, Audit & Assurance' },
        { label: 'Headquarters', value: 'Amstelveen, Netherlands' },
        { label: 'India Presence', value: 'Mumbai, Bengaluru, Delhi-NCR, Chennai, Hyderabad, Pune' },
        { label: 'Founded', value: '1987' },
        { label: 'Employees', value: '265,000+ globally' },
        { label: 'AI Focus Tagline', value: 'Trusted AI transformation for the connected enterprise.' }
      ],
      analystSummary:
        'KPMG positions itself as a trusted transformation partner combining professional services heritage with modern AI capabilities. Through KPMG Ignite and its Connected Enterprise framework, KPMG helps organizations achieve operational excellence through AI-powered business processes, risk management, and digital transformation.',
      positioning: [
        'KPMG Ignite: AI and automation platform accelerating enterprise transformation.',
        'Connected Enterprise Framework: Holistic approach to business transformation across front, middle, and back office.',
        'Trust & Assurance Leadership: Deep expertise in AI governance, risk management, and regulatory compliance.',
        'Industry Specialization: Strong verticals in BFSI, healthcare, energy, manufacturing, and public sector.',
        'Alliance Ecosystem: Strategic partnerships with Microsoft, Google, AWS, and ServiceNow.',
        'Global Delivery Excellence: Extensive delivery centers with local market expertise.'
      ],
      capabilities: [
        { category: 'AI Advisory & Reinvention', description: 'AI strategy, business transformation design, value realization, and governance frameworks.' },
        { category: 'Platformized Delivery', description: 'KPMG Ignite provides automation accelerators, analytics modules, and AI-ready components.' },
        { category: 'Agentic AI Systems', description: 'Agents for financial close, audit procedures, tax compliance, risk monitoring, and operational workflows.' },
        { category: 'Responsible AI & Compliance', description: 'AI ethics frameworks, model risk management, regulatory alignment, and assurance services.' },
        { category: 'Industry Packs', description: 'Solutions for banking transformation, healthcare modernization, energy transition, and government reform.' }
      ],
      flagship: [
        { platform: 'KPMG Ignite', purpose: 'AI & automation acceleration platform', feature: 'Pre-built solutions for finance, tax, and operations' },
        { platform: 'KPMG Clara', purpose: 'AI-powered audit platform', feature: 'Advanced analytics, risk assessment, and workflow automation' },
        { platform: 'KPMG Lighthouse', purpose: 'Data & analytics center of excellence', feature: 'AI development, data engineering, and analytics solutions' },
        { platform: 'Connected Enterprise', purpose: 'Business transformation framework', feature: 'End-to-end process optimization and digitization' }
      ],
      proofPoints: [
        'KPMG Ignite deployed across hundreds of enterprise clients for operational transformation.',
        'Clara platform transforming audit delivery with AI-powered analytics.',
        'Strong growth in AI advisory and governance services for regulated industries.',
        'Lighthouse centers delivering advanced analytics and AI solutions globally.'
      ]
    }
  },

  // === PROVIDER 19: McKinsey ===
  {
    id: 'mckinsey',
    name: 'McKinsey & Company',
    category: 'AI Strategy & Digital Transformation',
    tagline: 'Creating substantial and lasting improvements through AI-powered transformation.',
    locations: 'New York HQ • India: Mumbai, Delhi-NCR, Bengaluru, Chennai',
    employees: '45,000+ employees',
    logo: '/providers/McKinsey.png',
    detail: {
      overview: [
        { label: 'Category', value: 'AI Strategy, Management Consulting, Digital Transformation' },
        { label: 'Headquarters', value: 'New York, USA' },
        { label: 'India Presence', value: 'Mumbai, Delhi-NCR, Bengaluru, Chennai' },
        { label: 'Founded', value: '1926' },
        { label: 'Employees', value: '45,000+ globally' },
        { label: 'AI Focus Tagline', value: 'Creating substantial and lasting improvements through AI-powered transformation.' }
      ],
      analystSummary:
        'McKinsey positions itself as the premier strategic advisor for AI-led enterprise transformation, combining world-class strategy expertise with deep technical capabilities through QuantumBlack and McKinsey Digital. The firm focuses on helping executives drive organization-wide AI adoption with measurable business impact.',
      positioning: [
        'Strategy-Led AI Transformation: Deep C-suite relationships driving enterprise-wide AI adoption.',
        'QuantumBlack Integration: World-class AI and advanced analytics capabilities embedded in consulting.',
        'McKinsey Digital: Engineering and technical implementation at scale.',
        'Research Leadership: McKinsey Global Institute providing thought leadership on AI trends and impact.',
        'Industry Practice Depth: Specialized expertise across all major industries.',
        'Implementation Excellence: Bridge from strategy to execution with measurable outcomes.'
      ],
      capabilities: [
        { category: 'AI Advisory & Reinvention', description: 'C-suite AI strategy, business model innovation, operating model transformation, and value capture roadmaps.' },
        { category: 'Platformized Delivery', description: 'QuantumBlack AI solutions and McKinsey Digital engineering capabilities for scalable implementation.' },
        { category: 'Agentic AI Systems', description: 'Enterprise AI agents for strategic planning, operational optimization, customer intelligence, and risk management.' },
        { category: 'Responsible AI & Compliance', description: 'AI governance frameworks, ethical AI principles, and regulatory strategy consulting.' },
        { category: 'Industry Packs', description: 'Sector-specific AI solutions for BFSI, healthcare, retail, manufacturing, and public sector.' }
      ],
      flagship: [
        { platform: 'QuantumBlack AI', purpose: 'Advanced analytics & AI solutions', feature: 'Custom AI models, MLOps, and enterprise-scale deployment' },
        { platform: 'McKinsey Digital', purpose: 'Digital transformation & engineering', feature: 'Product development, cloud modernization, and technical implementation' },
        { platform: 'Leap by McKinsey', purpose: 'Business building & innovation', feature: 'New venture creation and AI-powered business models' },
        { platform: 'McKinsey Solutions', purpose: 'Proprietary analytics tools', feature: 'Industry benchmarks, diagnostic tools, and decision support' }
      ],
      proofPoints: [
        'QuantumBlack serving hundreds of global enterprises with AI-powered solutions.',
        'McKinsey Digital delivering large-scale digital transformations worldwide.',
        'Industry-leading research on AI adoption, impact, and best practices.',
        'Strong track record of measurable business impact from AI implementations.'
      ]
    }
  },

  // === PROVIDER 20: HCL ===
  {
    id: 'hcl',
    name: 'HCLTech',
    category: 'Enterprise AI & Digital Services',
    tagline: 'Supercharging progress through AI-powered digital transformation.',
    locations: 'Noida HQ • India: Noida, Bengaluru, Chennai, Hyderabad, Pune, Kolkata',
    employees: '225,000+ employees',
    logo: '/providers/HCL.png',
    detail: {
      overview: [
        { label: 'Category', value: 'AI Engineering, Cloud Services, Digital Transformation' },
        { label: 'Headquarters', value: 'Noida, India' },
        { label: 'India Presence', value: 'Noida, Bengaluru, Chennai, Hyderabad, Pune, Kolkata' },
        { label: 'Founded', value: '1991' },
        { label: 'Employees', value: '225,000+ globally' },
        { label: 'AI Focus Tagline', value: 'Supercharging progress through AI-powered digital transformation.' }
      ],
      analystSummary:
        'HCLTech positions itself as a global technology services leader with strong capabilities in AI engineering, cloud modernization, and industry-specific digital transformation. Through AI Force, HCL GenAI Labs, and deep engineering expertise, HCLTech enables enterprises to build and scale AI-powered operations across industries.',
      positioning: [
        'AI Force Platform: Enterprise AI platform combining GenAI, automation, and analytics.',
        'Engineering-First DNA: Strong heritage in product engineering and complex system integration.',
        'Cloud Leadership: Deep partnerships with all major hyperscalers for cloud-native AI deployment.',
        'Industry Solutions: Specialized platforms for BFSI, healthcare, manufacturing, and telecom.',
        'Mode 1-2-3 Framework: Balanced portfolio across core, digital, and ecosystem services.',
        'Global Delivery Scale: Extensive delivery network with 24/7 operations capability.'
      ],
      capabilities: [
        { category: 'AI Advisory & Reinvention', description: 'AI strategy, digital roadmaps, operating model design, and value realization frameworks.' },
        { category: 'Platformized Delivery', description: 'AI Force, DRYiCE, and industry accelerators provide modular AI components for enterprise deployment.' },
        { category: 'Agentic AI Systems', description: 'Agents for IT operations, customer service, supply chain, financial operations, and predictive maintenance.' },
        { category: 'Responsible AI & Compliance', description: 'AI governance, model monitoring, bias detection, and regulatory compliance frameworks.' },
        { category: 'Industry Packs', description: 'Solutions for banking core modernization, healthcare digitization, manufacturing IoT, and telecom network intelligence.' }
      ],
      flagship: [
        { platform: 'AI Force', purpose: 'Enterprise AI & GenAI platform', feature: 'Model orchestration, RAG, and agentic workflows' },
        { platform: 'DRYiCE', purpose: 'AI-powered IT operations', feature: 'AIOps, automation, and intelligent service management' },
        { platform: 'HCL GenAI Labs', purpose: 'GenAI innovation & development', feature: 'Custom model development, fine-tuning, and deployment' },
        { platform: 'CloudSMART', purpose: 'Cloud transformation platform', feature: 'Multi-cloud management, migration, and optimization' }
      ],
      proofPoints: [
        'AI Force platform adopted by hundreds of enterprise clients for AI-powered operations.',
        'DRYiCE delivering significant automation and efficiency gains across IT operations.',
        'Strong growth in GenAI services with HCL GenAI Labs driving innovation.',
        'Deep hyperscaler partnerships enabling large-scale cloud and AI transformations.'
      ]
    }
  },

  // === PROVIDER 21: Tech Mahindra ===
  {
    id: 'tech-mahindra',
    name: 'Tech Mahindra',
    category: 'Enterprise AI & Connected Solutions',
    tagline: 'Delivering connected experiences through AI-powered transformation.',
    locations: 'Pune HQ • India: Pune, Bengaluru, Hyderabad, Chennai, Noida, Mumbai',
    employees: '150,000+ employees',
    logo: '/providers/Tech Mahindra.png',
    detail: {
      overview: [
        { label: 'Category', value: 'AI Engineering, Telecom Solutions, Digital Transformation' },
        { label: 'Headquarters', value: 'Pune, India' },
        { label: 'India Presence', value: 'Pune, Bengaluru, Hyderabad, Chennai, Noida, Mumbai' },
        { label: 'Founded', value: '1986' },
        { label: 'Employees', value: '150,000+ globally' },
        { label: 'AI Focus Tagline', value: 'Delivering connected experiences through AI-powered transformation.' }
      ],
      analystSummary:
        'Tech Mahindra positions itself as a specialist in connected world transformation, with deep expertise in telecom, 5G, and network-centric AI solutions. Through TechM amplifAI and its network engineering heritage, the company enables enterprises to leverage AI for connected experiences, network optimization, and industry digital transformation.',
      positioning: [
        'TechM amplifAI: Enterprise AI platform for generative AI and intelligent automation.',
        'Telecom & Network Leadership: Deep heritage in telecom transformation and 5G solutions.',
        'Connected World Vision: Focus on connected enterprises, smart cities, and Industry 4.0.',
        'Industry Verticals: Strong presence in telecom, manufacturing, BFSI, and healthcare.',
        'Ecosystem Partnerships: Strategic alliances with hyperscalers and telecom equipment vendors.',
        'NXT.NOW Framework: Transformation methodology combining human-centered design with AI.'
      ],
      capabilities: [
        { category: 'AI Advisory & Reinvention', description: 'AI strategy, connected enterprise design, network transformation, and industry-specific roadmaps.' },
        { category: 'Platformized Delivery', description: 'TechM amplifAI and industry accelerators provide AI-ready components for rapid deployment.' },
        { category: 'Agentic AI Systems', description: 'Agents for network operations, customer experience, manufacturing automation, and connected services.' },
        { category: 'Responsible AI & Compliance', description: 'AI governance, telecom regulatory compliance, and responsible automation frameworks.' },
        { category: 'Industry Packs', description: 'Telecom network intelligence, manufacturing digital twins, BFSI modernization, and smart city solutions.' }
      ],
      flagship: [
        { platform: 'TechM amplifAI', purpose: 'Enterprise GenAI & AI platform', feature: 'LLM orchestration, automation, and industry agents' },
        { platform: 'Network Services', purpose: 'Telecom transformation suite', feature: '5G deployment, network optimization, and OSS/BSS modernization' },
        { platform: 'Connected World Platform', purpose: 'IoT & connected enterprise', feature: 'Device management, edge AI, and smart solutions' },
        { platform: 'Makers Lab', purpose: 'Innovation & R&D hub', feature: 'AI/ML research, prototyping, and emerging tech' }
      ],
      proofPoints: [
        'TechM amplifAI driving GenAI adoption across enterprise clients globally.',
        'Leading telecom transformation partner serving major operators worldwide.',
        'Strong growth in connected manufacturing and Industry 4.0 solutions.',
        'Makers Lab innovations contributing to practical AI applications across industries.'
      ]
    }
  },

  // === PROVIDER 22: Wipro ===
  {
    id: 'wipro',
    name: 'Wipro',
    category: 'Enterprise AI & Digital Transformation',
    tagline: 'Enabling AI-led business transformation at scale.',
    locations: 'Bengaluru HQ • India: Bengaluru, Hyderabad, Chennai, Pune, Noida, Kolkata',
    employees: '250,000+ employees',
    logo: '/providers/Wipro.png',
    detail: {
      overview: [
        { label: 'Category', value: 'AI Engineering, Cloud Services, Business Transformation' },
        { label: 'Headquarters', value: 'Bengaluru, India' },
        { label: 'India Presence', value: 'Bengaluru, Hyderabad, Chennai, Pune, Noida, Kolkata' },
        { label: 'Founded', value: '1945' },
        { label: 'Employees', value: '250,000+ globally' },
        { label: 'AI Focus Tagline', value: 'Enabling AI-led business transformation at scale.' }
      ],
      analystSummary:
        'Wipro positions itself as a leading global IT services company with strong capabilities in AI-powered transformation, cloud modernization, and industry-specific solutions. Through Wipro ai360 and its comprehensive suite of AI accelerators, Wipro enables enterprises to embed AI across operations, enhance customer experiences, and drive sustainable growth.',
      positioning: [
        'Wipro ai360: Comprehensive AI strategy embedding AI across all services and industries.',
        'FullStride Cloud: Leading cloud transformation capability with hyperscaler partnerships.',
        'Industry Deep Solutions: Strong verticals in BFSI, healthcare, manufacturing, and consumer.',
        'Topcoder Community: Access to global talent for innovation and specialized AI development.',
        'Responsible AI Focus: Ethics, transparency, and governance embedded in AI delivery.',
        'Global Delivery Excellence: Extensive delivery network with diverse talent and capabilities.'
      ],
      capabilities: [
        { category: 'AI Advisory & Reinvention', description: 'AI strategy, transformation roadmaps, operating model design, and value realization frameworks.' },
        { category: 'Platformized Delivery', description: 'Wipro ai360 and HOLMES provide AI components for intelligent automation and enterprise AI deployment.' },
        { category: 'Agentic AI Systems', description: 'Agents for customer service, IT operations, supply chain optimization, financial operations, and HR automation.' },
        { category: 'Responsible AI & Compliance', description: 'AI ethics frameworks, bias detection, model governance, and regulatory compliance.' },
        { category: 'Industry Packs', description: 'Solutions for banking modernization, healthcare transformation, manufacturing IoT, and retail personalization.' }
      ],
      flagship: [
        { platform: 'Wipro ai360', purpose: 'Enterprise AI transformation strategy', feature: 'AI-first approach across all services and industries' },
        { platform: 'HOLMES', purpose: 'AI & automation platform', feature: 'Cognitive automation, intelligent process optimization' },
        { platform: 'FullStride Cloud', purpose: 'Cloud transformation suite', feature: 'Multi-cloud management, migration, and optimization' },
        { platform: 'Wipro LiVE Workspace', purpose: 'Digital workplace solutions', feature: 'AI-powered collaboration and productivity' }
      ],
      proofPoints: [
        'Wipro ai360 driving significant AI adoption across enterprise clients globally.',
        'HOLMES platform delivering automation and efficiency gains across industries.',
        'Strong cloud transformation track record with major hyperscaler partnerships.',
        'Growing portfolio of responsible AI implementations in regulated industries.'
      ]
    }
  },

  // === PROVIDER 23: Hexaware ===
  {
    id: 'hexaware',
    name: 'Hexaware',
    category: 'AI Engineering & Digital Services',
    tagline: 'Your partner in digital and AI-led business transformation.',
    locations: 'Mumbai HQ • India: Mumbai, Chennai, Pune, Bengaluru, Nagpur',
    employees: '30,000+ employees',
    logo: '/providers/Hexaware.png',
    detail: {
      overview: [
        { label: 'Category', value: 'AI Engineering, Cloud Services, Business Process Automation' },
        { label: 'Headquarters', value: 'Mumbai, India' },
        { label: 'India Presence', value: 'Mumbai, Chennai, Pune, Bengaluru, Nagpur' },
        { label: 'Founded', value: '1990' },
        { label: 'Employees', value: '30,000+ globally' },
        { label: 'AI Focus Tagline', value: 'Your partner in digital and AI-led business transformation.' }
      ],
      analystSummary:
        'Hexaware positions itself as an agile, customer-focused IT services partner specializing in automation, cloud, and AI-driven transformation. Through Tensai and its portfolio of accelerators, Hexaware helps enterprises modernize operations, automate processes, and enhance customer experiences with AI at the core.',
      positioning: [
        'Tensai Platform: AI and automation platform for intelligent enterprise operations.',
        'Customer-Centric Approach: High customer satisfaction with agile, outcome-focused delivery.',
        'Industry Focus: Strong presence in BFSI, healthcare, travel, and manufacturing.',
        'Automation Excellence: Leading capabilities in RPA, intelligent automation, and process optimization.',
        'Cloud Modernization: Strong partnerships with hyperscalers for cloud transformation.',
        'Nearshore Advantage: Strategic delivery centers enabling effective collaboration.'
      ],
      capabilities: [
        { category: 'AI Advisory & Reinvention', description: 'AI strategy, automation roadmaps, cloud modernization, and digital transformation consulting.' },
        { category: 'Platformized Delivery', description: 'Tensai and automation accelerators provide modular components for rapid AI deployment.' },
        { category: 'Agentic AI Systems', description: 'Agents for process automation, customer service, IT operations, and business workflow optimization.' },
        { category: 'Responsible AI & Compliance', description: 'AI governance, compliance automation, and responsible deployment frameworks.' },
        { category: 'Industry Packs', description: 'Solutions for banking operations, healthcare administration, travel modernization, and manufacturing automation.' }
      ],
      flagship: [
        { platform: 'Tensai', purpose: 'AI & intelligent automation platform', feature: 'RPA, cognitive automation, and process intelligence' },
        { platform: 'RapidX', purpose: 'Digital transformation accelerator', feature: 'Pre-built solutions and rapid deployment templates' },
        { platform: 'Hexaware Cloud Suite', purpose: 'Cloud transformation services', feature: 'Migration, modernization, and managed services' },
        { platform: 'Amaze', purpose: 'Customer experience platform', feature: 'Personalization, engagement, and journey optimization' }
      ],
      proofPoints: [
        'Tensai platform deployed across hundreds of enterprise automation programs.',
        'High customer satisfaction scores driving strong client retention.',
        'Strong growth in AI and automation services across key industries.',
        'Recognized for delivery excellence and customer-centric approach.'
      ]
    }
  },

  // === PROVIDER 24: EXL ===
  {
    id: 'exl',
    name: 'EXL',
    category: 'AI & Analytics, Business Process Management',
    tagline: 'Making sense of data to drive business outcomes.',
    locations: 'New York HQ • India: Noida, Bengaluru, Pune, Hyderabad, Chennai',
    employees: '50,000+ employees',
    logo: '/providers/EXL.png',
    detail: {
      overview: [
        { label: 'Category', value: 'AI & Analytics, Business Process Management, Data Services' },
        { label: 'Headquarters', value: 'New York, USA' },
        { label: 'India Presence', value: 'Noida, Bengaluru, Pune, Hyderabad, Chennai' },
        { label: 'Founded', value: '1999' },
        { label: 'Employees', value: '50,000+ globally' },
        { label: 'AI Focus Tagline', value: 'Making sense of data to drive business outcomes.' }
      ],
      analystSummary:
        'EXL positions itself as a data analytics and AI-led business process management company, helping enterprises transform operations through applied AI, advanced analytics, and domain expertise. With deep capabilities in insurance, healthcare, banking, and utilities, EXL combines process knowledge with AI to deliver measurable business outcomes.',
      positioning: [
        'Data + AI + Domain Expertise: Unique combination of analytics, AI, and deep industry knowledge.',
        'Insurance Excellence: Market-leading capabilities in insurance operations and analytics.',
        'Healthcare Transformation: Strong presence in healthcare administration and analytics.',
        'EXL EXELIA.AI: Generative AI platform for enterprise transformation.',
        'Analytics Leadership: Advanced analytics driving decision intelligence across industries.',
        'Process + Technology Integration: BPM heritage combined with modern AI capabilities.'
      ],
      capabilities: [
        { category: 'AI Advisory & Reinvention', description: 'Analytics strategy, AI roadmaps, process transformation, and value realization frameworks.' },
        { category: 'Platformized Delivery', description: 'EXL EXELIA.AI and analytics platforms provide domain-specific AI solutions.' },
        { category: 'Agentic AI Systems', description: 'Agents for claims processing, underwriting, customer service, fraud detection, and operational optimization.' },
        { category: 'Responsible AI & Compliance', description: 'Model governance, regulatory compliance, and responsible AI frameworks for regulated industries.' },
        { category: 'Industry Packs', description: 'Solutions for insurance operations, healthcare administration, banking analytics, and utilities optimization.' }
      ],
      flagship: [
        { platform: 'EXL EXELIA.AI', purpose: 'Generative AI transformation platform', feature: 'Domain-specific AI models and enterprise deployment' },
        { platform: 'EXL Analytics', purpose: 'Advanced analytics suite', feature: 'Predictive modeling, decision intelligence, and insights' },
        { platform: 'Insurance Operations Platform', purpose: 'End-to-end insurance services', feature: 'Claims, underwriting, policy admin, and analytics' },
        { platform: 'Healthcare Management Suite', purpose: 'Healthcare administration solutions', feature: 'Claims processing, utilization management, and analytics' }
      ],
      proofPoints: [
        'EXL EXELIA.AI driving GenAI adoption across insurance and healthcare clients.',
        'Market-leading position in insurance operations and analytics.',
        'Strong growth in healthcare transformation services.',
        'Advanced analytics delivering measurable ROI across client engagements.'
      ]
    }
  },

  // === PROVIDER 25: LTTS ===
  {
    id: 'ltts',
    name: 'L&T Technology Services',
    category: 'Engineering R&D & Industrial AI',
    tagline: 'Engineering a sustainable future through AI-powered innovation.',
    locations: 'Vadodara HQ • India: Vadodara, Bengaluru, Mumbai, Pune, Chennai, Mysuru',
    employees: '23,000+ employees',
    logo: '/providers/LTTS.png',
    detail: {
      overview: [
        { label: 'Category', value: 'Engineering R&D, Industrial AI, Product Development' },
        { label: 'Headquarters', value: 'Vadodara, India' },
        { label: 'India Presence', value: 'Vadodara, Bengaluru, Mumbai, Pune, Chennai, Mysuru' },
        { label: 'Founded', value: '2012' },
        { label: 'Employees', value: '23,000+ globally' },
        { label: 'AI Focus Tagline', value: 'Engineering a sustainable future through AI-powered innovation.' }
      ],
      analystSummary:
        'L&T Technology Services positions itself as a global leader in engineering R&D services with deep expertise in industrial AI, product engineering, and sustainable technology solutions. Serving industries from automotive to aerospace, medical devices to plant engineering, LTTS combines engineering excellence with AI to drive innovation and operational efficiency.',
      positioning: [
        'Engineering R&D Leadership: Deep heritage in complex product engineering and industrial systems.',
        'Industrial AI Focus: AI embedded in manufacturing, automotive, aerospace, and medical devices.',
        'Sustainability Innovation: Technology solutions driving decarbonization and sustainable operations.',
        'Digital Twin Expertise: Advanced simulation and digital twin capabilities for industrial sectors.',
        'Chip-to-Cloud Solutions: End-to-end capabilities from embedded systems to cloud platforms.',
        'Industry 4.0 Excellence: Smart manufacturing, automation, and connected factory solutions.'
      ],
      capabilities: [
        { category: 'AI Advisory & Reinvention', description: 'Engineering AI strategy, product innovation roadmaps, sustainability transformation, and R&D optimization.' },
        { category: 'Platformized Delivery', description: 'Engineering accelerators and AI platforms for product development and industrial automation.' },
        { category: 'Agentic AI Systems', description: 'Agents for predictive maintenance, quality control, supply chain optimization, and autonomous systems.' },
        { category: 'Responsible AI & Compliance', description: 'Safety-critical AI, regulatory compliance, and responsible engineering practices.' },
        { category: 'Industry Packs', description: 'Solutions for automotive engineering, aerospace systems, medical devices, plant engineering, and telecom infrastructure.' }
      ],
      flagship: [
        { platform: 'Digital Manufacturing Suite', purpose: 'Industry 4.0 & smart factory', feature: 'AI-powered automation, predictive maintenance, quality control' },
        { platform: 'Autonomous Systems Platform', purpose: 'ADAS & autonomous engineering', feature: 'Perception, planning, and control for autonomous vehicles' },
        { platform: 'MedTech Solutions', purpose: 'Medical device engineering', feature: 'AI-enabled diagnostics, connected health, regulatory compliance' },
        { platform: 'Sustainability Engineering', purpose: 'Green technology solutions', feature: 'Decarbonization, energy efficiency, sustainable design' }
      ],
      proofPoints: [
        'Leading engineering R&D partner to global automotive and aerospace companies.',
        'Strong growth in digital manufacturing and Industry 4.0 solutions.',
        'MedTech solutions deployed across global healthcare device companies.',
        'Sustainability innovations driving measurable impact for industrial clients.'
      ]
    }
  },

  // === PROVIDER 26: Zensar ===
  {
    id: 'zensar',
    name: 'Zensar',
    category: 'Digital Transformation & AI Services',
    tagline: 'Conceptualize. Build. Transform.',
    locations: 'Pune HQ • India: Pune, Hyderabad, Bengaluru, Chennai, Mumbai',
    employees: '11,000+ employees',
    logo: '/providers/Zensar.png',
    detail: {
      overview: [
        { label: 'Category', value: 'Digital Transformation, AI Engineering, Experience Design' },
        { label: 'Headquarters', value: 'Pune, India' },
        { label: 'India Presence', value: 'Pune, Hyderabad, Bengaluru, Chennai, Mumbai' },
        { label: 'Founded', value: '1991' },
        { label: 'Employees', value: '11,000+ globally' },
        { label: 'AI Focus Tagline', value: 'Conceptualize. Build. Transform.' }
      ],
      analystSummary:
        'Zensar positions itself as an experience-led digital transformation partner, combining design thinking with engineering excellence and AI capabilities. As part of the RPG Group, Zensar helps enterprises reimagine customer and employee experiences while modernizing operations through cloud, data, and AI-powered solutions.',
      positioning: [
        'Experience-Led Transformation: Design thinking and experience engineering at the core.',
        'ZenAIR Platform: AI and automation platform for enterprise modernization.',
        'Industry Focus: Strong presence in BFSI, retail, manufacturing, and hi-tech.',
        'Cloud & Data Excellence: Comprehensive cloud transformation and data modernization capabilities.',
        'Agile Delivery Model: Customer-centric, outcome-focused delivery approach.',
        'RPG Group Strength: Backed by strong parent organization with diverse industry exposure.'
      ],
      capabilities: [
        { category: 'AI Advisory & Reinvention', description: 'Digital strategy, experience design, AI roadmaps, and transformation consulting.' },
        { category: 'Platformized Delivery', description: 'ZenAIR and experience platforms provide modular components for digital transformation.' },
        { category: 'Agentic AI Systems', description: 'Agents for customer experience, IT operations, retail optimization, and business process automation.' },
        { category: 'Responsible AI & Compliance', description: 'AI governance, compliance automation, and responsible deployment frameworks.' },
        { category: 'Industry Packs', description: 'Solutions for banking modernization, retail transformation, manufacturing automation, and hi-tech product development.' }
      ],
      flagship: [
        { platform: 'ZenAIR', purpose: 'AI & automation platform', feature: 'Intelligent automation, process optimization, and AI agents' },
        { platform: 'Experience Engineering', purpose: 'Digital experience transformation', feature: 'Design thinking, CX/EX optimization, and journey mapping' },
        { platform: 'Cloud Excellence', purpose: 'Cloud transformation services', feature: 'Migration, modernization, and cloud-native development' },
        { platform: 'Data & Analytics', purpose: 'Data modernization suite', feature: 'Data platforms, analytics, and AI/ML engineering' }
      ],
      proofPoints: [
        'ZenAIR platform driving automation across enterprise clients.',
        'Strong customer satisfaction with experience-led delivery approach.',
        'Growing AI and cloud transformation portfolio across industries.',
        'Recognized for design-led digital transformation excellence.'
      ]
    }
  },

  // === PROVIDER 27: BCG ===
  {
    id: 'bcg',
    name: 'Boston Consulting Group',
    category: 'AI Strategy & Management Consulting',
    tagline: 'Unlocking the potential of AI to drive competitive advantage.',
    locations: 'Boston HQ • India: Mumbai, Delhi-NCR, Chennai, Bengaluru',
    employees: '30,000+ employees',
    logo: '/providers/BGC.png',
    detail: {
      overview: [
        { label: 'Category', value: 'AI Strategy, Management Consulting, Digital Transformation' },
        { label: 'Headquarters', value: 'Boston, Massachusetts, USA' },
        { label: 'India Presence', value: 'Mumbai, Delhi-NCR, Chennai, Bengaluru' },
        { label: 'Founded', value: '1963' },
        { label: 'Employees', value: '30,000+ globally' },
        { label: 'AI Focus Tagline', value: 'Unlocking the potential of AI to drive competitive advantage.' }
      ],
      analystSummary:
        'Boston Consulting Group positions itself as a leading management consulting firm with world-class AI and digital transformation capabilities. Through BCG X and BCG Henderson Institute, BCG combines strategic consulting with technical implementation, helping executives drive organization-wide AI adoption and business model innovation.',
      positioning: [
        'BCG X Integration: Digital build and design capabilities embedded in strategic consulting.',
        'Strategy + Implementation: Bridge from boardroom strategy to operational execution.',
        'BCG Henderson Institute: Thought leadership on AI trends, business strategy, and innovation.',
        'Industry Practice Depth: Deep expertise across all major industries and functional areas.',
        'Executive Relationships: Strong C-suite access driving enterprise-wide transformation.',
        'Global Talent: Top-tier consulting talent combined with technical specialists.'
      ],
      capabilities: [
        { category: 'AI Advisory & Reinvention', description: 'C-suite AI strategy, business model innovation, operating model transformation, and value capture.' },
        { category: 'Platformized Delivery', description: 'BCG X provides design, build, and scale capabilities for AI-powered products and platforms.' },
        { category: 'Agentic AI Systems', description: 'Enterprise AI agents for strategic planning, operational excellence, customer intelligence, and risk management.' },
        { category: 'Responsible AI & Compliance', description: 'AI governance frameworks, ethical AI principles, and regulatory strategy consulting.' },
        { category: 'Industry Packs', description: 'Sector-specific AI solutions for BFSI, healthcare, consumer, industrial goods, and public sector.' }
      ],
      flagship: [
        { platform: 'BCG X', purpose: 'Digital build & design unit', feature: 'Product development, engineering, and AI implementation' },
        { platform: 'BCG GAMMA', purpose: 'AI & advanced analytics', feature: 'Custom AI solutions, data science, and ML engineering' },
        { platform: 'BCG Lighthouse', purpose: 'AI use case library', feature: 'Pre-built AI applications and industry solutions' },
        { platform: 'BCG Turn', purpose: 'Transformation platform', feature: 'Large-scale change management and implementation' }
      ],
      proofPoints: [
        'BCG X serving hundreds of global enterprises with AI-powered digital products.',
        'BCG GAMMA delivering advanced analytics and AI solutions worldwide.',
        'Industry-leading research on AI strategy, adoption, and competitive impact.',
        'Strong track record of measurable business impact from AI transformations.'
      ]
    }
  }
]
