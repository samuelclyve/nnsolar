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
      client_installments: {
        Row: {
          amount: number
          created_at: string | null
          due_date: string
          id: string
          installation_id: string
          installment_number: number
          paid_date: string | null
          payment_proof_url: string | null
          status: string | null
          workspace_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          due_date: string
          id?: string
          installation_id: string
          installment_number: number
          paid_date?: string | null
          payment_proof_url?: string | null
          status?: string | null
          workspace_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          due_date?: string
          id?: string
          installation_id?: string
          installment_number?: number
          paid_date?: string | null
          payment_proof_url?: string | null
          status?: string | null
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_installments_installation_id_fkey"
            columns: ["installation_id"]
            isOneToOne: false
            referencedRelation: "installations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_installments_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          address: string | null
          avatar_url: string | null
          city: string | null
          cpf: string | null
          created_at: string
          email: string | null
          full_name: string
          id: string
          is_active: boolean | null
          notes: string | null
          phone: string | null
          updated_at: string
          user_id: string
          workspace_id: string | null
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          city?: string | null
          cpf?: string | null
          created_at?: string
          email?: string | null
          full_name: string
          id?: string
          is_active?: boolean | null
          notes?: string | null
          phone?: string | null
          updated_at?: string
          user_id: string
          workspace_id?: string | null
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          city?: string | null
          cpf?: string | null
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          is_active?: boolean | null
          notes?: string | null
          phone?: string | null
          updated_at?: string
          user_id?: string
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clients_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          category: string
          client_id: string | null
          created_at: string
          description: string | null
          file_size: number | null
          file_type: string | null
          file_url: string
          id: string
          installation_id: string | null
          name: string
          tags: string[] | null
          updated_at: string
          uploaded_by: string | null
          workspace_id: string | null
        }
        Insert: {
          category?: string
          client_id?: string | null
          created_at?: string
          description?: string | null
          file_size?: number | null
          file_type?: string | null
          file_url: string
          id?: string
          installation_id?: string | null
          name: string
          tags?: string[] | null
          updated_at?: string
          uploaded_by?: string | null
          workspace_id?: string | null
        }
        Update: {
          category?: string
          client_id?: string | null
          created_at?: string
          description?: string | null
          file_size?: number | null
          file_type?: string | null
          file_url?: string
          id?: string
          installation_id?: string | null
          name?: string
          tags?: string[] | null
          updated_at?: string
          uploaded_by?: string | null
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_installation_id_fkey"
            columns: ["installation_id"]
            isOneToOne: false
            referencedRelation: "installations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      hero_slides: {
        Row: {
          button_link: string | null
          button_text: string | null
          created_at: string | null
          id: string
          image_url: string
          is_active: boolean | null
          sort_order: number | null
          subtitle: string | null
          title: string
          workspace_id: string | null
        }
        Insert: {
          button_link?: string | null
          button_text?: string | null
          created_at?: string | null
          id?: string
          image_url: string
          is_active?: boolean | null
          sort_order?: number | null
          subtitle?: string | null
          title: string
          workspace_id?: string | null
        }
        Update: {
          button_link?: string | null
          button_text?: string | null
          created_at?: string | null
          id?: string
          image_url?: string
          is_active?: boolean | null
          sort_order?: number | null
          subtitle?: string | null
          title?: string
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hero_slides_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      installation_documents: {
        Row: {
          created_at: string | null
          document_name: string
          document_type: string | null
          file_url: string
          id: string
          installation_id: string
          uploaded_by: string | null
          workspace_id: string | null
        }
        Insert: {
          created_at?: string | null
          document_name: string
          document_type?: string | null
          file_url: string
          id?: string
          installation_id: string
          uploaded_by?: string | null
          workspace_id?: string | null
        }
        Update: {
          created_at?: string | null
          document_name?: string
          document_type?: string | null
          file_url?: string
          id?: string
          installation_id?: string
          uploaded_by?: string | null
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "installation_documents_installation_id_fkey"
            columns: ["installation_id"]
            isOneToOne: false
            referencedRelation: "installations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "installation_documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "installation_documents_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      installation_stages: {
        Row: {
          completed_at: string | null
          created_at: string | null
          id: string
          installation_id: string
          notes: string | null
          stage_name: string
          stage_order: number
          started_at: string | null
          status: string | null
          workspace_id: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          installation_id: string
          notes?: string | null
          stage_name: string
          stage_order: number
          started_at?: string | null
          status?: string | null
          workspace_id?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          installation_id?: string
          notes?: string | null
          stage_name?: string
          stage_order?: number
          started_at?: string | null
          status?: string | null
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "installation_stages_installation_id_fkey"
            columns: ["installation_id"]
            isOneToOne: false
            referencedRelation: "installations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "installation_stages_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      installations: {
        Row: {
          actual_end: string | null
          actual_start: string | null
          address: string | null
          assigned_technician: string | null
          city: string | null
          client_email: string | null
          client_name: string
          client_phone: string | null
          client_user_id: string | null
          created_at: string | null
          estimated_end: string | null
          estimated_start: string | null
          id: string
          lead_id: string | null
          notes: string | null
          panel_count: number | null
          power_kwp: number | null
          status: string | null
          updated_at: string | null
          workspace_id: string | null
        }
        Insert: {
          actual_end?: string | null
          actual_start?: string | null
          address?: string | null
          assigned_technician?: string | null
          city?: string | null
          client_email?: string | null
          client_name: string
          client_phone?: string | null
          client_user_id?: string | null
          created_at?: string | null
          estimated_end?: string | null
          estimated_start?: string | null
          id?: string
          lead_id?: string | null
          notes?: string | null
          panel_count?: number | null
          power_kwp?: number | null
          status?: string | null
          updated_at?: string | null
          workspace_id?: string | null
        }
        Update: {
          actual_end?: string | null
          actual_start?: string | null
          address?: string | null
          assigned_technician?: string | null
          city?: string | null
          client_email?: string | null
          client_name?: string
          client_phone?: string | null
          client_user_id?: string | null
          created_at?: string | null
          estimated_end?: string | null
          estimated_start?: string | null
          id?: string
          lead_id?: string | null
          notes?: string | null
          panel_count?: number | null
          power_kwp?: number | null
          status?: string | null
          updated_at?: string | null
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "installations_assigned_technician_fkey"
            columns: ["assigned_technician"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "installations_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "installations_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          assigned_to: string | null
          city: string | null
          created_at: string | null
          email: string | null
          id: string
          monthly_consumption: number | null
          name: string
          notes: string | null
          phone: string
          status: string | null
          updated_at: string | null
          workspace_id: string | null
        }
        Insert: {
          assigned_to?: string | null
          city?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          monthly_consumption?: number | null
          name: string
          notes?: string | null
          phone: string
          status?: string | null
          updated_at?: string | null
          workspace_id?: string | null
        }
        Update: {
          assigned_to?: string | null
          city?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          monthly_consumption?: number | null
          name?: string
          notes?: string | null
          phone?: string
          status?: string | null
          updated_at?: string | null
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_logs: {
        Row: {
          id: string
          installation_id: string
          message_content: string | null
          message_type: string
          sent_at: string
          sent_by: string | null
          workspace_id: string | null
        }
        Insert: {
          id?: string
          installation_id: string
          message_content?: string | null
          message_type: string
          sent_at?: string
          sent_by?: string | null
          workspace_id?: string | null
        }
        Update: {
          id?: string
          installation_id?: string
          message_content?: string | null
          message_type?: string
          sent_at?: string
          sent_by?: string | null
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notification_logs_installation_id_fkey"
            columns: ["installation_id"]
            isOneToOne: false
            referencedRelation: "installations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_logs_sent_by_fkey"
            columns: ["sent_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_logs_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_history: {
        Row: {
          amount: number
          cakto_transaction_id: string
          created_at: string | null
          currency: string
          id: string
          payment_method: string | null
          status: string
          user_id: string
          webhook_data: Json | null
          workspace_id: string | null
        }
        Insert: {
          amount: number
          cakto_transaction_id: string
          created_at?: string | null
          currency?: string
          id?: string
          payment_method?: string | null
          status: string
          user_id: string
          webhook_data?: Json | null
          workspace_id?: string | null
        }
        Update: {
          amount?: number
          cakto_transaction_id?: string
          created_at?: string | null
          currency?: string
          id?: string
          payment_method?: string | null
          status?: string
          user_id?: string
          webhook_data?: Json | null
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_history_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          city: string | null
          created_at: string | null
          full_name: string | null
          id: string
          phone: string | null
          role: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          city?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          role?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          city?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          role?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          created_at: string | null
          id: string
          setting_key: string
          setting_type: string | null
          setting_value: string | null
          updated_at: string | null
          workspace_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          setting_key: string
          setting_type?: string | null
          setting_value?: string | null
          updated_at?: string | null
          workspace_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          setting_key?: string
          setting_type?: string | null
          setting_value?: string | null
          updated_at?: string | null
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "site_settings_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          amount: number
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          id: string
          plan_type: string
          status: string
          workspace_id: string
        }
        Insert: {
          amount?: number
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_type?: string
          status?: string
          workspace_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_type?: string
          status?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      testimonials: {
        Row: {
          client_location: string | null
          client_name: string
          client_photo_url: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          message: string
          rating: number | null
          sort_order: number | null
          workspace_id: string | null
        }
        Insert: {
          client_location?: string | null
          client_name: string
          client_photo_url?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          message: string
          rating?: number | null
          sort_order?: number | null
          workspace_id?: string | null
        }
        Update: {
          client_location?: string | null
          client_name?: string
          client_photo_url?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          message?: string
          rating?: number | null
          sort_order?: number | null
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "testimonials_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      workspace_members: {
        Row: {
          created_at: string | null
          id: string
          role: string
          user_id: string
          workspace_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: string
          user_id: string
          workspace_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: string
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_members_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspaces: {
        Row: {
          address: string | null
          cep: string | null
          city: string | null
          cnpj: string | null
          created_at: string | null
          description: string | null
          email: string | null
          id: string
          instagram: string | null
          logo_url: string | null
          name: string
          owner_id: string
          phone: string | null
          plan: string
          slug: string
          state: string | null
          subscription_status: string
          trial_ends_at: string | null
          updated_at: string | null
          website: string | null
          whatsapp: string | null
        }
        Insert: {
          address?: string | null
          cep?: string | null
          city?: string | null
          cnpj?: string | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          id?: string
          instagram?: string | null
          logo_url?: string | null
          name: string
          owner_id: string
          phone?: string | null
          plan?: string
          slug: string
          state?: string | null
          subscription_status?: string
          trial_ends_at?: string | null
          updated_at?: string | null
          website?: string | null
          whatsapp?: string | null
        }
        Update: {
          address?: string | null
          cep?: string | null
          city?: string | null
          cnpj?: string | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          id?: string
          instagram?: string | null
          logo_url?: string | null
          name?: string
          owner_id?: string
          phone?: string | null
          plan?: string
          slug?: string
          state?: string | null
          subscription_status?: string
          trial_ends_at?: string | null
          updated_at?: string | null
          website?: string | null
          whatsapp?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_workspace_for_user: {
        Args: {
          _user_id: string
          _workspace_name: string
          _workspace_slug: string
        }
        Returns: string
      }
      get_user_workspace_ids: { Args: { _user_id: string }; Returns: string[] }
      has_role: { Args: { _role: string; _user_id: string }; Returns: boolean }
      has_workspace_role: {
        Args: { _role: string; _user_id: string; _workspace_id: string }
        Returns: boolean
      }
      is_super_admin: { Args: { _user_id: string }; Returns: boolean }
      is_workspace_member: {
        Args: { _user_id: string; _workspace_id: string }
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
