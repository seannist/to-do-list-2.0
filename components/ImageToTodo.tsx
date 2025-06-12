'use client'

import { useState, useEffect } from 'react'
import { analyzeBase64Image, analyzeImageUrl } from '@/lib/mistral/imageAnalysis'
import { createTodo } from '@/lib/supabase/todoOperations'
import { supabase } from '@/lib/supabaseClient.ts/supabaseClient'
import { toast } from 'sonner'
import { Plus, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function ImageToTodo() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [imageUrl, setImageUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        setUserId(session.user.id)
      }
    }
    getCurrentUser()
  }, [])

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setImageUrl('')
    }
  }

  const handleUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setImageUrl(event.target.value)
    setSelectedFile(null)
  }

  const analyzeAndCreateTodos = async () => {
    if (!userId) {
      setError('You must be logged in to create todos')
      toast.error('You must be logged in to create todos')
      return
    }

    setLoading(true)
    setError(null)

    try {
      let analysis: string
      if (selectedFile) {
        const filePath = URL.createObjectURL(selectedFile)
        analysis = await analyzeBase64Image(filePath)
      } else if (imageUrl) {
        analysis = await analyzeImageUrl(imageUrl)
      } else {
        throw new Error('Please select an image file or enter an image URL')
      }

      // Split the analysis into individual tasks
      const tasks = analysis
        .split(/[.,]/)
        .map(task => task.trim())
        .filter(task => task.length > 0)
        .map(task => ({
          title: task,
          priority: 'medium' as const,
          description: `Created from image analysis: ${selectedFile ? 'uploaded image' : imageUrl}`,
          user_id: userId
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
      } else {
        toast.error('Failed to create any tasks')
      }
      
      // Reset form
      setSelectedFile(null)
      setImageUrl('')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to analyze image'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Image to Todo List</h2>
      
      {/* File Upload */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Upload Image
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100"
        />
      </div>

      {/* URL Input */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Or Enter Image URL
        </label>
        <Input
          type="url"
          value={imageUrl}
          onChange={handleUrlChange}
          placeholder="https://example.com/image.jpg"
          className="w-full"
        />
      </div>

      {/* Analyze Button */}
      <Button
        onClick={analyzeAndCreateTodos}
        disabled={loading || (!selectedFile && !imageUrl) || !userId}
        className="w-full"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Analyzing...
          </>
        ) : (
          <>
            <Plus className="w-4 h-4 mr-2" />
            Create Todos from Image
          </>
        )}
      </Button>

      {/* Error Message */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {/* Preview */}
      {(selectedFile || imageUrl) && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Image Preview:</h3>
          <img
            src={selectedFile ? URL.createObjectURL(selectedFile) : imageUrl}
            alt="Preview"
            className="max-w-full h-auto rounded-md"
          />
        </div>
      )}
    </div>
  )
} 