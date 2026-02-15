import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type Answer = { id: string; score: number; category: string };

type Req = {
  assessmentId?: string;
  user_id?: string;
  answers?: Answer[];
  meta?: Record<string, unknown>;
};

type Summary = {
  categories: Array<{ category: string; average: number; total: number; count: number }>;
  overallTotal: number;
  overallAverage: number;
  itemCount: number;
};

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY") || "";
const PROJECT_URL = Deno.env.get("PROJECT_URL") || "";
const SERVICE_ROLE_KEY = Deno.env.get("SERVICE_ROLE_KEY") || "";

const supabase = PROJECT_URL && SERVICE_ROLE_KEY ? createClient(PROJECT_URL, SERVICE_ROLE_KEY) : null;

function summarize(answers: Answer[] = []): Summary {
  const byCat: Record<string, { total: number; count: number }> = {};
  let overall = 0;
  for (const a of answers) {
    if (!byCat[a.category]) byCat[a.category] = { total: 0, count: 0 };
    const score = Number(a.score) || 0;
    byCat[a.category].total += score;
    byCat[a.category].count += 1;
    overall += score;
  }
  const categories = Object.entries(byCat).map(([category, v]) => ({
    category,
    average: v.count ? Number((v.total / v.count).toFixed(2)) : 0,
    total: v.total,
    count: v.count,
  }));
  const overallAverage = answers.length ? Number((overall / answers.length).toFixed(2)) : 0;
  return { categories, overallTotal: overall, overallAverage, itemCount: answers.length };
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json",
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "POST, OPTIONS",
      "access-control-allow-headers": "content-type, authorization",
    },
  });
}

function buildPrompt(answers: Answer[]): { system: string; user: string } {
  const sys = `You are an expert AI Transformation Advisor for Global Capability Centers (GCCs).
You will be provided with responses from a self-assessment form completed by a GCC leader about their AI journey.

Your task is to generate a structured **consulting-style report** with the following format:

1. **Current State by Pillar**
   - For each of the 7 pillars (Strategy & Vision, Talent & Skills, Technology & Infrastructure, Operating Model, Innovation & Ecosystem, Governance & Risk, Impact & Outcomes), summarize the organization's current maturity level based on the answers provided.
   - The summary should highlight both strengths and gaps in 3-4 bullet points.
   - Do NOT include score references or ranges (like "scores of 3 or 4") in the bullet points.

2. **Recommendations by Pillar**
   - For each of the 7 pillars, provide exactly:
     - **3 Short-term (3-6 months) actions**
     - **3 Mid-term (6-18 months) actions**
   - Each action should be specific, actionable, and outcome-oriented (not generic statements).
   - Recommendations should reflect best practices for moving a GCC towards an AI-First operating model.

3. **Next Steps / Roadmap**
   - Provide 3-4 high-level next steps that tie the recommendations together (e.g., alignment sprint, talent scaling, governance setup).

Formatting:
- Use clear section headers for each Pillar.
- Present short-term and mid-term actions as bullet points.
- Do not include long-term actions.
- Ensure the tone is that of a consulting report: precise, structured, and actionable.`;

  const formatted = answers
    .map(a => `- Pillar: ${a.category}; Question: ${a.id}; Score: ${a.score}`)
    .join("\n");

  const user = `The user has submitted the following answers to the AI-First GCC Self-Assessment:\n\n${formatted}\n\nPlease output in the following JSON format:\n\n{\n  "current_state": {\n    "Strategy & Vision": ["bullet point 1", "bullet point 2", "bullet point 3", "bullet point 4"],\n    "Talent & Skills": ["..."],\n    "Technology & Infrastructure": ["..."],\n    "Operating Model": ["..."],\n    "Innovation & Ecosystem": ["..."],\n    "Governance & Risk": ["..."],\n    "Impact & Outcomes": ["..."]\n  },\n  "recommendations": {\n    "Strategy & Vision": {\n      "short_term": ["action 1", "action 2", "action 3"],\n      "mid_term": ["action 1", "action 2", "action 3"]\n    },\n    "Talent & Skills": { "short_term": ["..."], "mid_term": ["..."] },\n    "Technology & Infrastructure": { "short_term": ["..."], "mid_term": ["..."] },\n    "Operating Model": { "short_term": ["..."], "mid_term": ["..."] },\n    "Innovation & Ecosystem": { "short_term": ["..."], "mid_term": ["..."] },\n    "Governance & Risk": { "short_term": ["..."], "mid_term": ["..."] },\n    "Impact & Outcomes": { "short_term": ["..."], "mid_term": ["..."] }\n  },\n  "next_steps": ["step 1", "step 2", "step 3", "step 4"]\n}`;

  return { system: sys, user };
}

async function getAiJson(answers: Answer[]): Promise<Record<string, unknown>> {
  if (!OPENAI_API_KEY) throw new Error('OPENAI_API_KEY missing');
  const { system, user } = buildPrompt(answers);
  const resp = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-5",
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      temperature: 0.2,
      response_format: { type: "json_object" }
    }),
  });
  if (!resp.ok) throw new Error(`OpenAI error: ${resp.status}`);
  const data = await resp.json();
  const content = data?.choices?.[0]?.message?.content || "{}";
  return JSON.parse(content);
}

serve(async (req) => {
  if (req.method === "OPTIONS") return json({}, 204);
  if (req.method !== "POST") return json({ error: "Method Not Allowed" }, 405);

  try {
    const body = (await req.json().catch(() => ({}))) as Req;

    let assessmentId = body.assessmentId || null as string | null;
    const userId = body.user_id || null as string | null;
    const answers: Answer[] = Array.isArray(body.answers) ? body.answers : [];

    if (!answers.length) return json({ error: "No answers provided" }, 400);

    // Load and update existing assessment
    if (supabase && assessmentId) {
      const { data, error } = await supabase
        .from("self_assessments")
        .select("id, user_id, status")
        .eq("id", assessmentId)
        .maybeSingle();
      if (error || !data) return json({ error: "Assessment not found" }, 404);
      await supabase.from("self_assessments").update({ status: "completed" }).eq("id", data.id);
    }

    const analysis = await getAiJson(answers);

    let resultId: string | null = null;
    if (supabase && assessmentId) {
      const { data: result, error: insErr } = await supabase
        .from("self_assessment_results")
        .insert({
          assessment_id: assessmentId,
          analysis,
          analysis_text: JSON.stringify(analysis),
        })
        .select()
        .single();
      if (!insErr && result) {
        resultId = result.id;
      }
    }

    return json({ ok: true, assessmentId, resultId, analysis });
  } catch (e) {
    return json({ ok: false, error: String((e as Error).message || e) }, 400);
  }
});
