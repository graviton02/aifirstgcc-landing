-- ============================================================================
-- Add Admin Approval Gate to Provider Requests
--
-- Changes:
-- 1. Add columns: message, gcc_user_id, admin_notes, reviewed_at
-- 2. Replace status check constraint with new values
-- 3. Change default from 'new' to 'pending_admin'
-- 4. Migrate existing 'new' rows to 'approved'
-- 5. Update RLS policies for provider/GCC/admin access
-- 6. Add index on gcc_user_id
-- ============================================================================

-- --------------------------------------------------------------------------
-- Step 1: Add new columns
-- --------------------------------------------------------------------------
ALTER TABLE provider_requests
  ADD COLUMN IF NOT EXISTS message TEXT,
  ADD COLUMN IF NOT EXISTS gcc_user_id TEXT,
  ADD COLUMN IF NOT EXISTS admin_notes TEXT,
  ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ;

-- --------------------------------------------------------------------------
-- Step 2: Replace status check constraint + change default
-- --------------------------------------------------------------------------
ALTER TABLE provider_requests DROP CONSTRAINT IF EXISTS provider_requests_status_check;

-- Migrate existing data before changing the constraint
UPDATE provider_requests SET status = 'approved' WHERE status = 'new';

ALTER TABLE provider_requests
  ADD CONSTRAINT provider_requests_status_check
  CHECK (status IN ('pending_admin', 'approved', 'rejected', 'contacted', 'archived'));

ALTER TABLE provider_requests ALTER COLUMN status SET DEFAULT 'pending_admin';

-- --------------------------------------------------------------------------
-- Step 3: Drop existing RLS policies (from fix migration 20260211080002)
-- --------------------------------------------------------------------------
DROP POLICY IF EXISTS provider_requests_select_owner ON provider_requests;
DROP POLICY IF EXISTS provider_requests_update_owner ON provider_requests;
DROP POLICY IF EXISTS provider_requests_insert_gcc ON provider_requests;

-- --------------------------------------------------------------------------
-- Step 4: Recreate RLS policies
-- --------------------------------------------------------------------------

-- Provider SELECT: only approved/contacted/archived requests (hides pending & rejected)
CREATE POLICY provider_requests_select_provider
  ON provider_requests FOR SELECT
  USING (
    status IN ('approved', 'contacted', 'archived')
    AND EXISTS (
      SELECT 1 FROM provider_profiles pp
      WHERE pp.id = provider_profile_id
        AND pp.user_id = clerk_uid()
    )
  );

-- Provider UPDATE: own requests, only transitions to contacted/archived
CREATE POLICY provider_requests_update_provider
  ON provider_requests FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM provider_profiles pp
      WHERE pp.id = provider_profile_id
        AND pp.user_id = clerk_uid()
    )
  )
  WITH CHECK (
    status IN ('contacted', 'archived')
    AND EXISTS (
      SELECT 1 FROM provider_profiles pp
      WHERE pp.id = provider_profile_id
        AND pp.user_id = clerk_uid()
    )
  );

-- GCC INSERT: user can only insert requests for themselves
CREATE POLICY provider_requests_insert_gcc
  ON provider_requests FOR INSERT
  WITH CHECK (clerk_uid() = gcc_user_id);

-- GCC SELECT: user can see their own requests (all statuses)
CREATE POLICY provider_requests_select_gcc
  ON provider_requests FOR SELECT
  USING (clerk_uid() = gcc_user_id);

-- --------------------------------------------------------------------------
-- Step 5: Add index on gcc_user_id for GCC request lookups
-- --------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_provider_requests_gcc_user_id
  ON provider_requests (gcc_user_id);
