-- ============================================================================
-- Platform Foundation Migration
-- Creates: provider_profiles, agents, agent_submissions, admin_sessions
-- ============================================================================

-- --------------------------------------------------------------------------
-- 1. provider_profiles
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS provider_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL UNIQUE,
  organization_id TEXT NOT NULL UNIQUE,
  company_name TEXT NOT NULL,
  location TEXT NOT NULL,
  company_size TEXT NOT NULL,
  logo_url TEXT,
  website TEXT,
  category TEXT NOT NULL CHECK (category IN ('enabler', 'startup')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE provider_profiles ENABLE ROW LEVEL SECURITY;

-- Public can read approved profiles
CREATE POLICY provider_profiles_select_public
  ON provider_profiles FOR SELECT
  USING (status = 'approved');

-- Owner can read own profile (any status)
CREATE POLICY provider_profiles_select_owner
  ON provider_profiles FOR SELECT
  USING (auth.uid()::text = user_id);

-- Owner can insert own profile
CREATE POLICY provider_profiles_insert_owner
  ON provider_profiles FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

-- Owner can update own profile
CREATE POLICY provider_profiles_update_owner
  ON provider_profiles FOR UPDATE
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);

CREATE INDEX IF NOT EXISTS idx_provider_profiles_user_id ON provider_profiles (user_id);
CREATE INDEX IF NOT EXISTS idx_provider_profiles_status ON provider_profiles (status);

-- --------------------------------------------------------------------------
-- 2. agents
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_name TEXT NOT NULL,
  tagline TEXT,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  provider_profile_id UUID NOT NULL REFERENCES provider_profiles(id),
  logo_url TEXT,
  tags TEXT[] DEFAULT '{}',
  use_cases JSONB DEFAULT '[]',
  industries TEXT[] DEFAULT '{}',
  integration_type TEXT,
  supported_platforms TEXT[] DEFAULT '{}',
  data_requirements TEXT,
  impact_metrics JSONB DEFAULT '[]',
  demo_url TEXT,
  compliance_certifications TEXT[] DEFAULT '{}',
  security_features TEXT[] DEFAULT '{}',
  rating NUMERIC(2,1) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE agents ENABLE ROW LEVEL SECURITY;

-- Public can read active agents
CREATE POLICY agents_select_public
  ON agents FOR SELECT
  USING (status = 'active');

CREATE INDEX IF NOT EXISTS idx_agents_provider_profile_id ON agents (provider_profile_id);
CREATE INDEX IF NOT EXISTS idx_agents_category ON agents (category);
CREATE INDEX IF NOT EXISTS idx_agents_status ON agents (status);

-- --------------------------------------------------------------------------
-- 3. agent_submissions
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS agent_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  agent_name TEXT NOT NULL,
  tagline TEXT,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  provider_profile_id UUID NOT NULL REFERENCES provider_profiles(id),
  logo_url TEXT,
  tags TEXT[] DEFAULT '{}',
  use_cases JSONB DEFAULT '[]',
  industries TEXT[] DEFAULT '{}',
  integration_type TEXT,
  supported_platforms TEXT[] DEFAULT '{}',
  data_requirements TEXT,
  impact_metrics JSONB DEFAULT '[]',
  demo_url TEXT,
  compliance_certifications TEXT[] DEFAULT '{}',
  security_features TEXT[] DEFAULT '{}',
  submission_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (submission_status IN ('pending', 'approved', 'rejected', 'changes_requested')),
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE agent_submissions ENABLE ROW LEVEL SECURITY;

-- Owner can read own submissions
CREATE POLICY agent_submissions_select_owner
  ON agent_submissions FOR SELECT
  USING (auth.uid()::text = user_id);

-- Owner can insert own submissions
CREATE POLICY agent_submissions_insert_owner
  ON agent_submissions FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

CREATE INDEX IF NOT EXISTS idx_agent_submissions_user_id ON agent_submissions (user_id);
CREATE INDEX IF NOT EXISTS idx_agent_submissions_provider_profile_id ON agent_submissions (provider_profile_id);
CREATE INDEX IF NOT EXISTS idx_agent_submissions_status ON agent_submissions (submission_status);

-- --------------------------------------------------------------------------
-- 4. admin_sessions
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS admin_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- No RLS on admin_sessions — accessed via service role key only
