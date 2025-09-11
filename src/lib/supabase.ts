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
      user_profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          credits: number
          subscription_status: 'free' | 'monthly' | 'annual' | null
          subscription_end_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          credits?: number
          subscription_status?: 'free' | 'monthly' | 'annual' | null
          subscription_end_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          credits?: number
          subscription_status?: 'free' | 'monthly' | 'annual' | null
          subscription_end_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      essay_generations: {
        Row: {
          id: string
          user_id: string
          school_name: string
          essay_prompt: string
          questions_answered: Record<string, any>
          generated_essay: string
          credits_used: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          school_name: string
          essay_prompt: string
          questions_answered: Record<string, any>
          generated_essay: string
          credits_used: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          school_name?: string
          essay_prompt?: string
          questions_answered?: Record<string, any>
          generated_essay?: string
          credits_used?: number
          created_at?: string
        }
      }
    }
  }
}