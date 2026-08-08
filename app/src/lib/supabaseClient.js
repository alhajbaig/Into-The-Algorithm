import { createClient } from '@supabase/supabase-js'

const rawUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim()
const rawKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim()

// Automatically sanitize URL to strip trailing /rest/v1 or trailing slashes if accidentally included
const cleanUrl = rawUrl.replace(/\/rest\/v1\/?$/i, '').replace(/\/+$/, '')

export const isSupabaseConfigured = Boolean(
  cleanUrl &&
  rawKey &&
  !cleanUrl.includes('your-project-id') &&
  !cleanUrl.includes('placeholder') &&
  !rawKey.includes('placeholder')
)

const supabaseUrl = isSupabaseConfigured ? cleanUrl : 'https://placeholder-supabase-url.supabase.co'
const supabaseAnonKey = isSupabaseConfigured ? rawKey : 'placeholder-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)


