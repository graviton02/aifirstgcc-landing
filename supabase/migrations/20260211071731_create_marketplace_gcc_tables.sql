-- ============================================================================
-- Marketplace & GCC Tables Migration
-- Creates: problem_statements, problem_statement_interests,
--          gcc_problem_submission_quota, agent_shortlists,
--          contact_logs, provider_requests, agent_edits
-- ============================================================================

-- --------------------------------------------------------------------------
-- 1. problem_statements
--    GCC organisations submit problem statements describing challenges
--    they want AI solutions for. Approved problems are publicly visible
--    in the marketplace. Providers can express interest.
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS problem_statements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gcc_org_id TEXT NOT NULL,
  gcc_user_id TEXT NOT NULL,
  title TEXT NOT NULL CHECK (char_length(title) BETWEEN 10 AND 200),
  description TEXT NOT NULL CHECK (char_length(description) BETWEEN 100 AND 5000),
  category TEXT NOT NULL,
  industry TEXT NOT NULL,
  desired_outcome TEXT NOT NULL,
  timeline TEXT NOT NULL CHECK (timeline IN ('immediate', 'short', 'medium', 'long')),
  budget_range TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending_review'
    CHECK (status IN ('pending_review', 'approved', 'rejected')),
  interest_count INTEGER DEFAULT 0,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE problem_statements ENABLE ROW LEVEL SECURITY;

-- GCC org members can read own problems (any status)
CREATE POLICY problem_statements_select_owner
  ON problem_statements FOR SELECT
  USING (auth.uid()::text = gcc_user_id);

-- Public can read approved problems (no company identity exposed)
CREATE POLICY problem_statements_select_public
  ON problem_statements FOR SELECT
  USING (status = 'approved');

-- GCC org members can insert own problems
CREATE POLICY problem_statements_insert_owner
  ON problem_statements FOR INSERT
  WITH CHECK (auth.uid()::text = gcc_user_id);

-- GCC org members can delete own problems
CREATE POLICY problem_statements_delete_owner
  ON problem_statements FOR DELETE
  USING (auth.uid()::text = gcc_user_id);

CREATE INDEX IF NOT EXISTS idx_problem_statements_gcc_org_id ON problem_statements (gcc_org_id);
CREATE INDEX IF NOT EXISTS idx_problem_statements_status ON problem_statements (status);

-- --------------------------------------------------------------------------
-- 2. problem_statement_interests
--    Tracks which providers have expressed interest in a problem statement.
--    One interest per provider org per problem (UNIQUE constraint).
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS problem_statement_interests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  problem_statement_id UUID NOT NULL REFERENCES problem_statements(id),
  provider_org_id TEXT NOT NULL,
  provider_user_id TEXT NOT NULL,
  provider_user_email TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (problem_statement_id, provider_org_id)
);

ALTER TABLE problem_statement_interests ENABLE ROW LEVEL SECURITY;

-- Provider can insert own interest
CREATE POLICY problem_statement_interests_insert_owner
  ON problem_statement_interests FOR INSERT
  WITH CHECK (auth.uid()::text = provider_user_id);

-- Provider can read own interests
CREATE POLICY problem_statement_interests_select_owner
  ON problem_statement_interests FOR SELECT
  USING (auth.uid()::text = provider_user_id);

-- GCC org members can read interests on their problems
-- (join through problem_statements.gcc_user_id)
CREATE POLICY problem_statement_interests_select_gcc
  ON problem_statement_interests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM problem_statements ps
      WHERE ps.id = problem_statement_id
        AND ps.gcc_user_id = auth.uid()::text
    )
  );

CREATE INDEX IF NOT EXISTS idx_problem_statement_interests_problem_id
  ON problem_statement_interests (problem_statement_id);
CREATE INDEX IF NOT EXISTS idx_problem_statement_interests_provider_org
  ON problem_statement_interests (provider_org_id);

-- --------------------------------------------------------------------------
-- 3. gcc_problem_submission_quota
--    Monthly quota tracking for GCC problem submissions (default 20/month).
--    UNIQUE on (gcc_org_id, current_month) ensures one row per org per month.
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS gcc_problem_submission_quota (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gcc_org_id TEXT NOT NULL,
  current_month TEXT NOT NULL,
  submissions_this_month INTEGER DEFAULT 0,
  quota_limit INTEGER DEFAULT 20,
  UNIQUE (gcc_org_id, current_month)
);

ALTER TABLE gcc_problem_submission_quota ENABLE ROW LEVEL SECURITY;

-- GCC org members can read own quota
CREATE POLICY gcc_problem_submission_quota_select_owner
  ON gcc_problem_submission_quota FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM problem_statements ps
      WHERE ps.gcc_org_id = gcc_problem_submission_quota.gcc_org_id
        AND ps.gcc_user_id = auth.uid()::text
      LIMIT 1
    )
  );

CREATE INDEX IF NOT EXISTS idx_gcc_quota_org_month
  ON gcc_problem_submission_quota (gcc_org_id, current_month);

