// lib/sbp_5e1c174e4714aefe0202ed7dad2bd7aa25badf1e
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vosabenbvwdzhylzdtcx.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvc2FiZW5idndkemh5bHpkdGN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1MjY3MTQsImV4cCI6MjA2NTEwMjcxNH0.TfRoUL-y4l0HHbHM1kYr-Sty2ktcdUdNuia1AH2uAl8'

// Create Supabase client with explicit configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Test the connection immediately
async function testInitialConnection() {
  try {
    const { error } = await supabase.from('todos').select('count').limit(1)
    if (error) {
      console.error('Initial Supabase connection test failed:', error.message)
    } else {
      console.log('Supabase connection successful')
    }
  } catch (error: unknown) {
    console.error('Failed to connect to Supabase:', error instanceof Error ? error.message : 'Unknown error')
  }
}

testInitialConnection()
