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
      contact_submissions: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          subject: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          subject: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          subject?: string
        }
        Relationships: []
      }
      content: {
        Row: {
          category_id: string | null
          content_type: string
          created_at: string
          description: string | null
          duration: string | null
          early_access_until: string | null
          featured: boolean | null
          id: string
          image_url: string | null
          is_trending_new: boolean | null
          popular: boolean | null
          rating: string | null
          title: string
          trending: boolean | null
          updated_at: string
          year: string | null
        }
        Insert: {
          category_id?: string | null
          content_type: string
          created_at?: string
          description?: string | null
          duration?: string | null
          early_access_until?: string | null
          featured?: boolean | null
          id?: string
          image_url?: string | null
          is_trending_new?: boolean | null
          popular?: boolean | null
          rating?: string | null
          title: string
          trending?: boolean | null
          updated_at?: string
          year?: string | null
        }
        Update: {
          category_id?: string | null
          content_type?: string
          created_at?: string
          description?: string | null
          duration?: string | null
          early_access_until?: string | null
          featured?: boolean | null
          id?: string
          image_url?: string | null
          is_trending_new?: boolean | null
          popular?: boolean | null
          rating?: string | null
          title?: string
          trending?: boolean | null
          updated_at?: string
          year?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "content_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "content_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      content_categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      download_requests: {
        Row: {
          completed_at: string | null
          content_title: string
          content_type: string
          created_at: string
          download_url: string | null
          episode_number: number | null
          error_message: string | null
          file_size: string | null
          id: string
          nkiri_url: string | null
          quality: string | null
          search_query: string | null
          season_number: number | null
          status: string
          user_id: string
          year: string | null
        }
        Insert: {
          completed_at?: string | null
          content_title: string
          content_type: string
          created_at?: string
          download_url?: string | null
          episode_number?: number | null
          error_message?: string | null
          file_size?: string | null
          id?: string
          nkiri_url?: string | null
          quality?: string | null
          search_query?: string | null
          season_number?: number | null
          status?: string
          user_id: string
          year?: string | null
        }
        Update: {
          completed_at?: string | null
          content_title?: string
          content_type?: string
          created_at?: string
          download_url?: string | null
          episode_number?: number | null
          error_message?: string | null
          file_size?: string | null
          id?: string
          nkiri_url?: string | null
          quality?: string | null
          search_query?: string | null
          season_number?: number | null
          status?: string
          user_id?: string
          year?: string | null
        }
        Relationships: []
      }
      download_search_cache: {
        Row: {
          created_at: string
          failure_count: number | null
          id: string
          last_verified: string | null
          nkiri_url: string | null
          search_query: string
          success_count: number | null
        }
        Insert: {
          created_at?: string
          failure_count?: number | null
          id?: string
          last_verified?: string | null
          nkiri_url?: string | null
          search_query: string
          success_count?: number | null
        }
        Update: {
          created_at?: string
          failure_count?: number | null
          id?: string
          last_verified?: string | null
          nkiri_url?: string | null
          search_query?: string
          success_count?: number | null
        }
        Relationships: []
      }
      episodes: {
        Row: {
          content_id: string | null
          created_at: string
          description: string | null
          duration: string | null
          episode_number: number | null
          id: string
          release_date: string | null
          season_number: number | null
          thumbnail_url: string | null
          title: string
          video_url: string | null
        }
        Insert: {
          content_id?: string | null
          created_at?: string
          description?: string | null
          duration?: string | null
          episode_number?: number | null
          id?: string
          release_date?: string | null
          season_number?: number | null
          thumbnail_url?: string | null
          title: string
          video_url?: string | null
        }
        Update: {
          content_id?: string | null
          created_at?: string
          description?: string | null
          duration?: string | null
          episode_number?: number | null
          id?: string
          release_date?: string | null
          season_number?: number | null
          thumbnail_url?: string | null
          title?: string
          video_url?: string | null
        }
        Relationships: []
      }
      premium_codes: {
        Row: {
          code: string
          created_at: string | null
          created_by: string | null
          current_uses: number | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          max_uses: number | null
          notes: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          created_by?: string | null
          current_uses?: number | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          notes?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          created_by?: string | null
          current_uses?: number | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "premium_codes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_plans: {
        Row: {
          created_at: string | null
          features: Json | null
          id: string
          max_downloads: number
          max_streams: number
          name: string
          plan_id: string
          price_naira: number
          priority_level: number | null
          unlimited: boolean | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          features?: Json | null
          id?: string
          max_downloads: number
          max_streams: number
          name: string
          plan_id: string
          price_naira: number
          priority_level?: number | null
          unlimited?: boolean | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          features?: Json | null
          id?: string
          max_downloads?: number
          max_streams?: number
          name?: string
          plan_id?: string
          price_naira?: number
          priority_level?: number | null
          unlimited?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_favorites: {
        Row: {
          content_id: string | null
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          content_id?: string | null
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          content_id?: string | null
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          id: string
          priority_level: number | null
          role: string | null
          subscription_expires_at: string | null
          subscription_tier: string | null
          timezone: string | null
          updated_at: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          id: string
          priority_level?: number | null
          role?: string | null
          subscription_expires_at?: string | null
          subscription_tier?: string | null
          timezone?: string | null
          updated_at?: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          priority_level?: number | null
          role?: string | null
          subscription_expires_at?: string | null
          subscription_tier?: string | null
          timezone?: string | null
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          granted_at: string | null
          granted_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_usage: {
        Row: {
          created_at: string | null
          downloads_today: number | null
          id: string
          last_reset: string | null
          updated_at: string | null
          user_id: string
          watched_today: number | null
        }
        Insert: {
          created_at?: string | null
          downloads_today?: number | null
          id?: string
          last_reset?: string | null
          updated_at?: string | null
          user_id: string
          watched_today?: number | null
        }
        Update: {
          created_at?: string | null
          downloads_today?: number | null
          id?: string
          last_reset?: string | null
          updated_at?: string | null
          user_id?: string
          watched_today?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "user_usage_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_watch_history: {
        Row: {
          completed: boolean | null
          content_id: string | null
          created_at: string
          episode_id: string | null
          id: string
          last_watched: string
          user_id: string
          watch_position: number | null
        }
        Insert: {
          completed?: boolean | null
          content_id?: string | null
          created_at?: string
          episode_id?: string | null
          id?: string
          last_watched?: string
          user_id: string
          watch_position?: number | null
        }
        Update: {
          completed?: boolean | null
          content_id?: string | null
          created_at?: string
          episode_id?: string | null
          id?: string
          last_watched?: string
          user_id?: string
          watch_position?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "user_watch_history_episode_id_fkey"
            columns: ["episode_id"]
            isOneToOne: false
            referencedRelation: "episodes"
            referencedColumns: ["id"]
          },
        ]
      }
      watch_sessions: {
        Row: {
          content_duration: number | null
          content_id: string
          content_title: string | null
          created_at: string | null
          credit_deducted: boolean | null
          id: string
          session_end: string | null
          session_start: string | null
          total_watched_time: number | null
          user_id: string
          watch_events: Json | null
        }
        Insert: {
          content_duration?: number | null
          content_id: string
          content_title?: string | null
          created_at?: string | null
          credit_deducted?: boolean | null
          id?: string
          session_end?: string | null
          session_start?: string | null
          total_watched_time?: number | null
          user_id: string
          watch_events?: Json | null
        }
        Update: {
          content_duration?: number | null
          content_id?: string
          content_title?: string | null
          created_at?: string | null
          credit_deducted?: boolean | null
          id?: string
          session_end?: string | null
          session_start?: string | null
          total_watched_time?: number | null
          user_id?: string
          watch_events?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "watch_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
      validate_premium_code: {
        Args: {
          input_code: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "free" | "premium" | "admin"
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
    Enums: {
      app_role: ["free", "premium", "admin"],
    },
  },
} as const
