import { createClient } from '@supabase/supabase-js'

// Environment variables for Supabase connection
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

// Validate environment variables
if (!supabaseUrl) {
  throw new Error('Missing VITE_SUPABASE_URL environment variable')
}

if (!supabaseKey) {
  throw new Error('Missing VITE_SUPABASE_PUBLISHABLE_KEY environment variable')
}

// Create Supabase client instance
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  }
})

// Export the client for use in other files
export default supabase