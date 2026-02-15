export type AssessmentChoice = string

export interface AssessmentQuestion {
  id: string
  text: string
  choices: AssessmentChoice[]
}

export interface AssessmentPillar {
  id: string
  title: string
  questions: AssessmentQuestion[]
}

export const assessmentPillars: AssessmentPillar[] = [
  {
    id: 'strategy_vision',
    title: 'Pillar 1: Strategy & Vision',
    questions: [
      {
        id: 'sv_q1',
        text: 'Has your GCC defined a clear AI-First vision aligned with enterprise strategy?',
        choices: [
          'No vision at all',
          'Exploring AI but not yet defined',
          'Draft vision exists, not aligned with enterprise strategy',
          'Clear AI vision defined, partially aligned with enterprise strategy',
          'Fully defined AI-First vision, embedded into enterprise strategy'
        ]
      },
      {
        id: 'sv_q2',
        text: 'Do you have C-level sponsorship (CIO/CTO/CDIO) for AI-First initiatives?',
        choices: [
          'No senior sponsorship',
          'Functional managers only',
          'One senior sponsor, limited engagement',
          'Multiple C-level sponsors, occasional involvement',
          'Strong, consistent C-level sponsorship with board visibility'
        ]
      },
      {
        id: 'sv_q3',
        text: 'Is AI-First positioning part of your GCC charter (not just cost optimization)?',
        choices: [
          'Not considered',
          'Cost focus dominates, AI is side activity',
          'AI-First mentioned but not central',
          'AI-First integrated in parts of GCC charter',
          'AI-First central to GCC\'s identity and charter'
        ]
      },
      {
        id: 'sv_q4',
        text: 'Have you defined measurable AI outcomes (cost, productivity, revenue impact)?',
        choices: [
          'No outcomes defined',
          'Broad intentions, no metrics',
          'Some metrics defined, tracked inconsistently',
          'Clear metrics defined, tracked regularly',
          'Metrics defined, linked to enterprise KPIs, reported at leadership level'
        ]
      }
    ]
  },
  {
    id: 'talent_skills',
    title: 'Pillar 2: Talent & Skills',
    questions: [
      {
        id: 'ts_q1',
        text: 'Do you have dedicated AI talent (ML engineers, data scientists, MLOps)?',
        choices: ['None', 'Small exploratory team (<5)', 'Core team with limited scale', 'Dedicated function with multiple roles', 'Scaled, multi-disciplinary AI talent pool']
      },
      {
        id: 'ts_q2',
        text: 'Are AI skills part of every role (finance, HR, engineering)?',
        choices: ['No, siloed in tech teams only', 'Limited awareness training', 'AI skills embedded in select functions', 'Broad adoption across functions with structured programs', 'AI literacy and application embedded across all roles']
      },
      {
        id: 'ts_q3',
        text: 'Do you run continuous skilling programs on GenAI, LLMOps, and agentic AI?',
        choices: ['None', 'One-off training sessions', 'Periodic skilling programs, not continuous', 'Regular, structured skilling programs', 'Continuous learning culture with certifications & career paths']
      },
      {
        id: 'ts_q4',
        text: 'Have you created an AI-native job architecture for GCC teams?',
        choices: ['Not considered', 'Ad-hoc roles created for AI projects', 'Partial job redesigns in pilot teams', 'Formal job roles updated in multiple functions', 'AI-native job architecture institutionalized']
      }
    ]
  },
  {
    id: 'technology_infra',
    title: 'Pillar 3: Technology & Infrastructure',
    questions: [
      {
        id: 'ti_q1',
        text: 'Do you have cloud-native, AI-ready infrastructure in your GCC?',
        choices: ['No', 'Limited cloud usage, not AI-ready', 'Hybrid infra, partially AI-ready', 'Fully cloud-native, scalable infra', 'Cloud-native infra optimized for AI workloads']
      },
      {
        id: 'ti_q2',
        text: 'Are you running data pipelines & ML platforms internally?',
        choices: ['None', 'Manual data integration only', 'Basic pipelines, external ML reliance', 'In-house pipelines + ML platforms in limited use', 'Enterprise-scale ML pipelines and platforms']
      },
      {
        id: 'ti_q3',
        text: 'Have you deployed AI accelerators/agents for business functions?',
        choices: ['None', 'Experiments only', 'Deployed in one function', 'Deployed in multiple functions', 'Standard practice across the GCC']
      },
      {
        id: 'ti_q4',
        text: 'Do you have sandbox environments for experimentation?',
        choices: ['None', 'Ad-hoc test environments', 'Dedicated sandbox for a few teams', 'Enterprise sandbox with governance', 'Continuous experimentation built into operations']
      }
    ]
  },
  {
    id: 'operating_model',
    title: 'Pillar 4: Operating Model',
    questions: [
      {
        id: 'om_q1',
        text: 'Have you embedded AI into end-to-end workflows (finance close, HR ops, ITSM)?',
        choices: ['Not yet', 'Pilots in isolated processes', 'AI in one or two workflows', 'Multiple workflows integrated', 'AI across end-to-end enterprise workflows']
      },
      {
        id: 'om_q2',
        text: 'Are AI agents part of your governance dashboards and KPIs?',
        choices: ['No', 'Informal tracking only', 'Included in pilot dashboards', 'Partially integrated in KPIs', 'Fully embedded in governance & KPI structures']
      },
      {
        id: 'om_q3',
        text: 'Do you run Zero-Based AI Audits to identify automation potential?',
        choices: ['No', 'Once-off only', 'Conducted annually', 'Conducted quarterly', 'Continuous auditing and automation pipeline']
      },
      {
        id: 'om_q4',
        text: 'Are AI initiatives scalable across geographies/functions, not just pilots?',
        choices: ['Not scalable', 'Scaled in single geography/function', 'Scaled in multiple areas', 'Enterprise-wide scaling underway', 'Fully scaled globally']
      }
    ]
  },
  {
    id: 'innovation_ecosystem',
    title: 'Pillar 5: Innovation & Ecosystem',
    questions: [
      {
        id: 'ie_q1',
        text: 'Do you have an AI Lab / CoE inside your GCC?',
        choices: ['None', 'Planned', 'Established, early stage', 'Functional CoE delivering value', 'Mature CoE driving enterprise-wide innovation']
      },
      {
        id: 'ie_q2',
        text: 'Are you co-creating with startups, academia, and ecosystem partners?',
        choices: ['No', 'Occasional POCs', 'Regular partnerships in some areas', 'Formal co-creation programs', 'Strategic ecosystem integration']
      },
      {
        id: 'ie_q3',
        text: 'Have you piloted agentic AI use cases beyond chatbots?',
        choices: ['None', 'Early pilots', 'Multiple POCs', 'Live use cases in select areas', 'Multiple scaled use cases delivering value']
      },
      {
        id: 'ie_q4',
        text: 'Are you funding experimentation budgets for AI-driven pilots?',
        choices: ['No', 'Ad-hoc funding', 'Budgeted annually', 'Dedicated innovation fund', 'Continuous experimentation budgets with ROI tracking']
      }
    ]
  },
  {
    id: 'governance_risk',
    title: 'Pillar 6: Governance & Risk',
    questions: [
      {
        id: 'gr_q1',
        text: 'Do you have AI governance policies (ethics, explainability, compliance)?',
        choices: ['None', 'Draft stage', 'Policies defined but not enforced', 'Policies enforced with partial coverage', 'Mature governance embedded enterprise-wide']
      },
      {
        id: 'gr_q2',
        text: 'Are AI outputs auditable and regulator-ready?',
        choices: ['No', 'Limited ability', 'Some audit readiness', 'Most AI outputs auditable', 'Fully auditable and regulator-certified']
      },
      {
        id: 'gr_q3',
        text: 'Do you run bias, security, and ITAR/PII audits on AI models?',
        choices: ['None', 'Ad-hoc audits', 'Annual audits', 'Quarterly audits', 'Continuous monitoring']
      },
      {
        id: 'gr_q4',
        text: 'Is there a multi-stakeholder governance council for AI in your GCC?',
        choices: ['No', 'Informal working group', 'Formal council without decision rights', 'Active council with decision rights', 'Enterprise-wide governance council, linked to board']
      }
    ]
  },
  {
    id: 'impact_outcomes',
    title: 'Pillar 7: Impact & Outcomes',
    questions: [
      {
        id: 'io_q1',
        text: 'Have AI initiatives delivered measurable cost savings (e.g., 20-30%)?',
        choices: ['None', '<10% savings', '10-20% savings', '20-30% savings', '>30% savings']
      },
      {
        id: 'io_q2',
        text: 'Have you improved customer satisfaction / employee experience with AI?',
        choices: ['No', 'Anecdotal improvement', 'Some improvement, no metrics', 'Measurable improvements in key metrics', 'Significant, sustained improvements']
      },
      {
        id: 'io_q3',
        text: 'Are AI-first initiatives generating new revenue models or products?',
        choices: ['None', 'Early experiments', 'Limited new models', 'Multiple pilots generating revenue', 'Scaled new revenue streams']
      },
      {
        id: 'io_q4',
        text: 'Are your productivity gains from AI compounding year over year?',
        choices: ['No gains yet', 'One-time gains only', 'Gains in some functions', 'Gains visible across multiple years/functions', 'Continuous, compounding gains across GCC']
      }
    ]
  }
]
