// lib/sbp_5e1c174e4714aefe0202ed7dad2bd7aa25badf1e
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vosabenbvwdzhylzdtcx.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvc2FiZW5idndkemh5bHpkdGN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1MjY3MTQsImV4cCI6MjA2NTEwMjcxNH0.TfRoUL-y4l0HHbHM1kYr-Sty2ktcdUdNuia1AH2uAl8'

// Create Supabase client with explicit configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storageKey: 'supabase.auth.token',
    storage: {
      getItem: (key) => {
        try {
          const item = localStorage.getItem(key)
          return item ? JSON.parse(item) : null
        } catch (error) {
          console.error('Error reading from localStorage:', error)
          return null
        }
      },
      setItem: (key, value) => {
        try {
          localStorage.setItem(key, JSON.stringify(value))
        } catch (error) {
          console.error('Error writing to localStorage:', error)
        }
      },
      removeItem: (key) => {
        try {
          localStorage.removeItem(key)
        } catch (error) {
          console.error('Error removing from localStorage:', error)
        }
      }
    }
  }
})

// Test the connection immediately
async function testInitialConnection() {
  try {
    console.log('Testing Supabase connection...')
    
    // First, check if we can connect to Supabase
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    if (sessionError) {
      console.error('Session check failed:', sessionError.message)
      return
    }

    if (!session) {
      console.log('No active session found')
      return
    }

    console.log('Session found:', session.user.email)

    // Then try to access the todos table
    const { error: tableError } = await supabase.from('todos').select('count').limit(1)
    if (tableError) {
      console.error('Table access test failed:', tableError.message)
      console.error('Table error details:', tableError)
      return
    }

    console.log('Supabase connection successful')
  } catch (error: unknown) {
    console.error('Failed to connect to Supabase:', error instanceof Error ? error.message : 'Unknown error')
    if (error instanceof Error) {
      console.error('Error stack:', error.stack)
    }
  }
}

// Only run the connection test in the browser
if (typeof window !== 'undefined') {
  testInitialConnection()
}
