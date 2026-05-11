export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Enums: {
      task_priority: "low" | "medium" | "high" | "urgent";
      task_status:
        | "new_request"
        | "under_validation"
        | "documents_pending"
        | "awaiting_rm_response"
        | "ready_for_processing"
        | "submitted_to_amc"
        | "in_progress"
        | "completed"
        | "rejected"
        | "on_hold"
        | "escalated"
        | "closed";
      user_role: "admin" | "rm" | "mid_office";
    };
    Tables: {
      amcs: {
        Row: {
          id: string;
          name: string;
        };
        Insert: {
          id?: string;
          name: string;
        };
        Update: {
          id?: string;
          name?: string;
        };
        Relationships: [];
      };
      channel_partners: {
        Row: {
          arn_number: string | null;
          city: string | null;
          created_at: string;
          id: string;
          partner_name: string;
          rm_id: string | null;
        };
        Insert: {
          arn_number?: string | null;
          city?: string | null;
          created_at?: string;
          id?: string;
          partner_name: string;
          rm_id?: string | null;
        };
        Update: {
          arn_number?: string | null;
          city?: string | null;
          created_at?: string;
          id?: string;
          partner_name?: string;
          rm_id?: string | null;
        };
        Relationships: [];
      };
      clients: {
        Row: {
          client_name: string;
          created_at: string;
          email: string | null;
          id: string;
          kyc_status: string | null;
          mobile: string | null;
          pan_number: string | null;
        };
        Insert: {
          client_name: string;
          created_at?: string;
          email?: string | null;
          id?: string;
          kyc_status?: string | null;
          mobile?: string | null;
          pan_number?: string | null;
        };
        Update: {
          client_name?: string;
          created_at?: string;
          email?: string | null;
          id?: string;
          kyc_status?: string | null;
          mobile?: string | null;
          pan_number?: string | null;
        };
        Relationships: [];
      };
      task_activity_logs: {
        Row: {
          action_type: string;
          changed_by: string | null;
          created_at: string;
          field_name: string | null;
          id: string;
          new_value: string | null;
          old_value: string | null;
          task_id: string;
        };
        Insert: {
          action_type: string;
          changed_by?: string | null;
          created_at?: string;
          field_name?: string | null;
          id?: string;
          new_value?: string | null;
          old_value?: string | null;
          task_id: string;
        };
        Update: {
          action_type?: string;
          changed_by?: string | null;
          created_at?: string;
          field_name?: string | null;
          id?: string;
          new_value?: string | null;
          old_value?: string | null;
          task_id?: string;
        };
        Relationships: [];
      };
      task_attachments: {
        Row: {
          created_at: string;
          file_name: string;
          file_url: string;
          id: string;
          task_id: string;
          uploaded_by: string | null;
        };
        Insert: {
          created_at?: string;
          file_name: string;
          file_url: string;
          id?: string;
          task_id: string;
          uploaded_by?: string | null;
        };
        Update: {
          created_at?: string;
          file_name?: string;
          file_url?: string;
          id?: string;
          task_id?: string;
          uploaded_by?: string | null;
        };
        Relationships: [];
      };
      task_comments: {
        Row: {
          comment: string;
          created_at: string;
          id: string;
          task_id: string;
          user_id: string | null;
        };
        Insert: {
          comment: string;
          created_at?: string;
          id?: string;
          task_id: string;
          user_id?: string | null;
        };
        Update: {
          comment?: string;
          created_at?: string;
          id?: string;
          task_id?: string;
          user_id?: string | null;
        };
        Relationships: [];
      };
      task_types: {
        Row: {
          default_sla_hours: number;
          id: string;
          name: string;
        };
        Insert: {
          default_sla_hours?: number;
          id?: string;
          name: string;
        };
        Update: {
          default_sla_hours?: number;
          id?: string;
          name?: string;
        };
        Relationships: [];
      };
      tasks: {
        Row: {
          amc_id: string | null;
          assigned_to: string | null;
          channel_partner_id: string | null;
          client_id: string | null;
          completed_at: string | null;
          created_at: string;
          created_by: string | null;
          description: string | null;
          due_date: string | null;
          id: string;
          priority: Database["public"]["Enums"]["task_priority"];
          rm_id: string | null;
          sla_due_at: string | null;
          status: Database["public"]["Enums"]["task_status"];
          task_type_id: string | null;
          ticket_number: string;
          updated_at: string;
        };
        Insert: {
          amc_id?: string | null;
          assigned_to?: string | null;
          channel_partner_id?: string | null;
          client_id?: string | null;
          completed_at?: string | null;
          created_at?: string;
          created_by?: string | null;
          description?: string | null;
          due_date?: string | null;
          id?: string;
          priority?: Database["public"]["Enums"]["task_priority"];
          rm_id?: string | null;
          sla_due_at?: string | null;
          status?: Database["public"]["Enums"]["task_status"];
          task_type_id?: string | null;
          ticket_number?: string;
          updated_at?: string;
        };
        Update: {
          amc_id?: string | null;
          assigned_to?: string | null;
          channel_partner_id?: string | null;
          client_id?: string | null;
          completed_at?: string | null;
          created_at?: string;
          created_by?: string | null;
          description?: string | null;
          due_date?: string | null;
          id?: string;
          priority?: Database["public"]["Enums"]["task_priority"];
          rm_id?: string | null;
          sla_due_at?: string | null;
          status?: Database["public"]["Enums"]["task_status"];
          task_type_id?: string | null;
          ticket_number?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      users: {
        Row: {
          created_at: string;
          email: string;
          full_name: string;
          id: string;
          is_active: boolean;
          password: string;
          role: Database["public"]["Enums"]["user_role"];
          team: string | null;
        };
        Insert: {
          created_at?: string;
          email: string;
          full_name: string;
          id: string;
          is_active?: boolean;
          password: string;
          role: Database["public"]["Enums"]["user_role"];
          team?: string | null;
        };
        Update: {
          created_at?: string;
          email?: string;
          full_name?: string;
          id?: string;
          is_active?: boolean;
          password?: string;
          role?: Database["public"]["Enums"]["user_role"];
          team?: string | null;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
