import {
  internalAction,
  internalMutation,
  internalQuery,
  query,
} from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

// ─── System prompt ───────────────────────────────────

const SYSTEM_PROMPT = `You are an enterprise AI analyst generating a daily intelligence brief for Orbys360, an AI-first advisory platform for Global Capability Centers (GCCs).

Your audience: enterprise leaders, GCC heads, transformation officers, and AI strategy teams.

Generate a structured daily brief based strictly on verified developments from the last 24 hours.

STRICT RULES:
- Only include developments from the last 24 hours from credible sources (Reuters, Bloomberg, FT, WSJ, The Verge, TechCrunch, official press releases).
- Never fabricate companies, funding, model names, numbers, or links.
- Every development must include a working source link.
- No hype, quotes, promotional tone, emojis, or filler.
- Proper casing for all headings and text.

STRUCTURE REQUIREMENTS:
- 3 top developments: 4-6 sentence analytical summaries explaining what happened, why it matters for enterprise AI, and relevance to agentic systems or GCCs.
- 1 use case: A real enterprise workflow (not a vendor feature). Must name specific systems, describe multi-step agent workflows, and cite measurable outcomes.
- 3-4 enterprise/GCC impact bullets: Analytical insights, NOT restatements of the news. At least one must address GCC positioning specifically.
- 3-5 opportunities: Specific and actionable. A GCC head reading this should know what to do next.
- 3-5 risks: Name concrete failure modes, not generic categories.

QUALITY STANDARD — follow these examples of GOOD vs BAD output:

GOOD enterprise impact bullet:
"Operational acceleration meets governance pressure: Organizations are unlocking tangible cost and efficiency gains from autonomous agents, but GCCs and enterprise teams must prioritize identity, access, and behavioral governance to avoid security blind spots."

BAD enterprise impact bullet (DO NOT write like this):
"Enterprises must reassess security frameworks to accommodate emerging risks associated with agentic AI."

GOOD enterprise impact bullet with GCC angle:
"GCCs become strategic hubs: With enterprise AI adoption increasing, GCCs are positioned to lead in agentic workflow integration, governance frameworks, and cost optimization, rather than traditional task execution."

GOOD opportunity:
"Differentiated GCC value via governance leadership: GCCs that build and operationalize agentic AI governance frameworks, identity controls, and observability layers can position themselves as strategic partners in AI-driven transformation, rather than back-office execution centers."

BAD opportunity (DO NOT write like this):
"Enhanced Operational Leverage: Agentic AI allows enterprises to achieve streamlined operations and labor cost reductions."

GOOD risk:
"Agent credentials and access control gaps can inadvertently grant broad, unchecked permissions, resulting in security blind spots and attack surfaces if not tightly governed."

BAD risk (DO NOT write like this):
"Organizations face complex governance issues concerning AI policy compliance and ethical use of autonomous systems."

GOOD editor headline:
"Enterprise agentic AI adoption accelerates — governance, identity, and cost efficiency emerge as defining battlegrounds"

BAD editor headline (DO NOT write like this):
"Enterprise AI Expands in Automation and Cyber Security"

The editor headline must synthesize the day's themes into a narrative, not list topics.

GOOD use case:
"A multinational manufacturing enterprise deployed agentic AI systems to manage procurement workflows across global suppliers. Autonomous agents continuously monitor supplier pricing, delivery timelines, inventory levels, logistics risks, and production schedules. When disruptions or pricing anomalies occur, the agents autonomously trigger mitigation workflows—such as sourcing alternative suppliers, renegotiating contracts, or adjusting production planning. This deployment reduced procurement cycle times by over 35%, improved supply continuity, and enabled proactive risk mitigation."

TONE: Analytical, measured, enterprise-grade, strategic. No hype. No marketing language.

If insufficient credible developments exist, return editorHeadline: "No major enterprise-relevant AI developments in the last 24 hours."
`;

// ─── Helpers ─────────────────────────────────────────

function getTodaySlug(): string {
  return new Date().toISOString().slice(0, 10);
}

