"use client"

import { useState, useEffect } from "react"
import { Plus, Check, Trash2, Target, Zap, Shield, Crosshair, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { supabase } from '@/lib/supabaseClient.ts/supabaseClient'
import { Todo, CreateTodoInput, UpdateTodoInput } from '@/lib/types/todo'
import { toast, Toaster } from 'sonner'
import { fetchTodos, createTodo, updateTodo, deleteTodo, toggleTodoComplete, testConnection } from '@/lib/supabase/todoOperations'

type Priority = "low" | "medium" | "high" | "critical"

interface Mission extends Todo {
  color: string
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

export default function CyberMilitaryTodo() {
  const [missions, setMissions] = useState<Mission[]>([])
  const [newMission, setNewMission] = useState("")
  const [selectedPriority, setSelectedPriority] = useState<Priority>("medium")
  const [selectedDueDate, setSelectedDueDate] = useState("")
  const [isLoading, setIsLoading] = useState(false)

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
          color: missionColors[Math.floor(Math.random() * missionColors.length)]
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

  const toggleMission = async (id: string) => {
    try {
      setIsLoading(true)
      const mission = missions.find(m => m.id === id)
      if (!mission) return

      const { error } = await toggleTodoComplete(id, !mission.completed)
      
      if (error) {
        toast.error(error)
        return
      }

      setMissions(missions.map(mission => 
        mission.id === id 
          ? { ...mission, completed: !mission.completed }
          : mission
      ))
      toast.success('Mission status updated')
    } catch {
      toast.error('Failed to update mission status')
    } finally {
      setIsLoading(false)
    }
  }

  const deleteMission = async (id: string) => {
    try {
      setIsLoading(true)
      const { error } = await deleteTodo(id)
      
      if (error) {
        toast.error(error)
        return
      }

      setMissions(missions.filter(mission => mission.id !== id))
      toast.success('Mission terminated successfully')
    } catch {
      toast.error('Failed to terminate mission')
    } finally {
      setIsLoading(false)
    }
  }

  const completedCount = missions.filter(mission => mission.completed).length
  const totalCount = missions.length
  const criticalCount = missions.filter(mission => mission.priority === "critical" && !mission.completed).length

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
      {/* Custom Cyberpunk Font */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhani:wght@300;400;500;600;700&display=swap');
        
        .cyber-font {
          font-family: 'Orbitron', 'Courier New', monospace;
        }
        
        .cyber-text {
          font-family: 'Rajdhani', 'Arial', sans-serif;
        }
        
        .scan-lines::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(
            transparent 50%,
            rgba(0, 255, 255, 0.03) 50%
          );
          background-size: 100% 4px;
          pointer-events: none;
          animation: scan 2s linear infinite;
        }
        
        @keyframes scan {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }
        
        .glitch-effect {
          position: relative;
        }
        
        .glitch-effect::before,
        .glitch-effect::after {
          content: attr(data-text);
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }
        
        .glitch-effect::before {
          animation: glitch-1 0.5s infinite;
          color: #ff0040;
          z-index: -1;
        }
        
        .glitch-effect::after {
          animation: glitch-2 0.5s infinite;
          color: #00ffff;
          z-index: -2;
        }
        
        @keyframes glitch-1 {
          0%, 14%, 15%, 49%, 50%, 99%, 100% { transform: translate(0); }
          15%, 49% { transform: translate(-2px, 1px); }
        }
        
        @keyframes glitch-2 {
          0%, 20%, 21%, 62%, 63%, 99%, 100% { transform: translate(0); }
          21%, 62% { transform: translate(2px, -1px); }
        }
        
        .neon-glow {
          animation: neon-pulse 2s ease-in-out infinite alternate;
        }
        
        @keyframes neon-pulse {
          from { box-shadow: 0 0 5px currentColor, 0 0 10px currentColor, 0 0 15px currentColor; }
          to { box-shadow: 0 0 10px currentColor, 0 0 20px currentColor, 0 0 30px currentColor; }
        }
        
        .data-stream::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(0, 255, 255, 0.4),
            transparent
          );
          animation: data-flow 3s infinite;
        }
        
        @keyframes data-flow {
          0% { left: -100%; }
          100% { left: 100%; }
        }
        
        .hologram {
          background: linear-gradient(
            45deg,
            transparent 30%,
            rgba(0, 255, 255, 0.1) 50%,
            transparent 70%
          );
          background-size: 20px 20px;
          animation: hologram-shift 4s linear infinite;
        }
        
        @keyframes hologram-shift {
          0% { background-position: 0 0; }
          100% { background-position: 20px 20px; }
        }
      `}</style>

      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black p-2 sm:p-4 lg:p-8 relative overflow-hidden">
        {/* Enhanced Cyberpunk Grid Background */}
        <div className="absolute inset-0 opacity-20">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `
              linear-gradient(rgba(0,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,255,255,0.1) 1px, transparent 1px)
            `,
              backgroundSize: "30px 30px",
            }}
          />
        </div>

        {/* Animated Scan Lines */}
        <div className="scan-lines absolute inset-0 pointer-events-none" />

        {/* Enhanced Glowing Orbs */}
        <div className="absolute top-10 left-5 w-20 h-20 sm:w-32 sm:h-32 bg-cyan-500/30 rounded-full blur-xl animate-pulse" />
        <div className="absolute bottom-10 right-5 w-24 h-24 sm:w-40 sm:h-40 bg-purple-500/30 rounded-full blur-xl animate-pulse" />
        <div className="absolute top-1/2 left-1/4 w-16 h-16 sm:w-24 sm:h-24 bg-green-500/30 rounded-full blur-xl animate-pulse" />
        <div className="absolute top-1/3 right-1/3 w-12 h-12 sm:w-20 sm:h-20 bg-pink-500/30 rounded-full blur-xl animate-pulse" />

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

          {/* Enhanced Status Dashboard */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
            <Card className="border border-cyan-500/30 shadow-lg shadow-cyan-500/20 bg-gray-900/80 backdrop-blur-sm hover:shadow-cyan-500/40 transition-all duration-300 hover:scale-105 relative overflow-hidden data-stream">
              <CardContent className="p-4 sm:p-6 text-center hologram">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Crosshair className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" />
                  <span className="text-cyan-400 cyber-text text-xs sm:text-sm font-semibold">TOTAL MISSIONS</span>
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-white cyber-font">{totalCount}</div>
              </CardContent>
            </Card>

            <Card className="border border-green-500/30 shadow-lg shadow-green-500/20 bg-gray-900/80 backdrop-blur-sm hover:shadow-green-500/40 transition-all duration-300 hover:scale-105 relative overflow-hidden data-stream">
              <CardContent className="p-4 sm:p-6 text-center hologram">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
                  <span className="text-green-400 cyber-text text-xs sm:text-sm font-semibold">COMPLETED</span>
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-white cyber-font">{completedCount}</div>
              </CardContent>
            </Card>

            <Card className="border border-red-500/30 shadow-lg shadow-red-500/20 bg-gray-900/80 backdrop-blur-sm hover:shadow-red-500/40 transition-all duration-300 hover:scale-105 relative overflow-hidden data-stream">
              <CardContent className="p-4 sm:p-6 text-center hologram">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-red-400" />
                  <span className="text-red-400 cyber-text text-xs sm:text-sm font-semibold">CRITICAL</span>
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-white cyber-font">{criticalCount}</div>
              </CardContent>
            </Card>
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
                {/* Enhanced Priority and Due Date Selection */}
                <div className="grid grid-cols-1 gap-4">
                  {/* Priority Selection */}
                  <div className="space-y-3">
                    <span className="text-cyan-300 cyber-text text-sm font-semibold tracking-wider">
                      PRIORITY LEVEL:
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {(["low", "medium", "high", "critical"] as const).map((priority) => (
                        <Button
                          key={priority}
                          onClick={() => setSelectedPriority(priority)}
                          size="sm"
                          disabled={isLoading}
                          className={`cyber-text text-xs font-bold px-3 py-2 transition-all duration-300 hover:scale-105 ${
                            selectedPriority === priority
                              ? `bg-gradient-to-r ${priorityColors[priority]} text-white shadow-lg ${priorityGlow[priority]} neon-glow`
                              : "bg-gray-800 text-gray-400 hover:bg-gray-700 border border-gray-600 hover:border-gray-500"
                          }`}
                        >
                          {priority.toUpperCase()}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Due Date Selection */}
                  <div className="space-y-3">
                    <span className="text-cyan-300 cyber-text text-sm font-semibold tracking-wider">
                      MISSION DEADLINE:
                    </span>
                    <div className="relative">
                      <input
                        type="date"
                        value={selectedDueDate}
                        onChange={(e) => setSelectedDueDate(e.target.value)}
                        disabled={isLoading}
                        className="w-full h-10 sm:h-12 bg-gray-800/50 border-2 border-cyan-500/30 focus:border-cyan-400 text-cyan-300 cyber-text text-sm rounded-lg px-3 focus:outline-none transition-all duration-200 hover:shadow-cyan-500/20 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        min={new Date().toISOString().split("T")[0]}
                      />
                      {selectedDueDate && (
                        <Button
                          onClick={() => setSelectedDueDate("")}
                          size="sm"
                          disabled={isLoading}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 w-6 h-6 p-0 bg-red-600/20 hover:bg-red-600/40 text-red-400 rounded transition-all duration-200"
                        >
                          ×
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Enhanced Mission Input */}
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
                  <Button
                    onClick={addMission}
                    disabled={isLoading || !newMission.trim()}
                    className="h-12 sm:h-14 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 text-white cyber-text font-bold rounded-lg shadow-lg shadow-cyan-500/30 hover:shadow-xl transition-all duration-300 hover:scale-105 neon-glow disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 animate-spin" />
                    ) : (
                      <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    )}
                    {isLoading ? "DEPLOYING..." : "DEPLOY MISSION"}
                  </Button>
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
                  className={`border transition-all duration-300 hover:shadow-xl hover:scale-[1.02] bg-gray-900/80 backdrop-blur-sm relative overflow-hidden ${
                    mission.completed
                      ? "border-gray-600/30 shadow-gray-500/10"
                      : `border-${mission.priority === "critical" ? "red" : mission.priority === "high" ? "orange" : mission.priority === "medium" ? "yellow" : "green"}-500/30 shadow-lg ${priorityGlow[mission.priority]}`
                  }`}
                >
                  <div className="absolute inset-0 hologram opacity-30" />
                  <div className="absolute inset-0 data-stream" />
                  <CardContent className="p-3 sm:p-4 relative z-10">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                      {/* Priority and Color Indicators */}
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <div
                          className={`px-2 py-1 rounded text-xs cyber-text font-bold bg-gradient-to-r ${priorityColors[mission.priority]} text-white shadow-lg neon-glow`}
                        >
                          {mission.priority.toUpperCase()}
                        </div>
                        <div
                          className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-gradient-to-r ${mission.color} flex-shrink-0 shadow-lg neon-glow`}
                        />
                      </div>

                      {/* Mission content */}
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-base sm:text-lg cyber-text font-medium transition-all duration-200 ${
                            mission.completed ? "line-through text-gray-500" : "text-white"
                          }`}
                        >
                          {mission.title}
                        </p>
                        {mission.due_date && (
                          <div className="flex flex-wrap items-center gap-2 mt-2">
                            <span className="text-xs cyber-text text-gray-400 font-semibold">DEADLINE:</span>
                            <span
                              className={`text-xs cyber-text px-2 py-1 rounded font-bold ${
                                new Date(mission.due_date) < new Date() && !mission.completed
                                  ? "bg-red-900/50 text-red-400 border border-red-500/30 neon-glow"
                                  : "bg-gray-800/50 text-cyan-400 border border-cyan-500/30"
                              }`}
                            >
                              {new Date(mission.due_date).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </span>
                            {new Date(mission.due_date) < new Date() && !mission.completed && (
                              <span className="text-xs cyber-text text-red-400 animate-pulse font-bold">OVERDUE</span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="flex gap-2 flex-shrink-0 justify-end sm:justify-start">
                        <Button
                          onClick={() => toggleMission(mission.id)}
                          size="sm"
                          variant="ghost"
                          disabled={isLoading}
                          className={`w-10 h-10 rounded-full transition-all duration-300 border hover:scale-110 ${
                            mission.completed
                              ? "bg-green-900/50 text-green-400 hover:bg-green-800/50 border-green-500/30 shadow-green-500/20 neon-glow"
                              : "bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 border-gray-600/30"
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          {isLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Check className="w-4 h-4" />
                          )}
                        </Button>
                        <Button
                          onClick={() => deleteMission(mission.id)}
                          size="sm"
                          variant="ghost"
                          disabled={isLoading}
                          className="w-10 h-10 rounded-full bg-red-900/50 text-red-400 hover:bg-red-800/50 border border-red-500/30 shadow-red-500/20 transition-all duration-300 hover:scale-110 neon-glow disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Enhanced Mission Progress */}
          {totalCount > 0 && (
            <Card className="mt-6 sm:mt-8 border border-cyan-500/30 shadow-lg shadow-cyan-500/20 bg-gray-900/80 backdrop-blur-sm hover:shadow-cyan-500/40 transition-all duration-300 relative overflow-hidden">
              <div className="absolute inset-0 hologram opacity-20" />
              <CardContent className="p-4 sm:p-6 relative z-10">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-cyan-400 cyber-font font-bold tracking-wider text-sm sm:text-base">
                    MISSION COMPLETED!
                  </span>
                  <span className="text-cyan-400 cyber-font font-bold text-sm sm:text-base">
                    {Math.round((completedCount / totalCount) * 100)}% COMPLETE
                  </span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-3 sm:h-4 border border-gray-700">
                  <div
                    className="bg-gradient-to-r from-cyan-400 via-green-400 to-purple-400 h-3 sm:h-4 rounded-full transition-all duration-500 ease-out shadow-lg shadow-cyan-500/30 neon-glow"
                    style={{ width: `${(completedCount / totalCount) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between mt-2 text-xs cyber-text text-gray-400">
                  <span>OPERATIONAL STATUS</span>
                  <span>
                    {completedCount}/{totalCount} OBJECTIVES
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Enhanced Footer */}
          <div className="mt-6 sm:mt-8 text-center">
            <div className="w-full h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent mb-4 neon-glow" />
            <p className="text-gray-500 cyber-text text-xs sm:text-sm font-semibold">
              CLASSIFIED // TACTICAL OPERATIONS DIVISION
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
