import { createClient } from '@supabase/supabase-js'

// Configuración de Supabase
// Necesitarás crear un proyecto en https://supabase.com
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://taybquizhxriczwvrjsu.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRheWJxdWl6aHhyaWN6d3ZyanN1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1MzE0MTAsImV4cCI6MjA2MzEwNzQxMH0.n9eSF-OkJFiPwe8XzmAWJoS_Ggk60eiLonGnwp0mbyQ'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Configuración específica para Capacitor
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // Importante para evitar problemas de redirect
    flowType: 'pkce', // Usar PKCE para mejor seguridad en móvil
  },
})

// Tipos para TypeScript
export type Database = {
  public: {
    Tables: {
      transactions: {
        Row: {
          id: string
          user_id: string
          amount: number
          type: 'expense' | 'income'
          category: string
          description: string
          date: string
          account_id?: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          amount: number
          type: 'expense' | 'income'
          category: string
          description: string
          date: string
          account_id?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          amount?: number
          type?: 'expense' | 'income'
          category?: string
          description?: string
          date?: string
          account_id?: string
          created_at?: string
        }
      }
      budgets: {
        Row: {
          id: string
          user_id: string
          name: string
          amount: number
          spent: number
          category: string
          period: 'monthly' | 'yearly'
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          amount: number
          spent?: number
          category: string
          period: 'monthly' | 'yearly'
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          amount?: number
          spent?: number
          category?: string
          period?: 'monthly' | 'yearly'
          created_at?: string
        }
      }
      accounts: {
        Row: {
          id: string
          user_id: string
          name: string
          type: 'checking' | 'savings' | 'credit' | 'cash'
          balance: number
          currency: string
          color: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          type: 'checking' | 'savings' | 'credit' | 'cash'
          balance: number
          currency: string
          color: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          type?: 'checking' | 'savings' | 'credit' | 'cash'
          balance?: number
          currency?: string
          color?: string
          created_at?: string
        }
      }
    }
  }
}

