# Persona Flows - Orbys360 Directory Migration

> Review these flows before implementation begins.

---

## 1. Anonymous Visitor Flow

```mermaid
flowchart TD
    A[Lands on Homepage] --> B[Sees Hero Section]
    B --> C["Sees 'Search for Your Agent' Section"]
    C --> D{Interacts?}

    D -->|Searches| E[Redirected to /directory with search query]
    D -->|Clicks featured agent| F[Agent Detail Page]
    D -->|Scrolls down| G[Remaining Landing Sections]

    E --> H[Directory Page with filters and search]
    H --> F

    F --> I[Public: Agent name, tagline, company, description]
    I --> J[Blurred: Use Cases, Integrations, Outcomes]
    J --> K{Wants full details?}

    K -->|Sign Up| L[Clerk Sign-Up then GCC Onboarding]
    K -->|No| M[Continue browsing]

    F --> N[Clicks Company Name]
    N --> O[Company Profile Page]
    O --> P[Company info + agent list]

    H --> Q[Clicks Category Chip]
    Q --> R[Category Page]
    R --> F

    A --> S[Navbar: AI Pulse, Orbyt, Content Pages]
    S --> T[Browse content freely, no gate]
```



---

## 2. GCC User Flow

```mermaid
flowchart TD
    A[Anonymous Visitor] --> B{Triggers gated action}
    B --> C[Clerk Sign-Up via Magic Link]
    C --> D[GCC Onboarding: 4 Fields]
    D --> D1[1. Name]
    D --> D2[2. Organization Details]
    D --> D3[3. Email Address]
    D --> D4[4. Industry]
    D1 & D2 & D3 & D4 --> E[GCC Profile Created in Convex]
    E --> F[Full Access Granted]

    F --> G[Directory Browsing]
    G --> H[Agent Detail, Full Content Unlocked]

    H --> I{Actions}
    I -->|Shortlist| J[Agent added to Shortlist]
    I -->|Add to Compare| K[Agent added to Compare Tray, max 4]
    I -->|Contact Provider| L[Contact Request, Admin Approval Gate]

    K --> M{Compare Tray has 2+ agents?}
    M -->|Yes| N[Compare Now, /compare page]
    N --> O[Side-by-side comparison table]

    J --> P[GCC Dashboard]
    P --> P1[Shortlisted Agents: view, remove, contact]
    P --> P2[Current Requests: track contact request status]
```



---

## 3. Provider Flow (Two Paths)

```mermaid
flowchart TD
    A[Provider signs up from navbar] --> B[/onboarding/]
    B --> C[Choose 'I'm listing AI agents & services']
    C --> D[/provider/setup/]
    D --> E{Setup path}

    E -->|Claim existing| F[Browse directory and open company page]
    F --> G[Submit claim with corporate email]
    G --> H[Admin reviews claim]
    H -->|Approved| I[Claim approved + activation token]
    H -->|Rejected| J[Provider setup shows rejection state]
    I --> K[/claim/activate/]
    K --> L[Owner membership created]

    E -->|Create new| M[Submit new company profile form]
    M --> N[companySubmission created]
    N --> O[Admin reviews new company]
    O -->|Approved| P[Company + owner membership created]
    O -->|Rejected| Q[Provider setup shows rejection state and allows resubmit]

    L --> R[/dashboard/]
    P --> R
    R --> R1[Profile tab]
    R --> R2[Agents tab]
    R --> R3[Team tab]

    R1 --> S[Company edits submitted for review]
    R2 --> T[Agent submissions and agent edits]
    R3 --> U[Invite and remove team members]
```



---

## 4. Admin Flow

```mermaid
flowchart TD
    A[Admin navigates to /o360] --> B[Password Login]
    B --> C[Admin Dashboard]

    C --> D[Tab: Claims]
    C --> E[Tab: New Companies]
    C --> F[Tab: Company Edits]
    C --> G[Tab: Agent Edits / Submissions]
    C --> H[Tab: Contact Requests]
    C --> I[Tab: Directory Overview]

    D --> D1[View pending claim requests]
    D1 --> D2{Action}
    D2 -->|Approve| D3[Company marked claimed, email sent, companyMember created]
    D2 -->|Reject| D4[Company reset to unclaimed, claimant notified]

    E --> E1[View pending new company submissions]
    E1 --> E2{Action}
    E2 -->|Approve| E3[Create company record + owner membership]
    E2 -->|Reject| E4[Reject with admin notes]

    F --> F1[View pending company edits with diff view]
    F1 --> F2{Action}
    F2 -->|Approve| F3[Payload applied to company record]
    F2 -->|Reject| F4[Edit rejected with admin notes]

    G --> G1[View pending agent edits]
    G --> G2[View pending new agent submissions]
    G1 --> G3{Action}
    G3 -->|Approve edit| G4[Payload applied to agent record]
    G3 -->|Reject edit| G5[Edit rejected with notes]
    G2 --> G6{Action}
    G6 -->|Approve submission| G7[Agent goes live in directory]
    G6 -->|Reject submission| G8[Submission rejected with notes]

    H --> H1[View pending contact requests, GCC to Provider]
    H1 --> H2{Action}
    H2 -->|Approve| H3[Provider notified of contact]
    H2 -->|Reject| H4[Request rejected]

    I --> I1[Stats: Total Agents, Companies, Claimed %, Pending Claims, Pending New Companies, Total GCCs]
```



---

## 5. End-to-End: Agent Discovery → Contact

```mermaid
flowchart TD
    A[GCC lands on homepage] --> B["'Search for Your Agent' section"]
    B --> C[Types search or clicks featured agent]
    C --> D[Directory Page with filters]
    D --> E[Clicks agent card]
    E --> F[Agent Detail Page]

    F --> G{Signed in?}
    G -->|No| H[Sees blurred sections with sign-up prompt]
    H --> I[Signs up, completes GCC Onboarding]
    I --> J[Returns to agent detail with full access]
    G -->|Yes| J

    J --> K[Reviews use cases, integrations, outcomes, company info]

    K --> L{Next action}
    L -->|Shortlist| M[Added to GCC Dashboard shortlist]
    L -->|Compare| N[Added to compare tray]
    L -->|Contact| O[Contact request submitted]

    N --> P[Selects 2-4 agents, opens Compare page]
    P --> Q[Side-by-side comparison table]
    Q --> L

    O --> R[Admin reviews contact request]
    R -->|Approved| S[Provider sees request in dashboard]
    S --> T[Provider responds to GCC]
```



---

## 6. Content & Marketing Flows (Unchanged)

```mermaid
flowchart TD
    A[Any visitor, no auth required] --> B{Navbar links}

    B --> C[AI Pulse]
    C --> C1[Daily briefs listing]
    C1 --> C2[Individual brief detail]

    B --> D[Orbyt]
    D --> D1[Orbyt landing page, 6 sections]

    B --> E[Thought Leadership]
    E --> E1[Article listing]
    E1 --> E2[Individual article]

    B --> F[Tools Hub]
    B --> G[Benchmarks]

```

