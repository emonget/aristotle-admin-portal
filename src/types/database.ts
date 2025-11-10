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
      workflow_executions: {
        Row: {
          id: string
          workflow_type: number
          parent_exec_ref: string | null
          timestamp: string
          metadata: Json | null
        }
        Insert: {
          id: string
          workflow_type: number
          parent_exec_ref?: string | null
          timestamp: string
          metadata?: Json | null
        }
        Update: {
          id?: string
          workflow_type?: number
          parent_exec_ref?: string | null
          timestamp?: string
          metadata?: Json | null
        }
      }
      movies: {
        Row: {
          ems_id: string
          title: string
          data: Json
          fetched_at: string
          updated_at: string
          workflow_exec_ref: string | null
        }
        Insert: {
          ems_id: string
          title: string
          data: Json
          fetched_at?: string
          updated_at?: string
          workflow_exec_ref?: string | null
        }
        Update: {
          ems_id?: string
          title?: string
          data?: Json
          fetched_at?: string
          updated_at?: string
          workflow_exec_ref?: string | null
        }
      }
      reviews: {
        Row: {
          review_id: string
          movie_id: string
          data: Json
          fetched_at: string
          workflow_exec_ref: string | null
        }
        Insert: {
          review_id: string
          movie_id: string
          data: Json
          fetched_at?: string
          workflow_exec_ref?: string | null
        }
        Update: {
          review_id?: string
          movie_id?: string
          data?: Json
          fetched_at?: string
          workflow_exec_ref?: string | null
        }
      }
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