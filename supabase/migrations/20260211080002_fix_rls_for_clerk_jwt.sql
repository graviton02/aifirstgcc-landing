-- ============================================================================
-- Fix RLS Policies for Clerk JWT Compatibility
--
-- Problem: All 44 owner-scoped RLS policies use auth.uid()::text which
-- tries to parse the JWT "sub" claim as a UUID. Clerk user IDs are NOT
-- UUIDs (e.g. "user_39UoNF1qHxu1TvoGqERxaxC8WF1"), so every policy
-- evaluation crashes with "invalid input syntax for type uuid".
--
-- Solution: Create a clerk_uid() helper that reads (auth.jwt()->>'sub')
-- directly as text, then replace auth.uid()::text with clerk_uid() in
-- all 44 policies. Public/anon policies are NOT affected.
-- ============================================================================

-- --------------------------------------------------------------------------
-- Step 1: Create clerk_uid() helper function
-- --------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.clerk_uid()
RETURNS TEXT
LANGUAGE sql
STABLE
AS $$
  SELECT (auth.jwt()->>'sub')::text
$$;

-- --------------------------------------------------------------------------
-- Step 2: Drop all 44 owner-scoped policies
-- --------------------------------------------------------------------------

-- provider_profiles (3 policies)
DROP POLICY IF EXISTS provider_profiles_select_owner ON provider_profiles;
DROP POLICY IF EXISTS provider_profiles_insert_owner ON provider_profiles;
DROP POLICY IF EXISTS provider_profiles_update_owner ON provider_profiles;

-- agent_submissions (2 policies)
DROP POLICY IF EXISTS agent_submissions_select_owner ON agent_submissions;
DROP POLICY IF EXISTS agent_submissions_insert_owner ON agent_submissions;

-- tsp_submissions (3 policies)
DROP POLICY IF EXISTS tsp_submissions_select_owner ON tsp_submissions;
DROP POLICY IF EXISTS tsp_submissions_insert_owner ON tsp_submissions;
DROP POLICY IF EXISTS tsp_submissions_update_owner ON tsp_submissions;

-- startup_submissions (3 policies)
DROP POLICY IF EXISTS startup_submissions_select_owner ON startup_submissions;
DROP POLICY IF EXISTS startup_submissions_insert_owner ON startup_submissions;
DROP POLICY IF EXISTS startup_submissions_update_owner ON startup_submissions;

-- tsp_edits (2 policies)
DROP POLICY IF EXISTS tsp_edits_select_owner ON tsp_edits;
DROP POLICY IF EXISTS tsp_edits_insert_owner ON tsp_edits;

-- problem_statements (3 policies)
DROP POLICY IF EXISTS problem_statements_select_owner ON problem_statements;
DROP POLICY IF EXISTS problem_statements_insert_owner ON problem_statements;
DROP POLICY IF EXISTS problem_statements_delete_owner ON problem_statements;

-- problem_statement_interests (3 policies)
DROP POLICY IF EXISTS problem_statement_interests_insert_owner ON problem_statement_interests;
DROP POLICY IF EXISTS problem_statement_interests_select_owner ON problem_statement_interests;
DROP POLICY IF EXISTS problem_statement_interests_select_gcc ON problem_statement_interests;

-- gcc_problem_submission_quota (1 policy)
DROP POLICY IF EXISTS gcc_problem_submission_quota_select_owner ON gcc_problem_submission_quota;

-- agent_shortlists (3 policies)
DROP POLICY IF EXISTS agent_shortlists_select_owner ON agent_shortlists;
DROP POLICY IF EXISTS agent_shortlists_insert_owner ON agent_shortlists;
DROP POLICY IF EXISTS agent_shortlists_delete_owner ON agent_shortlists;

-- contact_logs (3 policies)
DROP POLICY IF EXISTS contact_logs_insert_owner ON contact_logs;
DROP POLICY IF EXISTS contact_logs_select_gcc ON contact_logs;
DROP POLICY IF EXISTS contact_logs_select_provider ON contact_logs;

-- provider_requests (2 policies)
DROP POLICY IF EXISTS provider_requests_select_owner ON provider_requests;
DROP POLICY IF EXISTS provider_requests_update_owner ON provider_requests;

-- agent_edits (2 policies)
DROP POLICY IF EXISTS agent_edits_select_owner ON agent_edits;
DROP POLICY IF EXISTS agent_edits_insert_owner ON agent_edits;

-- self_assessments (3 policies)
DROP POLICY IF EXISTS self_assessments_select_owner ON self_assessments;
DROP POLICY IF EXISTS self_assessments_insert_owner ON self_assessments;
DROP POLICY IF EXISTS self_assessments_update_owner ON self_assessments;

-- self_assessment_results (2 policies)
DROP POLICY IF EXISTS self_assessment_results_select_owner ON self_assessment_results;
DROP POLICY IF EXISTS self_assessment_results_insert_owner ON self_assessment_results;

