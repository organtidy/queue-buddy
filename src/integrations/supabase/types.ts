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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      admin_credentials: {
        Row: {
          admin_pin: string
          id: string
          secret_phrase: string
        }
        Insert: {
          admin_pin?: string
          id?: string
          secret_phrase?: string
        }
        Update: {
          admin_pin?: string
          id?: string
          secret_phrase?: string
        }
        Relationships: []
      }
      pin_attempts: {
        Row: {
          attempt_count: number
          attempt_key: string
          last_attempt: string
          locked_until: string | null
        }
        Insert: {
          attempt_count?: number
          attempt_key: string
          last_attempt?: string
          locked_until?: string | null
        }
        Update: {
          attempt_count?: number
          attempt_key?: string
          last_attempt?: string
          locked_until?: string | null
        }
        Relationships: []
      }
      professionals: {
        Row: {
          clients_queue: number | null
          color: string
          created_at: string
          current_client_time: string | null
          id: string
          is_active: boolean
          name: string
          next_clients: Json | null
        }
        Insert: {
          clients_queue?: number | null
          color?: string
          created_at?: string
          current_client_time?: string | null
          id?: string
          is_active?: boolean
          name: string
          next_clients?: Json | null
        }
        Update: {
          clients_queue?: number | null
          color?: string
          created_at?: string
          current_client_time?: string | null
          id?: string
          is_active?: boolean
          name?: string
          next_clients?: Json | null
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          created_at: string
          endpoint: string
          id: string
          keys_auth: string
          keys_p256dh: string
        }
        Insert: {
          created_at?: string
          endpoint: string
          id?: string
          keys_auth: string
          keys_p256dh: string
        }
        Update: {
          created_at?: string
          endpoint?: string
          id?: string
          keys_auth?: string
          keys_p256dh?: string
        }
        Relationships: []
      }
      queue_state: {
        Row: {
          avg_wait_time: number
          current_count: number
          cut_durations: Json | null
          id: string
          is_open: boolean
          last_updated: string
          manual_wait_time: number | null
          message_green: string | null
          message_red: string | null
          message_yellow: string | null
        }
        Insert: {
          avg_wait_time?: number
          current_count?: number
          cut_durations?: Json | null
          id?: string
          is_open?: boolean
          last_updated?: string
          manual_wait_time?: number | null
          message_green?: string | null
          message_red?: string | null
          message_yellow?: string | null
        }
        Update: {
          avg_wait_time?: number
          current_count?: number
          cut_durations?: Json | null
          id?: string
          is_open?: boolean
          last_updated?: string
          manual_wait_time?: number | null
          message_green?: string | null
          message_red?: string | null
          message_yellow?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      _verify_pin: { Args: { pin_input: string }; Returns: boolean }
      admin_update_professional: {
        Args: { pin_input: string; prof_id: string; updates: Json }
        Returns: boolean
      }
      admin_update_queue: {
        Args: { pin_input: string; updates: Json }
        Returns: boolean
      }
      reset_admin_pin: {
        Args: { new_pin: string; phrase_input: string }
        Returns: boolean
      }
      update_admin_pin_authenticated: {
        Args: { current_pin: string; new_pin: string }
        Returns: boolean
      }
      update_secret_phrase_authenticated: {
        Args: { current_pin: string; new_phrase: string }
        Returns: boolean
      }
      validate_admin_pin: { Args: { pin_input: string }; Returns: Json }
      validate_secret_phrase: {
        Args: { phrase_input: string }
        Returns: boolean
      }
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
