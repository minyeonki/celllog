import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://rcsqakeisrpgyiaycwgm.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJjc3Fha2Vpc3JwZ3lpYXljd2dtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk0NTMyNTQsImV4cCI6MjA5NTAyOTI1NH0.fd7PCwoITwdCTFfMInFqXTL9W5W56yNha_eKyUKT1jc'

export const supabase = createClient(supabaseUrl, supabaseKey)