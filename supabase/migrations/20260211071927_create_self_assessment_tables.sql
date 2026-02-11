-- ============================================================================
-- Self-Assessment Tables Migration
-- Creates: self_assessments, self_assessment_results
-- ============================================================================

-- --------------------------------------------------------------------------
-- 1. self_assessments
--    Stores in-progress and completed AI readiness questionnaires.
--    GCC users answer a series of questions; answers are stored as JSONB
--    to allow flexible questionnaire schema changes without migrations.
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS self_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  org_id TEXT NOT NULL,
  answers JSONB NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'in_progress'
    CHECK (status IN ('in_progress', 'completed')),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE self_assessments ENABLE ROW LEVEL SECURITY;

-- Owner can read own assessments
CREATE POLICY self_assessments_select_owner
  ON self_assessments FOR SELECT
  USING (auth.uid()::text = user_id);

-- Owner can insert own assessment
CREATE POLICY self_assessments_insert_owner
  ON self_assessments FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

-- Owner can update own assessment (e.g. save progress, mark completed)
CREATE POLICY self_assessments_update_owner
  ON self_assessments FOR UPDATE
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);

CREATE INDEX IF NOT EXISTS idx_self_assessments_user_id ON self_assessments (user_id);
CREATE INDEX IF NOT EXISTS idx_self_assessments_org_id ON self_assessments (org_id);

-- --------------------------------------------------------------------------
-- 2. self_assessment_results
--    Stores computed results for a completed assessment: overall score,
--    per-category breakdowns, AI-generated analysis, recommendations,
--    and an optional PDF export URL.
--    One result per assessment (UNIQUE on assessment_id).
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS self_assessment_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL UNIQUE REFERENCES self_assessments(id),
  overall_score NUMERIC(4,1),
  category_scores JSONB DEFAULT '{}',
  analysis JSONB DEFAULT '{}',
  recommendations JSONB DEFAULT '[]',
  pdf_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE self_assessment_results ENABLE ROW LEVEL SECURITY;

-- Owner can read own results (via join to self_assessments)
CREATE POLICY self_assessment_results_select_owner
  ON self_assessment_results FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM self_assessments sa
      WHERE sa.id = assessment_id
        AND sa.user_id = auth.uid()::text
    )
  );

-- System can insert results (after computation)
-- In practice this is done via service role, but we allow the owner too
CREATE POLICY self_assessment_results_insert_owner
  ON self_assessment_results FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM self_assessments sa
      WHERE sa.id = assessment_id
        AND sa.user_id = auth.uid()::text
    )
  );

CREATE INDEX IF NOT EXISTS idx_self_assessment_results_assessment_id
  ON self_assessment_results (assessment_id);
