import { supabase } from './supabaseClient.ts/supabaseClient'

export async function fetchData() {
  const { data, error } = await supabase.from('your_table_name').select('*')
  if (error) {
    console.error('Error fetching data:', error)
  } else {
    console.log('Data from Supabase:', data)
  }
  return { data, error }
} 