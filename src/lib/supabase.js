import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

export function getUserId() {
  let id = localStorage.getItem('memoryPalaceUserId')
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem('memoryPalaceUserId', id)
  }
  return id
}
