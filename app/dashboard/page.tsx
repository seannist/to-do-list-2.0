'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabaseClient.ts/supabaseClient'
import CyberMilitaryTodo from '../../todo-app'

export default function DashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser()
        if (error || !user) {
          router.push('/login')
        }
      } catch (error) {
        console.error('Error checking auth status:', error)
        router.push('/login')
      } finally {
        setLoading(false)
      }
    }

    checkUser()
  }, [router])

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      router.push('/login')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center p-4 bg-black/50 backdrop-blur-sm border-b border-purple-500/20">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-500 text-transparent bg-clip-text">
            Mission Control
          </h1>
          <button
            onClick={handleSignOut}
            className="px-4 py-2 bg-red-600/80 hover:bg-red-700 text-white rounded border border-red-500/50 backdrop-blur-sm transition-all duration-200 hover:shadow-[0_0_15px_rgba(239,68,68,0.5)]"
          >
            Sign Out
          </button>
        </div>
        <div className="p-4">
          <CyberMilitaryTodo />
        </div>
      </div>
    </div>
  )
} 