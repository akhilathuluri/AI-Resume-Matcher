import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
    storageKey: `sb-${new URL(supabaseUrl).hostname.replace('.', '-')}-auth-token`,
    flowType: 'pkce'
  }
})

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
      communications: {
        Row: {
          id: string
          user_id: string
          title: string
          message: string
          communication_type: 'email' | 'sms' | 'note' | 'bulk_update'
          status: 'draft' | 'sent' | 'delivered' | 'failed'
          total_recipients: number
          successful_deliveries: number
          failed_deliveries: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          message: string
          communication_type: 'email' | 'sms' | 'note' | 'bulk_update'
          status?: 'draft' | 'sent' | 'delivered' | 'failed'
          total_recipients?: number
          successful_deliveries?: number
          failed_deliveries?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          message?: string
          communication_type?: 'email' | 'sms' | 'note' | 'bulk_update'
          status?: 'draft' | 'sent' | 'delivered' | 'failed'
          total_recipients?: number
          successful_deliveries?: number
          failed_deliveries?: number
          created_at?: string
          updated_at?: string
        }
      }
      communication_recipients: {
        Row: {
          id: string
          communication_id: string
          resume_id: string
          user_id: string
          delivery_status: 'pending' | 'sent' | 'delivered' | 'failed'
          delivered_at: string | null
          error_message: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          communication_id: string
          resume_id: string
          user_id: string
          delivery_status?: 'pending' | 'sent' | 'delivered' | 'failed'
          delivered_at?: string | null
          error_message?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          communication_id?: string
          resume_id?: string
          user_id?: string
          delivery_status?: 'pending' | 'sent' | 'delivered' | 'failed'
          delivered_at?: string | null
          error_message?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      user_activities: {
        Row: {
          id: string
          user_id: string
          activity_type: 'mass_export' | 'bulk_communication' | 'bulk_delete' | 'data_cleanup'
          description: string
          items_count: number
          metadata: any | null
          status: 'pending' | 'in_progress' | 'completed' | 'failed'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          activity_type: 'mass_export' | 'bulk_communication' | 'bulk_delete' | 'data_cleanup'
          description: string
          items_count?: number
          metadata?: any | null
          status?: 'pending' | 'in_progress' | 'completed' | 'failed'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          activity_type?: 'mass_export' | 'bulk_communication' | 'bulk_delete' | 'data_cleanup'
          description?: string
          items_count?: number
          metadata?: any | null
          status?: 'pending' | 'in_progress' | 'completed' | 'failed'
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
