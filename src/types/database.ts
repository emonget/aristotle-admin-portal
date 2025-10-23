// Generic database types for Supabase
// These can be replaced with generated types from Supabase CLI

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// Generic record type for any database table
export interface DatabaseRecord {
  id: number | string
  created_at?: string
  updated_at?: string
  [key: string]: any
}

// Database schema types (extend as needed)
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name?: string
          role?: string
          created_at: string
          updated_at?: string
        }
        Insert: {
          id?: string
          email: string
          name?: string
          role?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          role?: string
          created_at?: string
          updated_at?: string
        }
      }
      // Add more table definitions as needed
      [key: string]: {
        Row: DatabaseRecord
        Insert: Record<string, any>
        Update: Record<string, any>
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}