export type Priority = 'low' | 'medium' | 'high' | 'critical'

export interface Todo {
  id: string
  created_at: string
  title: string
  completed: boolean
  user_id: string
  priority: Priority
  due_date?: string
  description?: string
}

export interface CreateTodoInput {
  title: string
  priority?: Priority
  due_date?: string
  description?: string
}

export interface UpdateTodoInput {
  title?: string
  completed?: boolean
  priority?: Priority
  due_date?: string
  description?: string
}

export interface TodoResponse {
  data: Todo[] | null
  error: Error | null
}

export interface SingleTodoResponse {
  data: Todo | null
  error: Error | null
} 