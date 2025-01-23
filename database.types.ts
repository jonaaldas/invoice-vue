export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      business_profiles: {
        Row: {
          address: string | null
          created_at: string
          default_currency: string | null
          deleted_at: string | null
          email: string | null
          id: string
          logo_url: string | null
          name: string | null
          phone: number | null
          profile_id: string
          tax_number: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string
          default_currency?: string | null
          deleted_at?: string | null
          email?: string | null
          id?: string
          logo_url?: string | null
          name?: string | null
          phone?: number | null
          profile_id: string
          tax_number?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string
          default_currency?: string | null
          deleted_at?: string | null
          email?: string | null
          id?: string
          logo_url?: string | null
          name?: string | null
          phone?: number | null
          profile_id?: string
          tax_number?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "business_profiles_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          account_id: string
          address: string | null
          business_id: string | null
          city: string | null
          country: string | null
          created_at?: string
          currency: string
          deleted_at?: string | null
          email: string
          id?: string
          name: string
          next_invoice_number: number
          phone: string | null
          postal_code: string | null
          state: string | null
          street_address: string | null
          tax_type: string
          updated_at?: string
        }
        Insert: {
          account_id: string
          address?: string | null
          business_id?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          currency?: string
          deleted_at?: string | null
          email: string
          id: string
          name: string
          next_invoice_number?: number
          phone?: string | null
          postal_code?: string | null
          state?: string | null
          street_address?: string | null
          tax_type?: string
          updated_at?: string
        }
        Update: {
          account_id?: string
          address?: string | null
          business_id?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          currency?: string
          deleted_at?: string | null
          email?: string
          id?: string
          name?: string
          next_invoice_number?: number
          phone?: string | null
          postal_code?: string | null
          state?: string | null
          street_address?: string | null
          tax_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "clients_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clients_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_items: {
        Row: {
          account_id: string
          amount: number
          business_id: string
          created_at: string
          deleted_at: string | null
          description: string
          id: string
          invoice_id: string
          quantity: number
          unit_price: number
          updated_at: string
        }
        Insert: {
          account_id: string
          amount: number
          business_id: string
          created_at?: string
          deleted_at?: string | null
          description: string
          id: string
          invoice_id: string
          quantity?: number
          unit_price: number
          updated_at?: string
        }
        Update: {
          account_id?: string
          amount?: number
          business_id?: string
          created_at?: string
          deleted_at?: string | null
          description?: string
          id?: string
          invoice_id?: string
          quantity?: number
          unit_price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoice_items_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_items_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          account_id: string
          business_id: string
          client_id: string
          created_at: string
          deleted_at: string | null
          due_date: string
          email_error: string | null
          email_status: Database["public"]["Enums"]["email_status_enum"]
          id: string
          invoice_date: string
          invoice_number: number
          paid_at: string | null
          recurring_config_id: string | null
          scheduled_send_date: string | null
          sent_at: string | null
          status: Database["public"]["Enums"]["invoice_status_enum"]
          subtotal: number
          tax_amount: number | null
          total: number
          updated_at: string
        }
        Insert: {
          account_id: string
          business_id: string
          client_id: string
          created_at?: string
          deleted_at?: string | null
          due_date: string
          email_error?: string | null
          email_status?: Database["public"]["Enums"]["email_status_enum"]
          id: string
          invoice_date: string
          invoice_number: number
          paid_at?: string | null
          recurring_config_id?: string | null
          scheduled_send_date?: string | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["invoice_status_enum"]
          subtotal?: number
          tax_amount?: number | null
          total?: number
          updated_at?: string
        }
        Update: {
          account_id?: string
          business_id?: string
          client_id?: string
          created_at?: string
          deleted_at?: string | null
          due_date?: string
          email_error?: string | null
          email_status?: Database["public"]["Enums"]["email_status_enum"]
          id?: string
          invoice_date?: string
          invoice_number?: number
          paid_at?: string | null
          recurring_config_id?: string | null
          scheduled_send_date?: string | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["invoice_status_enum"]
          subtotal?: number
          tax_amount?: number | null
          total?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_recurring_config_id_fkey"
            columns: ["recurring_config_id"]
            isOneToOne: false
            referencedRelation: "recurring_configs"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string | null
          first_name: string | null
          id: string
          is_paid: boolean | null
          last_name: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          id: string
          is_paid?: boolean | null
          last_name?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          is_paid?: boolean | null
          last_name?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      recurring_configs: {
        Row: {
          account_id: string
          business_id: string
          client_id: string
          created_at: string
          deleted_at: string | null
          duration: Database["public"]["Enums"]["duration_enum"] | null
          email_body: string | null
          email_subject: string | null
          email_to: string | null
          frequency: Database["public"]["Enums"]["frequency_enum"] | null
          id: string
          last_generated_date: string | null
          next_send_date: string | null
          status: Database["public"]["Enums"]["status_enum"]
          updated_at: string
        }
        Insert: {
          account_id: string
          business_id: string
          client_id: string
          created_at?: string
          deleted_at?: string | null
          duration?: Database["public"]["Enums"]["duration_enum"] | null
          email_body?: string | null
          email_subject?: string | null
          email_to?: string | null
          frequency?: Database["public"]["Enums"]["frequency_enum"] | null
          id: string
          last_generated_date?: string | null
          next_send_date?: string | null
          status?: Database["public"]["Enums"]["status_enum"]
          updated_at?: string
        }
        Update: {
          account_id?: string
          business_id?: string
          client_id?: string
          created_at?: string
          deleted_at?: string | null
          duration?: Database["public"]["Enums"]["duration_enum"] | null
          email_body?: string | null
          email_subject?: string | null
          email_to?: string | null
          frequency?: Database["public"]["Enums"]["frequency_enum"] | null
          id?: string
          last_generated_date?: string | null
          next_send_date?: string | null
          status?: Database["public"]["Enums"]["status_enum"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "recurring_configs_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recurring_configs_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recurring_configs_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
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
      duration_enum:
        | "3-months"
        | "6-months"
        | "1-year"
        | "indefinite"
        | "save"
        | "one-time"
      email_status_enum: "pending" | "sent" | "failed" | "saved"
      frequency_enum:
        | "weekly"
        | "monthly"
        | "quarterly"
        | "yearly"
        | "save"
        | "one-time"
      invoice_status_enum:
        | "scheduled"
        | "sent"
        | "paid"
        | "overdue"
        | "cancelled"
        | "saved"
      status_enum: "active" | "paused" | "completed" | "save"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
