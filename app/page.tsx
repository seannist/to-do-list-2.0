'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabaseClient.ts/supabaseClient'

export default function Page() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const checkUser = async () => {
      try {
        console.log('Checking user authentication...')
        const { data: { user }, error } = await supabase.auth.getUser()
        
        if (error) {
          console.error('Auth error:', error)
          throw error
        }
        
        console.log('Auth check successful, user:', user ? 'logged in' : 'not logged in')
        
        if (user) {
          router.push('/dashboard')
        } else {
          router.push('/login')
        }
      } catch (error) {
        console.error('Error checking user:', error)
        if (error instanceof Error) {
          setError(`Authentication error: ${error.message}`)
        } else {
          setError('Failed to check authentication status. Please try again.')
        }
      } finally {
        setIsLoading(false)
      }
    }

    checkUser()
  }, [router])

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Authentication Error</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="space-y-4">
            <button 
              onClick={() => window.location.reload()}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Retry
            </button>
            <button 
              onClick={() => router.push('/login')}
              className="w-full px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center p-8 bg-white rounded-lg shadow-md">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Checking authentication...</p>
      </div>
    </div>
  )
}
