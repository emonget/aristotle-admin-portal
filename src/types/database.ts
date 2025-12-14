export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      batches: {
        Row: {
          id: string
          metadata: Json | null
          parent_exec_ref: string | null
          timestamp: string
          workflow_type: number
        }
        Insert: {
          id: string
          metadata?: Json | null
          parent_exec_ref?: string | null
          timestamp: string
          workflow_type: number
        }
        Update: {
          id?: string
          metadata?: Json | null
          parent_exec_ref?: string | null
          timestamp?: string
          workflow_type?: number
        }
        Relationships: [
          {
            foreignKeyName: "workflow_executions_parent_exec_ref_fkey"
            columns: ["parent_exec_ref"]
            isOneToOne: false
            referencedRelation: "batches"
            referencedColumns: ["id"]
          },
        ]
      }
      digests: {
        Row: {
          created_at: string | null
          movie_id: string
          summary: string | null
          topic: string
        }
        Insert: {
          created_at?: string | null
          movie_id: string
          summary?: string | null
          topic: string
        }
        Update: {
          created_at?: string | null
          movie_id?: string
          summary?: string | null
          topic?: string
        }
        Relationships: [
          {
            foreignKeyName: "movie_digests_movie_id_fkey"
            columns: ["movie_id"]
            isOneToOne: false
            referencedRelation: "movies"
            referencedColumns: ["ems_id"]
          },
        ]
      }
      incidents: {
        Row: {
          batch_id: string | null
          created_at: string | null
          data: Json | null
          error: Json | null
          id: number
          updated_at: string | null
        }
        Insert: {
          batch_id?: string | null
          created_at?: string | null
          data?: Json | null
          error?: Json | null
          id?: number
          updated_at?: string | null
        }
        Update: {
          batch_id?: string | null
          created_at?: string | null
          data?: Json | null
          error?: Json | null
          id?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      movies: {
        Row: {
          data: Json
          ems_id: string
          fetched_at: string | null
          title: string
          updated_at: string | null
          workflow_exec_ref: string | null
        }
        Insert: {
          data: Json
          ems_id: string
          fetched_at?: string | null
          title: string
          updated_at?: string | null
          workflow_exec_ref?: string | null
        }
        Update: {
          data?: Json
          ems_id?: string
          fetched_at?: string | null
          title?: string
          updated_at?: string | null
          workflow_exec_ref?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "movies_workflow_exec_ref_fkey"
            columns: ["workflow_exec_ref"]
            isOneToOne: false
            referencedRelation: "batches"
            referencedColumns: ["id"]
          },
        ]
      }
      review_fragments: {
        Row: {
          created_at: string | null
          extract: string | null
          movie_id: string
          reason: string | null
          review_id: string
          score: number | null
          sentiment: string | null
          topic: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          extract?: string | null
          movie_id: string
          reason?: string | null
          review_id: string
          score?: number | null
          sentiment?: string | null
          topic: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          extract?: string | null
          movie_id?: string
          reason?: string | null
          review_id?: string
          score?: number | null
          sentiment?: string | null
          topic?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "review_fragments_movie_id_fkey"
            columns: ["movie_id"]
            isOneToOne: false
            referencedRelation: "movies"
            referencedColumns: ["ems_id"]
          },
          {
            foreignKeyName: "review_fragments_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "reviews"
            referencedColumns: ["review_id"]
          },
        ]
      }
      reviews: {
        Row: {
          created_at: string | null
          data: Json
          movie_id: string
          processing_flag: string | null
          review_id: string
          updated_at: string | null
          workflow_exec_ref: string | null
        }
        Insert: {
          created_at?: string | null
          data: Json
          movie_id: string
          processing_flag?: string | null
          review_id: string
          updated_at?: string | null
          workflow_exec_ref?: string | null
        }
        Update: {
          created_at?: string | null
          data?: Json
          movie_id?: string
          processing_flag?: string | null
          review_id?: string
          updated_at?: string | null
          workflow_exec_ref?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_movie"
            columns: ["movie_id"]
            isOneToOne: false
            referencedRelation: "movies"
            referencedColumns: ["ems_id"]
          },
          {
            foreignKeyName: "reviews_movie_id_fkey"
            columns: ["movie_id"]
            isOneToOne: false
            referencedRelation: "movies"
            referencedColumns: ["ems_id"]
          },
          {
            foreignKeyName: "reviews_workflow_exec_ref_fkey"
            columns: ["workflow_exec_ref"]
            isOneToOne: false
            referencedRelation: "batches"
            referencedColumns: ["id"]
          },
        ]
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
