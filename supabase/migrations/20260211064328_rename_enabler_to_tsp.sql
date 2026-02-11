-- ============================================================================
-- Rename 'enabler' to 'tsp' in provider_profiles.category
-- Reason: Both TSPs and Startups are "enablers" — the term was ambiguous.
-- ============================================================================

-- Drop the existing CHECK constraint and recreate with 'tsp'
ALTER TABLE provider_profiles
  DROP CONSTRAINT IF EXISTS provider_profiles_category_check;

ALTER TABLE provider_profiles
  ADD CONSTRAINT provider_profiles_category_check
  CHECK (category IN ('tsp', 'startup'));

-- Update any existing rows (safe even if table is empty)
UPDATE provider_profiles SET category = 'tsp' WHERE category = 'enabler';
