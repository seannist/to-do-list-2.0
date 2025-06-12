'use client'

import { useState, useEffect } from "react"
import { Plus, Check, Trash2, Target, Zap, Shield, Crosshair, Loader2, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { supabase } from '@/lib/supabaseClient.ts/supabaseClient'
import { Todo, CreateTodoInput, UpdateTodoInput } from '@/lib/types/todo'
import { toast, Toaster } from 'sonner'
import { fetchTodos, createTodo, updateTodo, deleteTodo, toggleTodoComplete, testConnection } from '@/lib/supabase/todoOperations'
import { analyzeBase64Image, analyzeImageUrl } from '@/lib/mistral/imageAnalysis'

type Priority = "low" | "medium" | "high" | "critical"

interface Mission extends Todo {
  color: string
  isOverdue?: boolean
}

const priorityColors: Record<Priority, string> = {
  low: "from-green-400 to-green-600",
  medium: "from-yellow-400 to-orange-500",
  high: "from-orange-500 to-red-500",
  critical: "from-red-500 to-pink-600",
}

const priorityGlow: Record<Priority, string> = {
  low: "shadow-green-500/50",
  medium: "shadow-yellow-500/50",
  high: "shadow-orange-500/50",
  critical: "shadow-red-500/50",
}

const missionColors = [
  "from-cyan-400 to-blue-600",
  "from-green-400 to-emerald-600",
  "from-purple-400 to-violet-600",
  "from-pink-400 to-rose-600",
  "from-yellow-400 to-amber-600",
  "from-red-400 to-rose-600",
  "from-indigo-400 to-purple-600",
  "from-teal-400 to-cyan-600",
]

export default function TodoList() {
  const [missions, setMissions] = useState<Mission[]>([])
  const [newMission, setNewMission] = useState("")
  const [selectedPriority, setSelectedPriority] = useState<Priority>("medium")
  const [selectedDueDate, setSelectedDueDate] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  // Add function to check if a mission is overdue
  const checkOverdueStatus = (dueDate: string | null | undefined) => {
    if (!dueDate) return false
    const due = new Date(dueDate)
    const now = new Date()
    return due < now
  }

  useEffect(() => {
    const initializeApp = async () => {
      try {
        setIsLoading(true)
        
        // Test connection first
        const { error: connectionError } = await testConnection()
        if (connectionError) {
          toast.error(`Connection error: ${connectionError}`)
          return
        }

        // If connection is successful, load missions
        const { data, error } = await fetchTodos()
        
        if (error) {
          toast.error(`Failed to load missions: ${error}`)
          return
        }

        const missionsWithColors = data?.map(todo => ({
          ...todo,
          color: missionColors[Math.floor(Math.random() * missionColors.length)],
          isOverdue: checkOverdueStatus(todo.due_date)
        })) || []

        setMissions(missionsWithColors)
      } catch (error) {
        toast.error('Failed to initialize app')
      } finally {
        setIsLoading(false)
      }
    }

    initializeApp()
  }, [])

  const addMission = async () => {
    if (newMission.trim() === "") {
      toast.error('Mission objective cannot be empty')
      return
    }

    try {
      setIsLoading(true)
      
      // Create the new todo with all required fields
      const newTodo: CreateTodoInput = {
        title: newMission.trim(),
        priority: selectedPriority,
        due_date: selectedDueDate || undefined,
        description: `Mission priority: ${selectedPriority}${selectedDueDate ? `, Due: ${selectedDueDate}` : ''}`
      }

      const { data, error } = await createTodo(newTodo)
      
      if (error) {
        toast.error(`Failed to create mission: ${error}`)
        return
      }

      if (!data) {
        toast.error('Failed to create mission: No data returned')
        return
      }

      // Create the mission with a random color
      const missionWithColor: Mission = {
        ...data,
        color: missionColors[Math.floor(Math.random() * missionColors.length)]
      }

      // Update the missions list
      setMissions(prevMissions => [missionWithColor, ...prevMissions])
      
      // Reset form
      setNewMission("")
      setSelectedDueDate("")
      setSelectedPriority("medium")
      
      toast.success('Mission deployed successfully')
    } catch (error) {
      console.error('Error in addMission:', error)
      toast.error('Failed to deploy mission: An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setIsAnalyzing(true)
      const reader = new FileReader()
      
      reader.onload = async (e) => {
        try {
          const base64Image = e.target?.result as string
          const analysis = await analyzeBase64Image(base64Image)

          // Split the analysis into individual tasks
          const tasks = analysis
            .split(/[.,]/)
            .map(task => task.trim())
            .filter(task => task.length > 0)
            .map(task => ({
              title: task,
              priority: selectedPriority,
              description: `Created from image analysis: ${file.name}`,
              due_date: selectedDueDate || undefined
            }))

          // Create todos for each task
          let successCount = 0
          for (const task of tasks) {
            const { data, error } = await createTodo(task)
            if (error) {
              console.error('Error creating todo:', error)
            } else if (data) {
              const missionWithColor: Mission = {
                ...data,
                color: missionColors[Math.floor(Math.random() * missionColors.length)],
                isOverdue: checkOverdueStatus(data.due_date)
              }
              setMissions(prevMissions => [missionWithColor, ...prevMissions])
              successCount++
            }
          }

          if (successCount > 0) {
            toast.success(`Created ${successCount} missions from image analysis`)
          } else {
            toast.error('Failed to create any missions from the image')
          }
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to analyze image'
          toast.error(errorMessage)
        } finally {
          setIsAnalyzing(false)
        }
      }

      reader.onerror = () => {
        toast.error('Failed to read the image file')
        setIsAnalyzing(false)
      }

      reader.readAsDataURL(file)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to process image'
      toast.error(errorMessage)
      setIsAnalyzing(false)
    }
  }

  const toggleMission = async (id: string, completed: boolean) => {
    try {
      const { data, error } = await toggleTodoComplete(id, completed)
      if (error) {
        toast.error(`Failed to update mission: ${error}`)
        return
      }

      setMissions(prevMissions =>
        prevMissions.map(mission =>
          mission.id === id ? { ...mission, completed } : mission
        )
      )

      toast.success(completed ? 'Mission completed!' : 'Mission reactivated')
    } catch (error) {
      toast.error('Failed to update mission status')
    }
  }

  const deleteMission = async (id: string) => {
    try {
      const { error } = await deleteTodo(id)
      if (error) {
        toast.error(`Failed to delete mission: ${error}`)
        return
      }

      setMissions(prevMissions =>
        prevMissions.filter(mission => mission.id !== id)
      )

      toast.success('Mission terminated successfully')
    } catch (error) {
      toast.error('Failed to delete mission')
    }
  }

  // Calculate mission completion ratio
  const completedMissions = missions.filter(mission => mission.completed).length
  const totalMissions = missions.length
  const completionRatio = totalMissions > 0 ? (completedMissions / totalMissions) * 100 : 0

  return (
    <>
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: '#1a1a1a',
            color: '#fff',
            border: '1px solid #333',
          },
        }}
      />
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Enhanced Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-4">
            <Target className="w-6 h-6 sm:w-8 sm:h-8 text-cyan-400 neon-glow" />
            <h1
              className="text-3xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-cyan-400 via-green-400 to-purple-400 bg-clip-text text-transparent cyber-font tracking-wider glitch-effect"
              data-text="Operation: Mission Accomplished"
            >
              Operation: Mission Accomplished
            </h1>
            <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-green-400 neon-glow" />
          </div>
          <p className="text-cyan-300 text-sm sm:text-lg cyber-text tracking-wide">WHAT IS YOUR DUTY? TO COMPLETE THE TASK!</p>
          <div className="w-full h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent mt-4 neon-glow" />
        </div>

        {/* Mission Completion Ratio */}
        <div className="mb-6 sm:mb-8">
          <div className="bg-gray-800/50 rounded-lg p-4 border border-cyan-500/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-cyan-400 cyber-text">Mission Completion Ratio</span>
              <span className="text-green-400 cyber-text">{completionRatio.toFixed(1)}%</span>
            </div>
            <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-cyan-500 to-green-500 transition-all duration-500"
                style={{ width: `${completionRatio}%` }}
              />
            </div>
          </div>
        </div>

        {/* Enhanced Mission Input Terminal */}
        <Card className="mb-6 sm:mb-8 border border-purple-500/30 shadow-xl shadow-purple-500/20 bg-gray-900/90 backdrop-blur-sm hover:shadow-purple-500/40 transition-all duration-300 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-transparent to-cyan-500/5 hologram" />
          <CardContent className="p-4 sm:p-6 relative z-10">
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-400 rounded-full animate-pulse neon-glow" />
                <span className="text-green-400 cyber-text text-xs sm:text-sm font-semibold tracking-wider">
                  MISSION BRIEFING TERMINAL
                </span>
              </div>
              <div className="w-full h-px bg-gradient-to-r from-green-400/50 to-transparent neon-glow" />
            </div>

            <div className="space-y-4">
              <div className="flex flex-col gap-3">
                <Input
                  type="text"
                  placeholder="Enter mission objective..."
                  value={newMission}
                  onChange={(e) => setNewMission(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !isLoading && addMission()}
                  disabled={isLoading}
                  className="h-12 sm:h-14 bg-gray-800/50 border-2 border-cyan-500/30 focus:border-cyan-400 text-white placeholder-gray-400 cyber-text text-sm sm:text-base rounded-lg transition-all duration-200 hover:shadow-cyan-500/20 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                />

                {/* Priority Selection */}
                <div className="grid grid-cols-4 gap-2">
                  {Object.entries(priorityColors).map(([priority, gradient]) => (
                    <Button
                      key={priority}
                      onClick={() => setSelectedPriority(priority as Priority)}
                      className={`h-12 bg-gradient-to-r ${gradient} ${
                        selectedPriority === priority ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-900' : ''
                      } text-white cyber-text font-bold rounded-lg shadow-lg transition-all duration-300 hover:scale-105`}
                    >
                      {priority.toUpperCase()}
                    </Button>
                  ))}
                </div>

                {/* Due Date Input */}
                <Input
                  type="date"
                  value={selectedDueDate}
                  onChange={(e) => setSelectedDueDate(e.target.value)}
                  className="h-12 bg-gray-800/50 border-2 border-cyan-500/30 focus:border-cyan-400 text-white cyber-text text-sm rounded-lg transition-all duration-200 hover:shadow-cyan-500/20 hover:shadow-lg"
                />

                <div className="flex gap-2">
                  <Button
                    onClick={addMission}
                    disabled={isLoading || !newMission.trim()}
                    className="flex-1 h-12 sm:h-14 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 text-white cyber-text font-bold rounded-lg shadow-lg shadow-cyan-500/30 hover:shadow-xl transition-all duration-300 hover:scale-105 neon-glow disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 animate-spin" />
                    ) : (
                      <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    )}
                    {isLoading ? "DEPLOYING..." : "DEPLOY MISSION"}
                  </Button>

                  {/* Image Upload Button */}
                  <label className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={isAnalyzing}
                    />
                    <Button
                      type="button"
                      disabled={isAnalyzing}
                      className="w-full h-12 sm:h-14 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white cyber-text font-bold rounded-lg shadow-lg shadow-purple-500/30 hover:shadow-xl transition-all duration-300 hover:scale-105 neon-glow disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isAnalyzing ? (
                        <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 animate-spin" />
                      ) : (
                        <Upload className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                      )}
                      {isAnalyzing ? "ANALYZING..." : "UPLOAD IMAGE"}
                    </Button>
                  </label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Missions List */}
        <div className="space-y-3 sm:space-y-4">
          {isLoading && missions.length === 0 ? (
            <Card className="border border-gray-600/30 shadow-lg bg-gray-900/60 backdrop-blur-sm hover:shadow-gray-600/40 transition-all duration-300 relative overflow-hidden">
              <div className="absolute inset-0 hologram" />
              <CardContent className="p-8 sm:p-12 text-center relative z-10">
                <div className="w-16 h-16 sm:w-24 sm:h-24 mx-auto mb-4 rounded-full bg-gradient-to-r from-gray-700 to-gray-800 flex items-center justify-center border border-gray-600 neon-glow">
                  <Loader2 className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400 animate-spin" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-300 mb-2 cyber-font">LOADING MISSIONS...</h3>
                <p className="text-gray-500 cyber-text text-sm sm:text-base">Please stand by...</p>
              </CardContent>
            </Card>
          ) : missions.length === 0 ? (
            <Card className="border border-gray-600/30 shadow-lg bg-gray-900/60 backdrop-blur-sm hover:shadow-gray-600/40 transition-all duration-300 relative overflow-hidden">
              <div className="absolute inset-0 hologram" />
              <CardContent className="p-8 sm:p-12 text-center relative z-10">
                <div className="w-16 h-16 sm:w-24 sm:h-24 mx-auto mb-4 rounded-full bg-gradient-to-r from-gray-700 to-gray-800 flex items-center justify-center border border-gray-600 neon-glow">
                  <Target className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-300 mb-2 cyber-font">NO ACTIVE MISSIONS</h3>
                <p className="text-gray-500 cyber-text text-sm sm:text-base">Deploy your first tactical objective!</p>
              </CardContent>
            </Card>
          ) : (
            missions.map((mission) => (
              <Card
                key={mission.id}
                className={`border transition-all duration-300 hover:shadow-xl hover:scale-[1.02] bg-gray-900/80 backdrop-blur-sm relative overflow-visible ${
                  mission.completed
                    ? "border-gray-600/30 shadow-gray-500/10"
                    : mission.isOverdue
                    ? "border-red-500/50 shadow-red-500/20"
                    : `border-${mission.priority === "critical" ? "red" : mission.priority === "high" ? "orange" : mission.priority === "medium" ? "yellow" : "green"}-500/30 shadow-lg ${priorityGlow[mission.priority]}`
                }`}
              >
                <div className="absolute inset-0 hologram opacity-30" />
                <div className="absolute inset-0 data-stream" />
                <CardContent className="p-3 sm:p-4 relative z-10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Button
                        onClick={() => toggleMission(mission.id, !mission.completed)}
                        className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 transition-all duration-300 ${
                          mission.completed
                            ? "border-green-500 bg-green-500/20 hover:bg-green-500/30"
                            : "border-gray-400 hover:border-gray-300"
                        }`}
                      >
                        {mission.completed && (
                          <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
                        )}
                      </Button>
                      <div className="flex flex-col">
                        <h3
                          className={`text-base sm:text-lg font-semibold cyber-text ${
                            mission.completed ? "text-gray-500 line-through" : "text-white"
                          }`}
                        >
                          {mission.title}
                        </h3>
                        <div className="flex items-center gap-2">
                          {mission.description && (
                            <p className="text-sm text-gray-400 cyber-text">
                              {mission.description}
                            </p>
                          )}
                          {mission.isOverdue && !mission.completed && (
                            <div className="absolute top-0 right-0 transform translate-x-1/4 -translate-y-1/4 z-20">
                              <div className="bg-red-500 px-4 py-2 rounded-lg shadow-lg border-2 border-red-400 flex items-center gap-2 animate-pulse">
                                <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M12 8V12L15 15" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  <circle cx="12" cy="12" r="9" stroke="white" strokeWidth="2"/>
                                </svg>
                                <span className="text-white font-bold cyber-text text-lg tracking-wider">
                                  OVERDUE
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => deleteMission(mission.id)}
                        className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-red-500/30 hover:border-red-500 bg-red-500/10 hover:bg-red-500/20 transition-all duration-300"
                      >
                        <Trash2 className="w-4 h-4 sm:w-5 sm:h-5 text-red-400" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </>
  )
} 