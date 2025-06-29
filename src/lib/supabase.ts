import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      resumes: {
        Row: {
          id: string
          user_id: string
          filename: string
          file_path: string
          file_size: number
          file_type: string
          content: string
          embedding: number[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          filename: string
          file_path: string
          file_size: number
          file_type: string
          content: string
          embedding?: number[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          filename?: string
          file_path?: string
          file_size?: number
          file_type?: string
          content?: string
          embedding?: number[] | null
          created_at?: string
          updated_at?: string
        }
      }
      user_storage: {
        Row: {
          id: string
          user_id: string
          total_storage_used: number
          total_files: number
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          total_storage_used?: number
          total_files?: number
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          total_storage_used?: number
          total_files?: number
          updated_at?: string
        }
      }
      chat_messages: {
        Row: {
          id: string
          user_id: string
          message_id: string
          role: 'user' | 'assistant'
          content: string
          resumes: any | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          message_id: string
          role: 'user' | 'assistant'
          content: string
          resumes?: any | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          message_id?: string
          role?: 'user' | 'assistant'
          content?: string
          resumes?: any | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}