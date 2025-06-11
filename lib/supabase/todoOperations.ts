import { supabase } from '../supabaseClient.ts/supabaseClient'
import { Todo, CreateTodoInput, UpdateTodoInput } from '../types/todo'
import { PostgrestError } from '@supabase/supabase-js'

interface OperationResult<T> {
  data: T | null
  error: string | null
}

function handleError(error: unknown): string {
  if (error instanceof PostgrestError) {
    return `Database error: ${error.message}`
  }
  if (error instanceof Error) {
    return `Error: ${error.message}`
  }
  return 'An unexpected error occurred'
}

// Test function to verify connection and table access
export async function testConnection(): Promise<OperationResult<boolean>> {
  try {
    // Test basic connection and table access
    const { data, error } = await supabase
      .from('todos')
      .select('count')
      .limit(1)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') {
        return { 
          data: null, 
          error: 'Table "todos" does not exist. Please run the schema.sql file in your Supabase dashboard.' 
        }
      }
      return { 
        data: null, 
        error: `Connection test failed: ${error.message} (Code: ${error.code})` 
      }
    }

    return { data: true, error: null }
  } catch (error) {
    return { 
      data: null, 
      error: `Connection test failed: ${handleError(error)}` 
    }
  }
}

export async function fetchTodos(): Promise<OperationResult<Todo[]>> {
  try {
    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    return { data: null, error: handleError(error) }
  }
}

export async function createTodo(todo: CreateTodoInput): Promise<OperationResult<Todo>> {
  try {
    // Validate required fields
    if (!todo.title) {
      return { data: null, error: 'Title is required' }
    }

    // Ensure priority is set
    const todoWithDefaults = {
      ...todo,
      priority: todo.priority || 'medium',
      completed: false
    }

    // First, try to insert the todo
    const { data, error: insertError } = await supabase
      .from('todos')
      .insert(todoWithDefaults)
      .select()
      .single()

    if (insertError) {
      return { 
        data: null, 
        error: `Failed to insert todo: ${insertError.message}` 
      }
    }

    if (!data) {
      return { 
        data: null, 
        error: 'No data returned after insert' 
      }
    }

    return { data, error: null }
  } catch (error) {
    return { 
      data: null, 
      error: `Failed to create todo: ${handleError(error)}` 
    }
  }
}

export async function updateTodo(id: string, updates: UpdateTodoInput): Promise<OperationResult<Todo>> {
  try {
    const { data, error } = await supabase
      .from('todos')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    return { data: null, error: handleError(error) }
  }
}

export async function deleteTodo(id: string): Promise<OperationResult<null>> {
  try {
    const { error } = await supabase
      .from('todos')
      .delete()
      .eq('id', id)

    if (error) throw error
    return { data: null, error: null }
  } catch (error) {
    return { data: null, error: handleError(error) }
  }
}

export async function toggleTodoComplete(id: string, completed: boolean): Promise<OperationResult<Todo>> {
  try {
    const { data, error } = await supabase
      .from('todos')
      .update({ completed })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    return { data: null, error: handleError(error) }
  }
} 