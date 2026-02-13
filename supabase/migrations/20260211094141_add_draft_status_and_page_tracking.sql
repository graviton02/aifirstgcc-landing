-- ============================================================================
-- Add Draft Status & Page Tracking for Save-Per-Page Onboarding
--
-- Changes:
-- 1. Add 'draft' to submission_status CHECK on tsp_submissions & startup_submissions
-- 2. Make contact_name and contact_email nullable (page 5 fields)
-- 3. Add completed_pages INT[] column for progress tracking
-- 4. Update RLS update policies to allow 'draft' status (uses clerk_uid())
-- ============================================================================

-- --------------------------------------------------------------------------
-- Step 1: Update CHECK constraints to include 'draft'
-- --------------------------------------------------------------------------

-- tsp_submissions: drop old CHECK, add new one
ALTER TABLE tsp_submissions
  DROP CONSTRAINT IF EXISTS tsp_submissions_submission_status_check;

ALTER TABLE tsp_submissions
  ADD CONSTRAINT tsp_submissions_submission_status_check
  CHECK (submission_status IN ('draft', 'pending', 'approved', 'rejected', 'changes_requested'));

-- startup_submissions: drop old CHECK, add new one
ALTER TABLE startup_submissions
  DROP CONSTRAINT IF EXISTS startup_submissions_submission_status_check;

ALTER TABLE startup_submissions
  ADD CONSTRAINT startup_submissions_submission_status_check
  CHECK (submission_status IN ('draft', 'pending', 'approved', 'rejected', 'changes_requested'));

-- --------------------------------------------------------------------------
-- Step 2: Make contact_name and contact_email nullable
-- --------------------------------------------------------------------------

ALTER TABLE tsp_submissions
  ALTER COLUMN contact_name DROP NOT NULL;

ALTER TABLE tsp_submissions
  ALTER COLUMN contact_email DROP NOT NULL;

ALTER TABLE startup_submissions
  ALTER COLUMN contact_name DROP NOT NULL;

ALTER TABLE startup_submissions
  ALTER COLUMN contact_email DROP NOT NULL;

-- --------------------------------------------------------------------------
-- Step 3: Add completed_pages column
-- --------------------------------------------------------------------------

ALTER TABLE tsp_submissions
  ADD COLUMN IF NOT EXISTS completed_pages INT[] NOT NULL DEFAULT '{}';

ALTER TABLE startup_submissions
  ADD COLUMN IF NOT EXISTS completed_pages INT[] NOT NULL DEFAULT '{}';

-- --------------------------------------------------------------------------
-- Step 4: Update RLS update policies to allow 'draft' status
--         (Current policies only allow updates when submission_status = 'pending')
-- --------------------------------------------------------------------------

-- Drop existing update policies (were recreated in clerk_jwt migration)
DROP POLICY IF EXISTS tsp_submissions_update_owner ON tsp_submissions;
DROP POLICY IF EXISTS startup_submissions_update_owner ON startup_submissions;

-- Recreate with draft OR pending allowed
CREATE POLICY tsp_submissions_update_owner
  ON tsp_submissions FOR UPDATE
  USING (clerk_uid() = user_id AND submission_status IN ('draft', 'pending'))
  WITH CHECK (clerk_uid() = user_id);

CREATE POLICY startup_submissions_update_owner
  ON startup_submissions FOR UPDATE
  USING (clerk_uid() = user_id AND submission_status IN ('draft', 'pending'))
  WITH CHECK (clerk_uid() = user_id);
