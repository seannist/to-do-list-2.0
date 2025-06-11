import { supabase } from './supabaseClient.ts/supabaseClient'

export async function testSupabaseConnection() {
  try {
    // Test the connection by trying to fetch from the todos table
    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .limit(1)
    
    if (error) {
      console.error('Error connecting to Supabase:', error.message)
      return { success: false, error: error.message }
    }
    
    console.log('Successfully connected to Supabase!')
    return { success: true, data }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { success: false, error: 'Unexpected error occurred' }
  }
} 