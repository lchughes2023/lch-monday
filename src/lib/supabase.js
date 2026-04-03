import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://yqdmteewddhbusmhqqqa.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_Gpq_9HumiOQ_-yuIegQrPg_4NoDVj3l'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

export function getUserId() {
  let id = localStorage.getItem('memoryPalaceUserId')
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem('memoryPalaceUserId', id)
  }
  return id
}
