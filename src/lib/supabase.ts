import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY environment variables')
}

// Using untyped client; row shapes are enforced via the hook return types.
// Generating a full Supabase type schema (supabase gen types) is the
// production approach — omitted here for brevity.
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
