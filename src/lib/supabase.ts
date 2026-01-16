import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const isConfigured = supabaseUrl &&
    supabaseUrl !== 'your_supabase_url_here' &&
    supabaseAnonKey &&
    supabaseAnonKey !== 'your_supabase_anon_key_here'

if (!isConfigured) {
    console.warn('⚠️ Supabase credentials missing or invalid in .env file. Database features will be disabled.')
}

export const supabase = isConfigured
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null as any