-- storage.objects — provider-logos (3 policies)
DROP POLICY IF EXISTS storage_provider_logos_insert_owner ON storage.objects;
DROP POLICY IF EXISTS storage_provider_logos_update_owner ON storage.objects;
DROP POLICY IF EXISTS storage_provider_logos_delete_owner ON storage.objects;

-- storage.objects — agent-logos (3 policies)
DROP POLICY IF EXISTS storage_agent_logos_insert_owner ON storage.objects;
DROP POLICY IF EXISTS storage_agent_logos_update_owner ON storage.objects;
DROP POLICY IF EXISTS storage_agent_logos_delete_owner ON storage.objects;

-- storage.objects — assessment-pdfs (3 policies)
DROP POLICY IF EXISTS storage_assessment_pdfs_select_owner ON storage.objects;
DROP POLICY IF EXISTS storage_assessment_pdfs_insert_owner ON storage.objects;
DROP POLICY IF EXISTS storage_assessment_pdfs_delete_owner ON storage.objects;

-- --------------------------------------------------------------------------
-- Step 3: Recreate all 44 policies using clerk_uid()
-- --------------------------------------------------------------------------

-- ======================== provider_profiles ========================

CREATE POLICY provider_profiles_select_owner
  ON provider_profiles FOR SELECT
  USING (clerk_uid() = user_id);

CREATE POLICY provider_profiles_insert_owner
  ON provider_profiles FOR INSERT
  WITH CHECK (clerk_uid() = user_id);

CREATE POLICY provider_profiles_update_owner
  ON provider_profiles FOR UPDATE
  USING (clerk_uid() = user_id)
  WITH CHECK (clerk_uid() = user_id);

-- ======================== agent_submissions ========================

CREATE POLICY agent_submissions_select_owner
  ON agent_submissions FOR SELECT
  USING (clerk_uid() = user_id);

CREATE POLICY agent_submissions_insert_owner
  ON agent_submissions FOR INSERT
  WITH CHECK (clerk_uid() = user_id);

-- ======================== tsp_submissions ========================

CREATE POLICY tsp_submissions_select_owner
  ON tsp_submissions FOR SELECT
  USING (clerk_uid() = user_id);

CREATE POLICY tsp_submissions_insert_owner
  ON tsp_submissions FOR INSERT
  WITH CHECK (clerk_uid() = user_id);

CREATE POLICY tsp_submissions_update_owner
  ON tsp_submissions FOR UPDATE
  USING (clerk_uid() = user_id AND submission_status = 'pending')
  WITH CHECK (clerk_uid() = user_id);

-- ======================== startup_submissions ========================

CREATE POLICY startup_submissions_select_owner
  ON startup_submissions FOR SELECT
  USING (clerk_uid() = user_id);

CREATE POLICY startup_submissions_insert_owner
  ON startup_submissions FOR INSERT
  WITH CHECK (clerk_uid() = user_id);

CREATE POLICY startup_submissions_update_owner
  ON startup_submissions FOR UPDATE
  USING (clerk_uid() = user_id AND submission_status = 'pending')
  WITH CHECK (clerk_uid() = user_id);

-- ======================== tsp_edits ========================

CREATE POLICY tsp_edits_select_owner
  ON tsp_edits FOR SELECT
  USING (clerk_uid() = user_id);

CREATE POLICY tsp_edits_insert_owner
  ON tsp_edits FOR INSERT
  WITH CHECK (clerk_uid() = user_id);

-- ======================== problem_statements ========================

CREATE POLICY problem_statements_select_owner
  ON problem_statements FOR SELECT
  USING (clerk_uid() = gcc_user_id);

CREATE POLICY problem_statements_insert_owner
  ON problem_statements FOR INSERT
  WITH CHECK (clerk_uid() = gcc_user_id);

CREATE POLICY problem_statements_delete_owner
  ON problem_statements FOR DELETE
  USING (clerk_uid() = gcc_user_id);

-- ======================== problem_statement_interests ========================

CREATE POLICY problem_statement_interests_insert_owner
  ON problem_statement_interests FOR INSERT
  WITH CHECK (clerk_uid() = provider_user_id);

CREATE POLICY problem_statement_interests_select_owner
  ON problem_statement_interests FOR SELECT
  USING (clerk_uid() = provider_user_id);

CREATE POLICY problem_statement_interests_select_gcc
  ON problem_statement_interests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM problem_statements ps
      WHERE ps.id = problem_statement_id
        AND ps.gcc_user_id = clerk_uid()
    )
  );

-- ======================== gcc_problem_submission_quota ========================

CREATE POLICY gcc_problem_submission_quota_select_owner
  ON gcc_problem_submission_quota FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM problem_statements ps
      WHERE ps.gcc_org_id = gcc_problem_submission_quota.gcc_org_id
        AND ps.gcc_user_id = clerk_uid()
      LIMIT 1
    )
  );

