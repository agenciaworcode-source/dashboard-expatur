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
      bitrix_companies: {
        Row: {
          bitrix_id: number
          company_type: string | null
          created_at: string | null
          id: string
          raw_data: Json | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          bitrix_id: number
          company_type?: string | null
          created_at?: string | null
          id?: string
          raw_data?: Json | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          bitrix_id?: number
          company_type?: string | null
          created_at?: string | null
          id?: string
          raw_data?: Json | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      bitrix_contacts: {
        Row: {
          bitrix_id: number
          created_at: string | null
          email: string[] | null
          first_name: string | null
          id: string
          last_name: string | null
          phone: string[] | null
          raw_data: Json | null
          updated_at: string | null
        }
        Insert: {
          bitrix_id: number
          created_at?: string | null
          email?: string[] | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string[] | null
          raw_data?: Json | null
          updated_at?: string | null
        }
        Update: {
          bitrix_id?: number
          created_at?: string | null
          email?: string[] | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string[] | null
          raw_data?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      bitrix_stages: {
        Row: {
          bitrix_id: string
          color: string | null
          created_at: string | null
          entity_id: string
          id: string
          name: string
          sort: number | null
          updated_at: string | null
        }
        Insert: {
          bitrix_id: string
          color?: string | null
          created_at?: string | null
          entity_id: string
          id?: string
          name: string
          sort?: number | null
          updated_at?: string | null
        }
        Update: {
          bitrix_id?: string
          color?: string | null
          created_at?: string | null
          entity_id?: string
          id?: string
          name?: string
          sort?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      bitrix_sync_logs: {
        Row: {
          action: string
          created_at: string | null
          entities_synced: number | null
          error_message: string | null
          id: string
          status: string
        }
        Insert: {
          action: string
          created_at?: string | null
          entities_synced?: number | null
          error_message?: string | null
          id?: string
          status: string
        }
        Update: {
          action?: string
          created_at?: string | null
          entities_synced?: number | null
          error_message?: string | null
          id?: string
          status?: string
        }
        Relationships: []
      }
      deals: {
        Row: {
          airline_iata: string | null
          amount: number
          amount_brl: number
          bitrix_id: number
          contact_id: number | null
          cpm_brl: number | null
          created_at: string | null
          currency: string
          deal_date: string | null
          departure: string | null
          departure_date: string | null
          destination: string | null
          exchange_rate: number | null
          fees_brl: number | null
          horario_sp_ida: string | null
          horario_sp_volta: string | null
          id: string
          issuing_partner: string | null
          num_passengers: number | null
          numero_nf: number | null
          pax_name: string | null
          pnr: string | null
          stage: string
          subtotal_brl: number | null
          synced_at: string | null
          title: string | null
          valor_nota: number | null
          volume_x1000: number | null
        }
        Insert: {
          airline_iata?: string | null
          amount?: number
          amount_brl?: number
          bitrix_id: number
          contact_id?: number | null
          cpm_brl?: number | null
          created_at?: string | null
          currency: string
          deal_date?: string | null
          departure?: string | null
          departure_date?: string | null
          destination?: string | null
          exchange_rate?: number | null
          fees_brl?: number | null
          horario_sp_ida?: string | null
          horario_sp_volta?: string | null
          id?: string
          issuing_partner?: string | null
          num_passengers?: number | null
          numero_nf?: number | null
          pax_name?: string | null
          pnr?: string | null
          stage: string
          subtotal_brl?: number | null
          synced_at?: string | null
          title?: string | null
          valor_nota?: number | null
          volume_x1000?: number | null
        }
        Update: {
          airline_iata?: string | null
          amount?: number
          amount_brl?: number
          bitrix_id?: number
          contact_id?: number | null
          cpm_brl?: number | null
          created_at?: string | null
          currency?: string
          deal_date?: string | null
          departure?: string | null
          departure_date?: string | null
          destination?: string | null
          exchange_rate?: number | null
          fees_brl?: number | null
          horario_sp_ida?: string | null
          horario_sp_volta?: string | null
          id?: string
          issuing_partner?: string | null
          num_passengers?: number | null
          numero_nf?: number | null
          pax_name?: string | null
          pnr?: string | null
          stage?: string
          subtotal_brl?: number | null
          synced_at?: string | null
          title?: string | null
          valor_nota?: number | null
          volume_x1000?: number | null
        }
        Relationships: []
      }
      expenses: {
        Row: {
          amount: number
          category: string
          created_at: string
          date: string
          description: string
          id: number
        }
        Insert: {
          amount: number
          category: string
          created_at?: string
          date?: string
          description: string
          id?: number
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          date?: string
          description?: string
          id?: number
        }
        Relationships: []
      }
      leads: {
        Row: {
          cidade: string | null
          contato: string | null
          created_at: string | null
          nome: string
          user_id: string
        }
        Insert: {
          cidade?: string | null
          contato?: string | null
          created_at?: string | null
          nome: string
          user_id: string
        }
        Update: {
          cidade?: string | null
          contato?: string | null
          created_at?: string | null
          nome?: string
          user_id?: string
        }
        Relationships: []
      }
      monthly_metrics: {
        Row: {
          active_pipeline: number | null
          conversion_rate: number | null
          created_at: string | null
          id: string
          period: string
          total_deals: number | null
          total_revenue: number | null
          won_deals: number | null
        }
        Insert: {
          active_pipeline?: number | null
          conversion_rate?: number | null
          created_at?: string | null
          id?: string
          period: string
          total_deals?: number | null
          total_revenue?: number | null
          won_deals?: number | null
        }
        Update: {
          active_pipeline?: number | null
          conversion_rate?: number | null
          created_at?: string | null
          id?: string
          period?: string
          total_deals?: number | null
          total_revenue?: number | null
          won_deals?: number | null
        }
        Relationships: []
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