function mapBriefToClientShape(brief: any) {
  return {
    _id: brief._id,
    slug: brief.slug,
    date: brief.date,
    editorHeadline: brief.editor_headline,
    topDevelopments: brief.top_developments,
    useCase: brief.use_case,
    enterpriseImpact: brief.enterprise_impact,
    opportunities: brief.opportunities,
    risks: brief.risks,
  };
}

// ─── Internal queries ────────────────────────────────

export const checkBriefExists = internalQuery({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    const existing = await ctx.db
      .query("aiPulseBriefs")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();
    return existing !== null;
  },
});

// ─── Internal mutation ───────────────────────────────

export const insertBrief = internalMutation({
  args: {
    slug: v.string(),
    date: v.string(),
    editor_headline: v.optional(v.string()),
    top_developments: v.array(
      v.object({
        headline: v.string(),
        description: v.string(),
        source: v.object({ label: v.string(), url: v.string() }),
      })
    ),
    use_case: v.object({
      title: v.string(),
      description: v.string(),
      source: v.object({ label: v.string(), url: v.string() }),
    }),
    enterprise_impact: v.array(v.string()),
    opportunities: v.array(
      v.object({ title: v.string(), description: v.string() })
    ),
    risks: v.array(
      v.object({ title: v.string(), description: v.string() })
    ),
    generation_model: v.optional(v.string()),
    generation_duration_ms: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("aiPulseBriefs")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
    if (existing) return existing._id;

    return await ctx.db.insert("aiPulseBriefs", {
      ...args,
      created_at: Date.now(),
    });
  },
});

export const deleteBriefBySlug = internalMutation({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    const existing = await ctx.db
      .query("aiPulseBriefs")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();
    if (existing) {
      await ctx.db.delete(existing._id);
      return { deleted: true, id: existing._id };
    }
    return { deleted: false };
  },
});

// ─── Generation action ───────────────────────────────

