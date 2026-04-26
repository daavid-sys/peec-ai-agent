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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      action_openings: {
        Row: {
          action_type: string
          competitor: string | null
          created_at: string
          id: string
          impact_score: number | null
          prompt_id: string
          qfo_id: string | null
          rationale: string | null
          recommended_engagement: string | null
          risk_level: string | null
          source_id: string | null
          status: string | null
          title: string
        }
        Insert: {
          action_type: string
          competitor?: string | null
          created_at?: string
          id?: string
          impact_score?: number | null
          prompt_id: string
          qfo_id?: string | null
          rationale?: string | null
          recommended_engagement?: string | null
          risk_level?: string | null
          source_id?: string | null
          status?: string | null
          title: string
        }
        Update: {
          action_type?: string
          competitor?: string | null
          created_at?: string
          id?: string
          impact_score?: number | null
          prompt_id?: string
          qfo_id?: string | null
          rationale?: string | null
          recommended_engagement?: string | null
          risk_level?: string | null
          source_id?: string | null
          status?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "action_openings_prompt_id_fkey"
            columns: ["prompt_id"]
            isOneToOne: false
            referencedRelation: "prompts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "action_openings_qfo_id_fkey"
            columns: ["qfo_id"]
            isOneToOne: false
            referencedRelation: "prompt_qfos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "action_openings_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "prompt_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      competitor_mentions: {
        Row: {
          competitor: string
          context: string | null
          created_at: string
          id: string
          prompt_id: string
          quote: string
          source_id: string
        }
        Insert: {
          competitor: string
          context?: string | null
          created_at?: string
          id?: string
          prompt_id: string
          quote: string
          source_id: string
        }
        Update: {
          competitor?: string
          context?: string | null
          created_at?: string
          id?: string
          prompt_id?: string
          quote?: string
          source_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "competitor_mentions_prompt_id_fkey"
            columns: ["prompt_id"]
            isOneToOne: false
            referencedRelation: "prompts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "competitor_mentions_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "prompt_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      prompt_brand_metrics: {
        Row: {
          brand_id: string
          brand_name: string
          created_at: string
          id: string
          is_own: boolean
          mention_count: number
          position: number | null
          prompt_id: string
          sentiment: number | null
          share_of_voice: number
          updated_at: string
          visibility: number
        }
        Insert: {
          brand_id: string
          brand_name: string
          created_at?: string
          id?: string
          is_own?: boolean
          mention_count?: number
          position?: number | null
          prompt_id: string
          sentiment?: number | null
          share_of_voice?: number
          updated_at?: string
          visibility?: number
        }
        Update: {
          brand_id?: string
          brand_name?: string
          created_at?: string
          id?: string
          is_own?: boolean
          mention_count?: number
          position?: number | null
          prompt_id?: string
          sentiment?: number | null
          share_of_voice?: number
          updated_at?: string
          visibility?: number
        }
        Relationships: [
          {
            foreignKeyName: "prompt_brand_metrics_prompt_id_fkey"
            columns: ["prompt_id"]
            isOneToOne: false
            referencedRelation: "prompts"
            referencedColumns: ["id"]
          },
        ]
      }
      prompt_qfos: {
        Row: {
          chat_id: string | null
          created_at: string
          id: string
          model_id: string | null
          occurrence_count: number | null
          prompt_id: string
          query_text: string
        }
        Insert: {
          chat_id?: string | null
          created_at?: string
          id?: string
          model_id?: string | null
          occurrence_count?: number | null
          prompt_id: string
          query_text: string
        }
        Update: {
          chat_id?: string | null
          created_at?: string
          id?: string
          model_id?: string | null
          occurrence_count?: number | null
          prompt_id?: string
          query_text?: string
        }
        Relationships: [
          {
            foreignKeyName: "prompt_qfos_prompt_id_fkey"
            columns: ["prompt_id"]
            isOneToOne: false
            referencedRelation: "prompts"
            referencedColumns: ["id"]
          },
        ]
      }
      prompt_sources: {
        Row: {
          citation_count: number | null
          citation_rate: number | null
          classification: string | null
          competitor_brands: string[] | null
          created_at: string
          domain: string | null
          gap_score: number | null
          id: string
          own_brand_present: boolean | null
          prompt_id: string
          retrieval_count: number | null
          title: string | null
          url: string
        }
        Insert: {
          citation_count?: number | null
          citation_rate?: number | null
          classification?: string | null
          competitor_brands?: string[] | null
          created_at?: string
          domain?: string | null
          gap_score?: number | null
          id?: string
          own_brand_present?: boolean | null
          prompt_id: string
          retrieval_count?: number | null
          title?: string | null
          url: string
        }
        Update: {
          citation_count?: number | null
          citation_rate?: number | null
          classification?: string | null
          competitor_brands?: string[] | null
          created_at?: string
          domain?: string | null
          gap_score?: number | null
          id?: string
          own_brand_present?: boolean | null
          prompt_id?: string
          retrieval_count?: number | null
          title?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "prompt_sources_prompt_id_fkey"
            columns: ["prompt_id"]
            isOneToOne: false
            referencedRelation: "prompts"
            referencedColumns: ["id"]
          },
        ]
      }
      prompts: {
        Row: {
          competitor_breakdown: Json | null
          created_at: string
          hidden_questions: Json | null
          id: string
          opportunity_score: number | null
          own_visibility: number | null
          project_id: string
          text: string
          top_competitor: string | null
          top_competitor_visibility: number | null
          topic: string | null
          updated_at: string
          visibility_gap: number | null
          volume: string | null
        }
        Insert: {
          competitor_breakdown?: Json | null
          created_at?: string
          hidden_questions?: Json | null
          id: string
          opportunity_score?: number | null
          own_visibility?: number | null
          project_id: string
          text: string
          top_competitor?: string | null
          top_competitor_visibility?: number | null
          topic?: string | null
          updated_at?: string
          visibility_gap?: number | null
          volume?: string | null
        }
        Update: {
          competitor_breakdown?: Json | null
          created_at?: string
          hidden_questions?: Json | null
          id?: string
          opportunity_score?: number | null
          own_visibility?: number | null
          project_id?: string
          text?: string
          top_competitor?: string | null
          top_competitor_visibility?: number | null
          topic?: string | null
          updated_at?: string
          visibility_gap?: number | null
          volume?: string | null
        }
        Relationships: []
      }
      source_scrapes: {
        Row: {
          created_at: string
          error: string | null
          id: string
          raw_content: string | null
          scraped_at: string | null
          source_id: string
          status: string
          summary: string | null
        }
        Insert: {
          created_at?: string
          error?: string | null
          id?: string
          raw_content?: string | null
          scraped_at?: string | null
          source_id: string
          status?: string
          summary?: string | null
        }
        Update: {
          created_at?: string
          error?: string | null
          id?: string
          raw_content?: string | null
          scraped_at?: string | null
          source_id?: string
          status?: string
          summary?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "source_scrapes_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: true
            referencedRelation: "prompt_sources"
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
