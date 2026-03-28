import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables not set. Form submissions will be disabled.')
}

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

export interface EarlyAccessSignup {
  email: string
}

export async function submitEarlyAccess(data: EarlyAccessSignup) {
  if (!supabase) {
    throw new Error('Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.')
  }

  const { error } = await supabase
    .from('early_access_signups')
    .insert([data])

  if (error) {
    if (error.code === '23505') {
      throw new Error('This email is already registered for early access.')
    }
    throw new Error('Failed to submit. Please try again.')
  }

  return { success: true }
}