export const generateDailyBrief = internalAction({
  args: {
    date_override: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<{ status: string; slug: string; id?: string }> => {
    const dateSlug = args.date_override ?? getTodaySlug();

    // Idempotency check
    const exists = await ctx.runQuery(internal.aiPulse.checkBriefExists, {
      slug: dateSlug,
    });
    if (exists) {
      console.log(`AI Pulse brief for ${dateSlug} already exists, skipping.`);
      return { status: "skipped", slug: dateSlug };
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY is not set");
    }

    const startTime = Date.now();

    const requestBody = {
      model: "gpt-4o",
      input: `Search for the top 3 most important enterprise AI and agentic systems news from the past 24 hours (${dateSlug}). Focus on:
- Agentic AI deployments, multi-agent orchestration, autonomous enterprise workflows
- AI governance, risk management, identity/access controls for AI systems
- Enterprise AI platform shifts (new partnerships, infrastructure, tooling)
- Global Capability Centers, shared services, and AI center of excellence developments
- Regulatory or policy changes affecting enterprise AI adoption

Include news from Reuters, Bloomberg, TechCrunch, The Verge, WSJ, FT, and official press releases. For each story provide the headline, a detailed analytical summary (not just what happened, but why it matters for enterprise AI strategy), and the source URL. Also find one real enterprise AI use case deployment with specific systems named and measurable outcomes.`,
      tools: [
        {
          type: "web_search",
          search_context_size: "high",
          user_location: {
            type: "approximate",
            region: "United States",
          },
        },
      ],
    };

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API error ${response.status}: ${errorText}`);
    }

    const searchResult = await response.json();
    const searchDurationMs = Date.now() - startTime;

    // Collect all text + citations from the search response
    const searchTexts: string[] = [];
    for (const item of searchResult.output ?? []) {
      if (item.type === "message" && item.content) {
        for (const block of item.content) {
          if (block.type === "output_text" && block.text) {
            searchTexts.push(block.text);
          }
        }
      }
    }

    const searchContent = searchTexts.join("\n\n");
    if (!searchContent.trim()) {
      throw new Error("OpenAI web search returned no content");
    }

    console.log(`Web search completed in ${searchDurationMs}ms, got ${searchContent.length} chars`);

    // Step 2: Generate structured brief from search results
    const genStartTime = Date.now();
    const genResponse = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        instructions: SYSTEM_PROMPT,
        input: `Based on the following search results about enterprise AI news, generate the AI Pulse daily brief for ${dateSlug}. Use slug "${dateSlug}" and date "${dateSlug}".

REQUIRED OUTPUT FORMAT — return a single JSON object with exactly this structure:
{
  "slug": "${dateSlug}",
  "date": "${dateSlug}",
  "editorHeadline": "string — a newspaper-style headline synthesizing the day's top themes",
  "topDevelopments": [
    { "headline": "string", "description": "string (4-6 sentences)", "source": { "label": "string (publication name)", "url": "string (full URL)" } },
    { "headline": "string", "description": "string (4-6 sentences)", "source": { "label": "string", "url": "string" } },
    { "headline": "string", "description": "string (4-6 sentences)", "source": { "label": "string", "url": "string" } }
  ],
  "useCase": { "title": "string", "description": "string (detailed paragraph)", "source": { "label": "string", "url": "string (empty string if based on analysis)" } },
  "enterpriseImpact": ["string — analytical insight", "string", "string"],
  "opportunities": [{ "title": "string", "description": "string" }, ...],
  "risks": [{ "title": "string", "description": "string" }, ...]
}

You MUST include exactly 3 items in topDevelopments. Return ONLY the JSON object, no markdown fences or extra text.

--- SEARCH RESULTS ---
${searchContent}`,
        text: {
          format: {
            type: "json_object",
          },
        },
      }),
    });

    if (!genResponse.ok) {
      const errorText = await genResponse.text();
      throw new Error(`OpenAI generation error ${genResponse.status}: ${errorText}`);
    }

    const genResult = await genResponse.json();
    const durationMs = Date.now() - startTime;

    // Extract structured output from generation response
    const messageOutput = genResult.output?.find(
      (item: any) => item.type === "message" && item.role === "assistant"
    );
    if (!messageOutput) {
      throw new Error("No assistant message in generation response");
    }

    const textContent = messageOutput.content?.find(
      (block: any) => block.type === "output_text"
    );
    if (!textContent) {
      throw new Error("No text content in generation response");
    }

    const brief = JSON.parse(textContent.text);

    console.log(`Generation completed in ${Date.now() - genStartTime}ms, keys: ${Object.keys(brief).join(", ")}, topDevelopments: ${brief.topDevelopments?.length ?? 0}`);

    // Validate and fix
    if (!Array.isArray(brief.topDevelopments) || brief.topDevelopments.length < 3) {
      throw new Error(
        `Expected at least 3 topDevelopments, got ${brief.topDevelopments?.length ?? 0}`
      );
    }
    // Trim to exactly 3 if the model returned more
    brief.topDevelopments = brief.topDevelopments.slice(0, 3);
    brief.slug = dateSlug;
    brief.date = dateSlug;

    // Insert
    const briefId: string = await ctx.runMutation(internal.aiPulse.insertBrief, {
      slug: brief.slug,
      date: brief.date,
      editor_headline: brief.editorHeadline,
      top_developments: brief.topDevelopments,
      use_case: brief.useCase,
      enterprise_impact: brief.enterpriseImpact,
      opportunities: brief.opportunities,
      risks: brief.risks,
      generation_model: "gpt-4o",
      generation_duration_ms: durationMs,
    });

    console.log(
      `AI Pulse brief generated for ${dateSlug} in ${durationMs}ms (id: ${briefId})`
    );

    return { status: "generated", slug: dateSlug, id: briefId };
  },
});

// ─── Public queries ──────────────────────────────────

export const listBriefs = query({
  args: {},
  handler: async (ctx) => {
    const briefs = await ctx.db
      .query("aiPulseBriefs")
      .withIndex("by_date")
      .order("desc")
      .collect();

    return briefs.map(mapBriefToClientShape);
  },
});

export const getBriefBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    const brief = await ctx.db
      .query("aiPulseBriefs")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();

    return brief ? mapBriefToClientShape(brief) : null;
  },
});

export const listAllSlugs = query({
  args: {},
  handler: async (ctx) => {
    const briefs = await ctx.db
      .query("aiPulseBriefs")
      .withIndex("by_date")
      .order("desc")
      .collect();

    return briefs.map((b) => ({ slug: b.slug }));
  },
});