-- ======================== agent_shortlists ========================

CREATE POLICY agent_shortlists_select_owner
  ON agent_shortlists FOR SELECT
  USING (clerk_uid() = created_by_user_id);

CREATE POLICY agent_shortlists_insert_owner
  ON agent_shortlists FOR INSERT
  WITH CHECK (clerk_uid() = created_by_user_id);

CREATE POLICY agent_shortlists_delete_owner
  ON agent_shortlists FOR DELETE
  USING (clerk_uid() = created_by_user_id);

-- ======================== contact_logs ========================

CREATE POLICY contact_logs_insert_owner
  ON contact_logs FOR INSERT
  WITH CHECK (clerk_uid() = gcc_user_id);

CREATE POLICY contact_logs_select_gcc
  ON contact_logs FOR SELECT
  USING (clerk_uid() = gcc_user_id);

CREATE POLICY contact_logs_select_provider
  ON contact_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM provider_profiles pp
      WHERE pp.id = provider_profile_id
        AND pp.user_id = clerk_uid()
    )
  );

-- ======================== provider_requests ========================

CREATE POLICY provider_requests_select_owner
  ON provider_requests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM provider_profiles pp
      WHERE pp.id = provider_profile_id
        AND pp.user_id = clerk_uid()
    )
  );

CREATE POLICY provider_requests_update_owner
  ON provider_requests FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM provider_profiles pp
      WHERE pp.id = provider_profile_id
        AND pp.user_id = clerk_uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM provider_profiles pp
      WHERE pp.id = provider_profile_id
        AND pp.user_id = clerk_uid()
    )
  );

-- ======================== agent_edits ========================

CREATE POLICY agent_edits_select_owner
  ON agent_edits FOR SELECT
  USING (clerk_uid() = user_id);

CREATE POLICY agent_edits_insert_owner
  ON agent_edits FOR INSERT
  WITH CHECK (clerk_uid() = user_id);

-- ======================== self_assessments ========================

CREATE POLICY self_assessments_select_owner
  ON self_assessments FOR SELECT
  USING (clerk_uid() = user_id);

CREATE POLICY self_assessments_insert_owner
  ON self_assessments FOR INSERT
  WITH CHECK (clerk_uid() = user_id);

CREATE POLICY self_assessments_update_owner
  ON self_assessments FOR UPDATE
  USING (clerk_uid() = user_id)
  WITH CHECK (clerk_uid() = user_id);

-- ======================== self_assessment_results ========================

CREATE POLICY self_assessment_results_select_owner
  ON self_assessment_results FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM self_assessments sa
      WHERE sa.id = assessment_id
        AND sa.user_id = clerk_uid()
    )
  );

CREATE POLICY self_assessment_results_insert_owner
  ON self_assessment_results FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM self_assessments sa
      WHERE sa.id = assessment_id
        AND sa.user_id = clerk_uid()
    )
  );

-- ======================== storage.objects — provider-logos ========================

CREATE POLICY storage_provider_logos_insert_owner
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'provider-logos'
    AND clerk_uid() = (storage.foldername(name))[1]
  );

CREATE POLICY storage_provider_logos_update_owner
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'provider-logos'
    AND clerk_uid() = (storage.foldername(name))[1]
  )
  WITH CHECK (
    bucket_id = 'provider-logos'
    AND clerk_uid() = (storage.foldername(name))[1]
  );

CREATE POLICY storage_provider_logos_delete_owner
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'provider-logos'
    AND clerk_uid() = (storage.foldername(name))[1]
  );

-- ======================== storage.objects — agent-logos ========================

CREATE POLICY storage_agent_logos_insert_owner
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'agent-logos'
    AND clerk_uid() = (storage.foldername(name))[1]
  );

CREATE POLICY storage_agent_logos_update_owner
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'agent-logos'
    AND clerk_uid() = (storage.foldername(name))[1]
  )
  WITH CHECK (
    bucket_id = 'agent-logos'
    AND clerk_uid() = (storage.foldername(name))[1]
  );

CREATE POLICY storage_agent_logos_delete_owner
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'agent-logos'
    AND clerk_uid() = (storage.foldername(name))[1]
  );

-- ======================== storage.objects — assessment-pdfs ========================

CREATE POLICY storage_assessment_pdfs_select_owner
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'assessment-pdfs'
    AND clerk_uid() = (storage.foldername(name))[1]
  );

CREATE POLICY storage_assessment_pdfs_insert_owner
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'assessment-pdfs'
    AND clerk_uid() = (storage.foldername(name))[1]
  );

CREATE POLICY storage_assessment_pdfs_delete_owner
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'assessment-pdfs'
    AND clerk_uid() = (storage.foldername(name))[1]
  );
