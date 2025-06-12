'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabaseClient.ts/supabaseClient'
import { Button } from '@/components/ui/button'
import { Loader2, Upload } from 'lucide-react'
import { analyzeBase64Image } from '@/lib/mistral/imageAnalysis'
import { createTodo } from '@/lib/supabase/todoOperations'
import { toast } from 'sonner'

export default function Dashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

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

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      router.push('/login')
    } catch (err) {
      console.error('Error signing out:', err)
      setError('Failed to sign out')
    }
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setIsAnalyzing(true)
      const filePath = URL.createObjectURL(file)
      const analysis = await analyzeBase64Image(filePath)

      // Split the analysis into individual tasks
      const tasks = analysis
        .split(/[.,]/)
        .map(task => task.trim())
        .filter(task => task.length > 0)
        .map(task => ({
          title: task,
          priority: 'medium' as const,
          description: `Created from image analysis: ${file.name}`
        }))

      // Create todos for each task
      let successCount = 0
      for (const task of tasks) {
        const { error: createError } = await createTodo(task)
        if (createError) {
          console.error('Error creating todo:', createError)
        } else {
          successCount++
        }
      }

      if (successCount > 0) {
        toast.success(`Created ${successCount} tasks from image analysis`)
        // Redirect to the todo list page
        router.push('/todo-app')
      } else {
        toast.error('Failed to create any tasks from the image')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to analyze image'
      toast.error(errorMessage)
    } finally {
      setIsAnalyzing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="bg-red-50 p-4 rounded-lg text-red-700 mb-4">
          {error}
        </div>
        <Button onClick={() => router.push('/login')}>
          Return to Login
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <div className="flex gap-4">
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
                disabled={isAnalyzing}
              />
              <label
                htmlFor="image-upload"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Image
                  </>
                )}
              </label>
            </div>
            <Button
              onClick={handleSignOut}
              variant="outline"
              className="text-gray-600 hover:text-gray-900"
            >
              Sign Out
            </Button>
          </div>
        </div>

        <div className="grid gap-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Welcome to Your Dashboard</h2>
            <p className="text-gray-600">
              Upload an image to create tasks automatically, or visit your todo list to manage your tasks.
            </p>
            <div className="mt-6">
              <Button
                onClick={() => router.push('/todo-app')}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Go to Todo List
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 