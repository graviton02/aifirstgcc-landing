-- ============================================================================
-- Storage Buckets Migration
-- Creates: provider-logos, agent-logos, assessment-pdfs
-- ============================================================================

-- --------------------------------------------------------------------------
-- 1. provider-logos — public bucket for provider company logos
--    Public read (anon can view), authenticated write with user_id prefix.
--    File size limit: 2MB
-- --------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('provider-logos', 'provider-logos', true, 2097152)
ON CONFLICT (id) DO NOTHING;

-- Anyone can view logos (public bucket)
CREATE POLICY storage_provider_logos_select_public
  ON storage.objects FOR SELECT
  USING (bucket_id = 'provider-logos');

-- Authenticated users can upload to their own folder
CREATE POLICY storage_provider_logos_insert_owner
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'provider-logos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Authenticated users can update their own files
CREATE POLICY storage_provider_logos_update_owner
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'provider-logos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  )
  WITH CHECK (
    bucket_id = 'provider-logos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Authenticated users can delete their own files
CREATE POLICY storage_provider_logos_delete_owner
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'provider-logos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- --------------------------------------------------------------------------
-- 2. agent-logos — public bucket for agent logos
--    Same access pattern as provider-logos.
--    File size limit: 2MB
-- --------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('agent-logos', 'agent-logos', true, 2097152)
ON CONFLICT (id) DO NOTHING;

-- Anyone can view agent logos (public bucket)
CREATE POLICY storage_agent_logos_select_public
  ON storage.objects FOR SELECT
  USING (bucket_id = 'agent-logos');

-- Authenticated users can upload to their own folder
CREATE POLICY storage_agent_logos_insert_owner
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'agent-logos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Authenticated users can update their own files
CREATE POLICY storage_agent_logos_update_owner
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'agent-logos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  )
  WITH CHECK (
    bucket_id = 'agent-logos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Authenticated users can delete their own files
CREATE POLICY storage_agent_logos_delete_owner
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'agent-logos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- --------------------------------------------------------------------------
-- 3. assessment-pdfs — private bucket for AI readiness assessment exports
--    Authenticated read/write with user_id prefix. No public access.
--    File size limit: 10MB
-- --------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('assessment-pdfs', 'assessment-pdfs', false, 10485760)
ON CONFLICT (id) DO NOTHING;

-- Authenticated users can read their own PDFs
CREATE POLICY storage_assessment_pdfs_select_owner
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'assessment-pdfs'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Authenticated users can upload to their own folder
CREATE POLICY storage_assessment_pdfs_insert_owner
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'assessment-pdfs'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Authenticated users can delete their own PDFs
CREATE POLICY storage_assessment_pdfs_delete_owner
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'assessment-pdfs'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
