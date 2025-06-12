"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabaseClient.ts/supabaseClient'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import TodoList from './TodoList'

export default function TodoPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          throw sessionError
        }

        if (!session) {
          router.push('/login')
          return
        }

        setLoading(false)
      } catch (err) {
        console.error('Session check error:', err)
        setError('Failed to check authentication status')
        setLoading(false)
      }
    }

    checkSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        router.push('/login')
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-900">
        <div className="bg-red-900/50 p-4 rounded-lg text-red-400 mb-4 border border-red-500/30">
          {error}
        </div>
        <Button 
          onClick={() => router.push('/login')}
          className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 text-white"
        >
          Return to Login
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-cyan-400 cyber-font">Mission Control</h1>
          <Button
            onClick={() => router.push('/dashboard')}
            className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 text-white"
          >
            Back to Dashboard
          </Button>
        </div>
        <TodoList />
      </div>
    </div>
  )
}
