import type { SupabaseClient } from '@supabase/supabase-js'

export async function uploadLogo(
  supabase: SupabaseClient,
  bucket: 'provider-logos' | 'agent-logos',
  userId: string,
  file: File,
): Promise<string> {
  const ext = file.name.split('.').pop()
  const path = `${userId}/${Date.now()}.${ext}`

  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, file, { upsert: true })

  if (error) throw new Error(error.message)

  return getPublicUrl(supabase, bucket, path)
}

export async function deleteLogo(
  supabase: SupabaseClient,
  bucket: string,
  path: string,
): Promise<void> {
  const { error } = await supabase.storage
    .from(bucket)
    .remove([path])

  if (error) throw new Error(error.message)
}

export function getPublicUrl(
  supabase: SupabaseClient,
  bucket: string,
  path: string,
): string {
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(path)

  return data.publicUrl
}

export async function uploadAssessmentPdf(
  supabase: SupabaseClient,
  userId: string,
  file: File,
): Promise<string> {
  const path = `${userId}/${Date.now()}.pdf`

  const { error } = await supabase.storage
    .from('assessment-pdfs')
    .upload(path, file, { upsert: true })

  if (error) throw new Error(error.message)

  // assessment-pdfs is private, so return the path (use signed URLs to access)
  return path
}
