import {
  internalAction,
  internalMutation,
  internalQuery,
  query,
} from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

// ─── System prompt ───────────────────────────────────

const SYSTEM_PROMPT = `You are an enterprise AI analyst generating a daily intelligence brief for Orbys360.

Your audience consists of enterprise leaders, GCC heads, transformation officers, and AI strategy teams.

You must generate a structured daily brief based strictly on verified developments from the last 24 hours.

OBJECTIVE:
Produce a structured daily brief covering:
- Top 3 AI developments
- 1 AI use case of the day (real enterprise workflow, not a vendor feature)
- Enterprise / GCC impact
- Opportunities & risks (deep, structured analysis)

STRICT RULES:
- Only include developments from the last 24 hours.
- Only include verifiable, real news from credible sources (Reuters, Bloomberg, FT, WSJ, The Verge, TechCrunch, official press releases, etc).
- Never fabricate companies, funding, model names, numbers, or links.
- Every development must include a working source link.
- No hype language.
- No quotes.
- No promotional tone.
- No emojis.
- No prompts or activity suggestions.
- No one-line filler commentary.
- Proper casing for all headings and text.

TOP 3 DEVELOPMENTS:
Each must be a concise 4-6 sentence summary explaining: what happened, why it matters for enterprise AI, relevance to agentic systems or GCCs.

AI USE CASE OF THE DAY:
Describe a real enterprise workflow where agentic AI is deployed. Must describe: problem context, multi-step agent workflow, enterprise systems involved, measurable business impact. No vendor marketing language.

ENTERPRISE / GCC IMPACT:
Provide 3-4 analytical insights explaining: operating model impact, governance implications, infrastructure shifts, GCC positioning, security and compliance considerations. Each must be analytical, not descriptive.

OPPORTUNITIES:
Provide 3-5 structured items explaining strategic upside: operating leverage, automation scale, infrastructure transformation, governance differentiation, competitive advantage.

RISKS:
Provide 3-5 structured items explaining structural risks: governance gaps, identity & security risk, integration complexity, regulatory exposure, organizational readiness.

TONE: Analytical, measured, enterprise-grade, strategic. No hype. No marketing language.

If insufficient credible developments exist in the last 24 hours, return an editorHeadline of: "No major enterprise-relevant AI developments in the last 24 hours." with minimal placeholder content.`;

// ─── JSON schema for structured output ───────────────

const DAILY_BRIEF_JSON_SCHEMA = {
  type: "object" as const,
  properties: {
    slug: { type: "string" as const },
    date: { type: "string" as const },
    editorHeadline: { type: "string" as const },
    topDevelopments: {
      type: "array" as const,
      items: {
        type: "object" as const,
        properties: {
          headline: { type: "string" as const },
          description: { type: "string" as const },
          source: {
            type: "object" as const,
            properties: {
              label: { type: "string" as const },
              url: { type: "string" as const },
            },
            required: ["label", "url"],
            additionalProperties: false,
          },
        },
        required: ["headline", "description", "source"],
        additionalProperties: false,
      },
    },
    useCase: {
      type: "object" as const,
      properties: {
        title: { type: "string" as const },
        description: { type: "string" as const },
        source: {
          type: "object" as const,
          properties: {
            label: { type: "string" as const },
            url: { type: "string" as const },
          },
          required: ["label", "url"],
          additionalProperties: false,
        },
      },
      required: ["title", "description", "source"],
      additionalProperties: false,
    },
    enterpriseImpact: {
      type: "array" as const,
      items: { type: "string" as const },
    },
    opportunities: {
      type: "array" as const,
      items: {
        type: "object" as const,
        properties: {
          title: { type: "string" as const },
          description: { type: "string" as const },
        },
        required: ["title", "description"],
        additionalProperties: false,
      },
    },
    risks: {
      type: "array" as const,
      items: {
        type: "object" as const,
        properties: {
          title: { type: "string" as const },
          description: { type: "string" as const },
        },
        required: ["title", "description"],
        additionalProperties: false,
      },
    },
  },
  required: [
    "slug",
    "date",
    "editorHeadline",
    "topDevelopments",
    "useCase",
    "enterpriseImpact",
    "opportunities",
    "risks",
  ],
  additionalProperties: false,
};

// ─── Helpers ─────────────────────────────────────────

function getTodaySlug(): string {
  return new Date().toISOString().slice(0, 10);
}

function buildUserPrompt(dateSlug: string): string {
  return `Generate the AI Pulse daily brief for ${dateSlug}.\n\nSearch for the most important enterprise AI, agentic systems, and AI automation news from the past 24 hours. Focus on:\n- Major AI model releases, capabilities, or policy changes affecting enterprises\n- Agentic AI systems, multi-agent orchestration, and autonomous workflow developments\n- Enterprise AI adoption, governance frameworks, and risk management\n- AI infrastructure, platforms, and tooling for large organizations\n- GCC/shared services and AI center of excellence developments\n\nUse the slug "${dateSlug}" and date "${dateSlug}" in your response.`;
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
      input: `Search for the top 3 most important enterprise AI, agentic systems, and AI automation news stories from the past 24 hours (${dateSlug}). Include news from sources like Reuters, Bloomberg, TechCrunch, The Verge, WSJ, and FT. For each story, provide the headline, a detailed summary, and the source URL. Also find one real enterprise AI use case deployment.`,
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
