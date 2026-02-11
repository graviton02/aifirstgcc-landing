-- ============================================================================
-- Provider Submission Tables Migration
-- Creates: tsp_submissions, startup_submissions, tsp_edits
-- ============================================================================

-- --------------------------------------------------------------------------
-- 1. tsp_submissions
--    Stores detailed onboarding data for Technology Service Providers.
--    One submission per provider (UNIQUE on provider_profile_id).
--    5-page wizard: Company Profile → AI-First Positioning → Capabilities
--                   → Track Record → Vision & Contact
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tsp_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_profile_id UUID NOT NULL UNIQUE REFERENCES provider_profiles(id),
  user_id TEXT NOT NULL,

  -- Page 1: Company Profile
  logo_url TEXT,
  website TEXT,
  founding_year INTEGER,
  about_text TEXT,

  -- Page 2: AI-First Positioning
  core_positioning TEXT,
  ai_first_definition TEXT,
  unique_differentiators TEXT,

  -- Page 3: Capabilities
  ai_enabled_workflows TEXT[] DEFAULT '{}',
  governance_frameworks TEXT[] DEFAULT '{}',
  service_offerings TEXT[] DEFAULT '{}',

  -- Page 4: Track Record
  gccs_enabled INTEGER DEFAULT 0,
  impact_metrics TEXT,
  case_studies TEXT,
  industry_recognitions TEXT,

  -- Page 5: Vision & Contact
  agent_native_vision TEXT,
  expansion_plans TEXT,
  contact_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,

  -- Status
  submission_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (submission_status IN ('pending', 'approved', 'rejected', 'changes_requested')),
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE tsp_submissions ENABLE ROW LEVEL SECURITY;

-- Owner can read own submission
CREATE POLICY tsp_submissions_select_owner
  ON tsp_submissions FOR SELECT
  USING (auth.uid()::text = user_id);

-- Owner can insert own submission
CREATE POLICY tsp_submissions_insert_owner
  ON tsp_submissions FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

-- Owner can update own submission (while still pending)
CREATE POLICY tsp_submissions_update_owner
  ON tsp_submissions FOR UPDATE
  USING (auth.uid()::text = user_id AND submission_status = 'pending')
  WITH CHECK (auth.uid()::text = user_id);

CREATE INDEX IF NOT EXISTS idx_tsp_submissions_user_id ON tsp_submissions (user_id);
CREATE INDEX IF NOT EXISTS idx_tsp_submissions_status ON tsp_submissions (submission_status);

-- --------------------------------------------------------------------------
-- 2. startup_submissions
--    Stores detailed onboarding data for Startups.
--    One submission per provider (UNIQUE on provider_profile_id).
--    5-page wizard: Company Profile → Product & Technology → Market & Traction
--                   → Compliance & Security → Contact
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS startup_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_profile_id UUID NOT NULL UNIQUE REFERENCES provider_profiles(id),
  user_id TEXT NOT NULL,

  -- Page 1: Company Profile
  logo_url TEXT,
  website TEXT,
  founding_year INTEGER,
  funding_stage TEXT,

  -- Page 2: Product & Technology
  product_description TEXT,
  ai_capabilities TEXT,
  tech_stack TEXT,

  -- Page 3: Market & Traction
  target_industries TEXT[] DEFAULT '{}',
  customer_segments TEXT[] DEFAULT '{}',
  key_metrics TEXT,

  -- Page 4: Compliance & Security
  certifications TEXT[] DEFAULT '{}',
  data_privacy_posture TEXT,
  security_measures TEXT,

  -- Page 5: Contact
  contact_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  partnership_interests TEXT,

  -- Status
  submission_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (submission_status IN ('pending', 'approved', 'rejected', 'changes_requested')),
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE startup_submissions ENABLE ROW LEVEL SECURITY;

-- Owner can read own submission
CREATE POLICY startup_submissions_select_owner
  ON startup_submissions FOR SELECT
  USING (auth.uid()::text = user_id);

-- Owner can insert own submission
CREATE POLICY startup_submissions_insert_owner
  ON startup_submissions FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

-- Owner can update own submission (while still pending)
CREATE POLICY startup_submissions_update_owner
  ON startup_submissions FOR UPDATE
  USING (auth.uid()::text = user_id AND submission_status = 'pending')
  WITH CHECK (auth.uid()::text = user_id);

CREATE INDEX IF NOT EXISTS idx_startup_submissions_user_id ON startup_submissions (user_id);
CREATE INDEX IF NOT EXISTS idx_startup_submissions_status ON startup_submissions (submission_status);

-- --------------------------------------------------------------------------
-- 3. tsp_edits
--    Stores pending profile edits for approved TSPs.
--    Edits don't modify the live profile directly — they create a review
--    record with a JSONB diff payload for admin approval.
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tsp_edits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tsp_id UUID NOT NULL REFERENCES tsp_submissions(id),
  user_id TEXT NOT NULL,
  payload JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE tsp_edits ENABLE ROW LEVEL SECURITY;

-- Owner can read own edits
CREATE POLICY tsp_edits_select_owner
  ON tsp_edits FOR SELECT
  USING (auth.uid()::text = user_id);

-- Owner can insert own edits
CREATE POLICY tsp_edits_insert_owner
  ON tsp_edits FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

CREATE INDEX IF NOT EXISTS idx_tsp_edits_tsp_id ON tsp_edits (tsp_id);
CREATE INDEX IF NOT EXISTS idx_tsp_edits_status ON tsp_edits (status);