-- --------------------------------------------------------------------------
-- 4. agent_shortlists
--    GCC organisations can shortlist agents for later reference.
--    One shortlist entry per org per agent (UNIQUE constraint).
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS agent_shortlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gcc_org_id TEXT NOT NULL,
  agent_id UUID NOT NULL REFERENCES agents(id),
  created_by_user_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (gcc_org_id, agent_id)
);

ALTER TABLE agent_shortlists ENABLE ROW LEVEL SECURITY;

-- GCC org members can read own shortlist
CREATE POLICY agent_shortlists_select_owner
  ON agent_shortlists FOR SELECT
  USING (auth.uid()::text = created_by_user_id);

-- GCC org members can insert into shortlist
CREATE POLICY agent_shortlists_insert_owner
  ON agent_shortlists FOR INSERT
  WITH CHECK (auth.uid()::text = created_by_user_id);

-- GCC org members can remove from shortlist
CREATE POLICY agent_shortlists_delete_owner
  ON agent_shortlists FOR DELETE
  USING (auth.uid()::text = created_by_user_id);

CREATE INDEX IF NOT EXISTS idx_agent_shortlists_gcc_org_id ON agent_shortlists (gcc_org_id);
CREATE INDEX IF NOT EXISTS idx_agent_shortlists_agent_id ON agent_shortlists (agent_id);

-- --------------------------------------------------------------------------
-- 5. contact_logs
--    Logs when a GCC user contacts a provider about an agent.
--    Used for analytics and the GCC "Current Requests" dashboard tab.
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS contact_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gcc_user_id TEXT NOT NULL,
  gcc_org_id TEXT NOT NULL,
  agent_id UUID NOT NULL REFERENCES agents(id),
  provider_profile_id UUID NOT NULL REFERENCES provider_profiles(id),
  contacted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE contact_logs ENABLE ROW LEVEL SECURITY;

-- Authenticated user can insert own contact log
CREATE POLICY contact_logs_insert_owner
  ON contact_logs FOR INSERT
  WITH CHECK (auth.uid()::text = gcc_user_id);

-- GCC org members can read own contact logs
CREATE POLICY contact_logs_select_gcc
  ON contact_logs FOR SELECT
  USING (auth.uid()::text = gcc_user_id);

-- Provider can see contacts directed at them
CREATE POLICY contact_logs_select_provider
  ON contact_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM provider_profiles pp
      WHERE pp.id = provider_profile_id
        AND pp.user_id = auth.uid()::text
    )
  );

CREATE INDEX IF NOT EXISTS idx_contact_logs_gcc_org_id ON contact_logs (gcc_org_id);
CREATE INDEX IF NOT EXISTS idx_contact_logs_provider_profile_id ON contact_logs (provider_profile_id);

-- --------------------------------------------------------------------------
-- 6. provider_requests
--    When a GCC contacts a provider, a request record is created.
--    Visible on the provider's dashboard "Requests" tab.
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS provider_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_profile_id UUID NOT NULL REFERENCES provider_profiles(id),
  gcc_user_email TEXT NOT NULL,
  gcc_org_id TEXT NOT NULL,
  agent_id UUID NOT NULL REFERENCES agents(id),
  status TEXT NOT NULL DEFAULT 'new'
    CHECK (status IN ('new', 'contacted', 'archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE provider_requests ENABLE ROW LEVEL SECURITY;

-- Provider can read own requests
CREATE POLICY provider_requests_select_owner
  ON provider_requests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM provider_profiles pp
      WHERE pp.id = provider_profile_id
        AND pp.user_id = auth.uid()::text
    )
  );

-- Provider can update own request status
CREATE POLICY provider_requests_update_owner
  ON provider_requests FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM provider_profiles pp
      WHERE pp.id = provider_profile_id
        AND pp.user_id = auth.uid()::text
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM provider_profiles pp
      WHERE pp.id = provider_profile_id
        AND pp.user_id = auth.uid()::text
    )
  );

-- GCC user can insert request (via contact flow)
CREATE POLICY provider_requests_insert_gcc
  ON provider_requests FOR INSERT
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_provider_requests_provider_profile_id
  ON provider_requests (provider_profile_id);
CREATE INDEX IF NOT EXISTS idx_provider_requests_status ON provider_requests (status);

-- --------------------------------------------------------------------------
-- 7. agent_edits
--    Stores pending edit requests for approved agents.
--    Same pattern as tsp_edits — edits don't modify the live agent
--    directly; they create a review record with a JSONB diff payload.
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS agent_edits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES agents(id),
  user_id TEXT NOT NULL,
  payload JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE agent_edits ENABLE ROW LEVEL SECURITY;

-- Owner can read own edits
CREATE POLICY agent_edits_select_owner
  ON agent_edits FOR SELECT
  USING (auth.uid()::text = user_id);

-- Owner can insert own edits
CREATE POLICY agent_edits_insert_owner
  ON agent_edits FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

CREATE INDEX IF NOT EXISTS idx_agent_edits_agent_id ON agent_edits (agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_edits_status ON agent_edits (status);
