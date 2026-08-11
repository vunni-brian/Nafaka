import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

/**
 * Browser client for authenticated user data. The publishable key is safe to
 * expose in the app; Row Level Security in the SQL migration protects data.
 */
export const supabase = url && publishableKey ? createClient(url, publishableKey) : null
