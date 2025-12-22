export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "local-schema"
  }
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          full_name: string | null
          avatar_url: string | null
          billing_address: Json | null
          payment_method: Json | null
          username: string | null
          display_name: string | null
          personal_title: string | null
          first_name: string | null
          middle_name: string | null
          last_name: string | null
          email: string | null
          phone_country_code: string | null
          phone_number: string | null
          personal_apt_suite: string | null
          personal_street_address_1: string | null
          personal_street_address_2: string | null
          personal_city: string | null
          personal_state: string | null
          personal_postal_code: string | null
          personal_country: string | null
          bio: string | null
          education: Json | null
          work_experience: Json | null
          preferences: Json | null
          business_position: string | null
          business_company: string | null
          business_apt_suite: string | null
          business_street_address_1: string | null
          business_street_address_2: string | null
          business_city: string | null
          business_state: string | null
          business_postal_code: string | null
          business_country: string | null
          account_type: "super_admin" | "admin" | "user" | null
          profile_completed: boolean | null
          onboarding_completed: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          full_name?: string | null
          avatar_url?: string | null
          billing_address?: Json | null
          payment_method?: Json | null
          username?: string | null
          display_name?: string | null
          personal_title?: string | null
          first_name?: string | null
          middle_name?: string | null
          last_name?: string | null
          email?: string | null
          phone_country_code?: string | null
          phone_number?: string | null
          personal_apt_suite?: string | null
          personal_street_address_1?: string | null
          personal_street_address_2?: string | null
          personal_city?: string | null
          personal_state?: string | null
          personal_postal_code?: string | null
          personal_country?: string | null
          bio?: string | null
          education?: Json | null
          work_experience?: Json | null
          preferences?: Json | null
          business_position?: string | null
          business_company?: string | null
          business_apt_suite?: string | null
          business_street_address_1?: string | null
          business_street_address_2?: string | null
          business_city?: string | null
          business_state?: string | null
          business_postal_code?: string | null
          business_country?: string | null
          account_type?: "super_admin" | "admin" | "user" | null
          profile_completed?: boolean | null
          onboarding_completed?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          full_name?: string | null
          avatar_url?: string | null
          billing_address?: Json | null
          payment_method?: Json | null
          username?: string | null
          display_name?: string | null
          personal_title?: string | null
          first_name?: string | null
          middle_name?: string | null
          last_name?: string | null
          email?: string | null
          phone_country_code?: string | null
          phone_number?: string | null
          personal_apt_suite?: string | null
          personal_street_address_1?: string | null
          personal_street_address_2?: string | null
          personal_city?: string | null
          personal_state?: string | null
          personal_postal_code?: string | null
          personal_country?: string | null
          bio?: string | null
          education?: Json | null
          work_experience?: Json | null
          preferences?: Json | null
          business_position?: string | null
          business_company?: string | null
          business_apt_suite?: string | null
          business_street_address_1?: string | null
          business_street_address_2?: string | null
          business_city?: string | null
          business_state?: string | null
          business_postal_code?: string | null
          business_country?: string | null
          account_type?: "super_admin" | "admin" | "user" | null
          profile_completed?: boolean | null
          onboarding_completed?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      organizations: {
        Row: {
          id: string
          name: string
          owner_id: string
          created_at: string | null
          is_personal: boolean | null
          org_type: "personal" | "business" | "family" | "education" | "other" | null
          slug: string | null
          description: string | null
          avatar_url: string | null
          settings: Json | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          owner_id: string
          created_at?: string | null
          is_personal?: boolean | null
          org_type?: "personal" | "business" | "family" | "education" | "other" | null
          slug?: string | null
          description?: string | null
          avatar_url?: string | null
          settings?: Json | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          owner_id?: string
          created_at?: string | null
          is_personal?: boolean | null
          org_type?: "personal" | "business" | "family" | "education" | "other" | null
          slug?: string | null
          description?: string | null
          avatar_url?: string | null
          settings?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      organization_members: {
        Row: {
          org_id: string
          user_id: string
          role: "owner" | "admin" | "editor" | "member" | "viewer"
          created_at: string | null
        }
        Insert: {
          org_id: string
          user_id: string
          role: "owner" | "admin" | "editor" | "member" | "viewer"
          created_at?: string | null
        }
        Update: {
          org_id?: string
          user_id?: string
          role?: "owner" | "admin" | "editor" | "member" | "viewer"
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_org_id_fkey"
            columns: ["org_id"]
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_members_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      invites: {
        Row: {
          id: string
          org_id: string
          email: string
          role: "admin" | "editor" | "viewer"
          token: string
          status: "pending" | "accepted" | "expired"
          created_by: string
          created_at: string | null
          expires_at: string | null
          invite_type: "email" | "link" | null
          expires_single_use: boolean | null
        }
        Insert: {
          id?: string
          org_id: string
          email: string
          role: "admin" | "editor" | "viewer"
          token: string
          status?: "pending" | "accepted" | "expired"
          created_by: string
          created_at?: string | null
          expires_at?: string | null
          invite_type?: "email" | "link" | null
          expires_single_use?: boolean | null
        }
        Update: {
          id?: string
          org_id?: string
          email?: string
          role?: "admin" | "editor" | "viewer"
          token?: string
          status?: "pending" | "accepted" | "expired"
          created_by?: string
          created_at?: string | null
          expires_at?: string | null
          invite_type?: "email" | "link" | null
          expires_single_use?: boolean | null
        }
        Relationships: []
      }
      billing_customers: {
        Row: {
          org_id: string
          stripe_customer_id: string | null
          billing_email: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          org_id: string
          stripe_customer_id?: string | null
          billing_email?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          org_id?: string
          stripe_customer_id?: string | null
          billing_email?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      billing_invoices: {
        Row: {
          id: string
          org_id: string
          stripe_invoice_id: string
          stripe_customer_id: string | null
          amount_paid: number
          amount_due: number
          currency: string
          status: "draft" | "open" | "paid" | "void" | "uncollectible"
          hosted_invoice_url: string | null
          invoice_pdf: string | null
          period_start: string
          period_end: string
          paid_at: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          org_id: string
          stripe_invoice_id: string
          stripe_customer_id?: string | null
          amount_paid: number
          amount_due: number
          currency?: string
          status?: "draft" | "open" | "paid" | "void" | "uncollectible"
          hosted_invoice_url?: string | null
          invoice_pdf?: string | null
          period_start: string
          period_end: string
          paid_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          org_id?: string
          stripe_invoice_id?: string
          stripe_customer_id?: string | null
          amount_paid?: number
          amount_due?: number
          currency?: string
          status?: "draft" | "open" | "paid" | "void" | "uncollectible"
          hosted_invoice_url?: string | null
          invoice_pdf?: string | null
          period_start?: string
          period_end?: string
          paid_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      org_subscriptions: {
        Row: {
          org_id: string
          plan_name: "free" | "pro" | "business" | "enterprise"
          status:
            | "active"
            | "trialing"
            | "canceled"
            | "past_due"
            | "unpaid"
            | "incomplete"
            | "incomplete_expired"
            | "paused"
          billing_interval: "monthly" | "annual" | null
          seats: number | null
          stripe_price_id: string | null
          current_period_start: string | null
          current_period_end: string | null
          trial_start: string | null
          trial_end: string | null
          stripe_sub_id: string | null
          stripe_subscription_id: string | null
          cancel_at_period_end: boolean | null
          canceled_at: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          org_id: string
          plan_name?: "free" | "pro" | "business" | "enterprise"
          status?:
            | "active"
            | "trialing"
            | "canceled"
            | "past_due"
            | "unpaid"
            | "incomplete"
            | "incomplete_expired"
            | "paused"
          billing_interval?: "monthly" | "annual" | null
          seats?: number | null
          stripe_price_id?: string | null
          current_period_start?: string | null
          current_period_end?: string | null
          trial_start?: string | null
          trial_end?: string | null
          stripe_sub_id?: string | null
          stripe_subscription_id?: string | null
          cancel_at_period_end?: boolean | null
          canceled_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          org_id?: string
          plan_name?: "free" | "pro" | "business" | "enterprise"
          status?:
            | "active"
            | "trialing"
            | "canceled"
            | "past_due"
            | "unpaid"
            | "incomplete"
            | "incomplete_expired"
            | "paused"
          billing_interval?: "monthly" | "annual" | null
          seats?: number | null
          stripe_price_id?: string | null
          current_period_start?: string | null
          current_period_end?: string | null
          trial_start?: string | null
          trial_end?: string | null
          stripe_sub_id?: string | null
          stripe_subscription_id?: string | null
          cancel_at_period_end?: boolean | null
          canceled_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      plan_features: {
        Row: {
          id: string
          plan_name: "free" | "pro" | "business" | "enterprise"
          feature_key: string
          feature_value: Json
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          plan_name: "free" | "pro" | "business" | "enterprise"
          feature_key: string
          feature_value?: Json
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          plan_name?: "free" | "pro" | "business" | "enterprise"
          feature_key?: string
          feature_value?: Json
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      products: {
        Row: {
          id: string
          active: boolean | null
          name: string | null
          description: string | null
          image: string | null
          metadata: Json | null
        }
        Insert: {
          id?: string
          active?: boolean | null
          name?: string | null
          description?: string | null
          image?: string | null
          metadata?: Json | null
        }
        Update: {
          id?: string
          active?: boolean | null
          name?: string | null
          description?: string | null
          image?: string | null
          metadata?: Json | null
        }
        Relationships: []
      }
      prices: {
        Row: {
          id: string
          product_id: string | null
          active: boolean | null
          description: string | null
          unit_amount: number | null
          currency: string | null
          type: "one_time" | "recurring" | null
          interval: "day" | "week" | "month" | "year" | null
          interval_count: number | null
          trial_period_days: number | null
          metadata: Json | null
        }
        Insert: {
          id?: string
          product_id?: string | null
          active?: boolean | null
          description?: string | null
          unit_amount?: number | null
          currency?: string | null
          type?: "one_time" | "recurring" | null
          interval?: "day" | "week" | "month" | "year" | null
          interval_count?: number | null
          trial_period_days?: number | null
          metadata?: Json | null
        }
        Update: {
          id?: string
          product_id?: string | null
          active?: boolean | null
          description?: string | null
          unit_amount?: number | null
          currency?: string | null
          type?: "one_time" | "recurring" | null
          interval?: "day" | "week" | "month" | "year" | null
          interval_count?: number | null
          trial_period_days?: number | null
          metadata?: Json | null
        }
        Relationships: []
      }
      usage_events: {
        Row: {
          id: string
          user_id: string
          org_id: string | null
          event_type:
            | "record_created"
            | "api_call"
            | "automation_run"
            | "storage_used"
            | "schedule_executed"
            | "ai_tokens_used"
            | "user_active"
          event_data: Json | null
          quantity: number | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          org_id?: string | null
          event_type:
            | "record_created"
            | "api_call"
            | "automation_run"
            | "storage_used"
            | "schedule_executed"
            | "ai_tokens_used"
            | "user_active"
          event_data?: Json | null
          quantity?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          org_id?: string | null
          event_type?:
            | "record_created"
            | "api_call"
            | "automation_run"
            | "storage_used"
            | "schedule_executed"
            | "ai_tokens_used"
            | "user_active"
          event_data?: Json | null
          quantity?: number | null
          created_at?: string
        }
        Relationships: []
      }
      usage_aggregations: {
        Row: {
          id: string
          user_id: string | null
          org_id: string | null
          period_type: "daily" | "monthly"
          period_start: string
          period_end: string
          metric_type: string
          total_quantity: number
          metadata: Json | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          org_id?: string | null
          period_type: "daily" | "monthly"
          period_start: string
          period_end: string
          metric_type: string
          total_quantity?: number
          metadata?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          org_id?: string | null
          period_type?: "daily" | "monthly"
          period_start?: string
          period_end?: string
          metric_type?: string
          total_quantity?: number
          metadata?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      processed_events: {
        Row: {
          id: string
          event_id: string
          event_type: string
          processed_at: string | null
          org_id: string | null
          metadata: Json | null
        }
        Insert: {
          id?: string
          event_id: string
          event_type: string
          processed_at?: string | null
          org_id?: string | null
          metadata?: Json | null
        }
        Update: {
          id?: string
          event_id?: string
          event_type?: string
          processed_at?: string | null
          org_id?: string | null
          metadata?: Json | null
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          id: string
          org_id: string
          actor_id: string | null
          action: string
          entity_type: string
          entity_id: string
          metadata: Json
          created_at: string
          severity: "critical" | "error" | "warning" | "info" | null
          user_id: string | null
          message: string | null
          stack_trace: string | null
          component_stack: string | null
          page_url: string | null
          user_agent: string | null
          grouping_hash: string | null
          occurrence_count: number
          first_seen: string
          last_seen: string
          resolved: boolean
        }
        Insert: {
          id?: string
          org_id: string
          actor_id?: string | null
          action: string
          entity_type: string
          entity_id: string
          metadata?: Json
          created_at?: string
          severity?: "critical" | "error" | "warning" | "info" | null
          user_id?: string | null
          message?: string | null
          stack_trace?: string | null
          component_stack?: string | null
          page_url?: string | null
          user_agent?: string | null
          grouping_hash?: string | null
          occurrence_count?: number
          first_seen?: string
          last_seen?: string
          resolved?: boolean
        }
        Update: {
          id?: string
          org_id?: string
          actor_id?: string | null
          action?: string
          entity_type?: string
          entity_id?: string
          metadata?: Json
          created_at?: string
          severity?: "critical" | "error" | "warning" | "info" | null
          user_id?: string | null
          message?: string | null
          stack_trace?: string | null
          component_stack?: string | null
          page_url?: string | null
          user_agent?: string | null
          grouping_hash?: string | null
          occurrence_count?: number
          first_seen?: string
          last_seen?: string
          resolved?: boolean
        }
        Relationships: []
      }
      record_types: {
        Row: {
          id: string
          key: string
          display_name: string
          description: string | null
          config: Json
          created_by: string
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          key: string
          display_name: string
          description?: string | null
          config?: Json
          created_by: string
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          key?: string
          display_name?: string
          description?: string | null
          config?: Json
          created_by?: string
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      records: {
        Row: {
          id: string
          type_id: string
          org_id: string | null
          user_id: string | null
          created_by: string
          data: Json
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          type_id: string
          org_id?: string | null
          user_id?: string | null
          created_by: string
          data?: Json
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          type_id?: string
          org_id?: string | null
          user_id?: string | null
          created_by?: string
          data?: Json
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      reminders: {
        Row: {
          id: string
          org_id: string
          record_id: string | null
          title: string
          notes: string | null
          due_at: string | null
          status: "pending" | "sent" | "completed" | "snoozed" | "cancelled"
          priority: "low" | "medium" | "high" | "urgent" | null
          created_by: string
          created_at: string | null
          updated_at: string | null
          snoozed_until: string | null
          completed_at: string | null
          sent_at: string | null
        }
        Insert: {
          id?: string
          org_id: string
          record_id?: string | null
          title: string
          notes?: string | null
          due_at?: string | null
          status?: "pending" | "sent" | "completed" | "snoozed" | "cancelled"
          priority?: "low" | "medium" | "high" | "urgent" | null
          created_by: string
          created_at?: string | null
          updated_at?: string | null
          snoozed_until?: string | null
          completed_at?: string | null
          sent_at?: string | null
        }
        Update: {
          id?: string
          org_id?: string
          record_id?: string | null
          title?: string
          notes?: string | null
          due_at?: string | null
          status?: "pending" | "sent" | "completed" | "snoozed" | "cancelled"
          priority?: "low" | "medium" | "high" | "urgent" | null
          created_by?: string
          created_at?: string | null
          updated_at?: string | null
          snoozed_until?: string | null
          completed_at?: string | null
          sent_at?: string | null
        }
        Relationships: []
      }
      schedules: {
        Row: {
          id: string
          org_id: string
          name: string
          description: string | null
          cron: string | null
          rule: Json | null
          active: boolean | null
          created_by: string
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          org_id: string
          name: string
          description?: string | null
          cron?: string | null
          rule?: Json | null
          active?: boolean | null
          created_by: string
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          org_id?: string
          name?: string
          description?: string | null
          cron?: string | null
          rule?: Json | null
          active?: boolean | null
          created_by?: string
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      notifications_outbox: {
        Row: {
          id: string
          org_id: string
          event: string
          payload: Json
          created_at: string | null
          delivered_at: string | null
          attempt_count: number | null
          error: string | null
          next_retry_at: string | null
        }
        Insert: {
          id?: string
          org_id: string
          event: string
          payload?: Json
          created_at?: string | null
          delivered_at?: string | null
          attempt_count?: number | null
          error?: string | null
          next_retry_at?: string | null
        }
        Update: {
          id?: string
          org_id?: string
          event?: string
          payload?: Json
          created_at?: string | null
          delivered_at?: string | null
          attempt_count?: number | null
          error?: string | null
          next_retry_at?: string | null
        }
        Relationships: []
      }
      idempotency_keys: {
        Row: {
          key: string
          method: string
          path: string
          org_id: string | null
          user_id: string | null
          request_hash: string
          status: number | null
          response: Json | null
          created_at: string | null
          locked_at: string | null
        }
        Insert: {
          key: string
          method: string
          path: string
          org_id?: string | null
          user_id?: string | null
          request_hash: string
          status?: number | null
          response?: Json | null
          created_at?: string | null
          locked_at?: string | null
        }
        Update: {
          key?: string
          method?: string
          path?: string
          org_id?: string | null
          user_id?: string | null
          request_hash?: string
          status?: number | null
          response?: Json | null
          created_at?: string | null
          locked_at?: string | null
        }
        Relationships: []
      }
      rate_limits: {
        Row: {
          bucket: string
          window_start: string
          count: number
          created_at: string | null
        }
        Insert: {
          bucket: string
          window_start: string
          count?: number
          created_at?: string | null
        }
        Update: {
          bucket?: string
          window_start?: string
          count?: number
          created_at?: string | null
        }
        Relationships: []
      }
      attachments: {
        Row: {
          id: string
          record_id: string | null
          org_id: string | null
          user_id: string | null
          created_by: string
          file_name: string
          file_size: number
          file_type: string
          mime_type: string
          bucket_name: string
          file_path: string
          public_url: string | null
          image_width: number | null
          image_height: number | null
          image_format: string | null
          is_public: boolean | null
          access_token: string | null
          created_at: string | null
          updated_at: string | null
          expires_at: string | null
        }
        Insert: {
          id?: string
          record_id?: string | null
          org_id?: string | null
          user_id?: string | null
          created_by: string
          file_name: string
          file_size: number
          file_type: string
          mime_type: string
          bucket_name: string
          file_path: string
          public_url?: string | null
          image_width?: number | null
          image_height?: number | null
          image_format?: string | null
          is_public?: boolean | null
          access_token?: string | null
          created_at?: string | null
          updated_at?: string | null
          expires_at?: string | null
        }
        Update: {
          id?: string
          record_id?: string | null
          org_id?: string | null
          user_id?: string | null
          created_by?: string
          file_name?: string
          file_size?: number
          file_type?: string
          mime_type?: string
          bucket_name?: string
          file_path?: string
          public_url?: string | null
          image_width?: number | null
          image_height?: number | null
          image_format?: string | null
          is_public?: boolean | null
          access_token?: string | null
          created_at?: string | null
          updated_at?: string | null
          expires_at?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          id: string
          org_id: string
          user_id: string
          type: "info" | "success" | "warning" | "error"
          title: string
          message: string
          read: boolean
          metadata: Json | null
          created_at: string | null
        }
        Insert: {
          id?: string
          org_id: string
          user_id: string
          type?: "info" | "success" | "warning" | "error"
          title: string
          message: string
          read?: boolean
          metadata?: Json | null
          created_at?: string | null
        }
        Update: {
          id?: string
          org_id?: string
          user_id?: string
          type?: "info" | "success" | "warning" | "error"
          title?: string
          message?: string
          read?: boolean
          metadata?: Json | null
          created_at?: string | null
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          user_id: string
          theme: "light" | "dark" | "system" | null
          language: string | null
          timezone: string | null
          email_notifications: Json | null
          push_notifications: Json | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          user_id: string
          theme?: "light" | "dark" | "system" | null
          language?: string | null
          timezone?: string | null
          email_notifications?: Json | null
          push_notifications?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          user_id?: string
          theme?: "light" | "dark" | "system" | null
          language?: string | null
          timezone?: string | null
          email_notifications?: Json | null
          push_notifications?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      org_settings: {
        Row: {
          org_id: string
          settings: Json | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          org_id: string
          settings?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          org_id?: string
          settings?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      team_invites: {
        Row: {
          id: string
          org_id: string
          email: string
          role: "member" | "viewer"
          token: string
          invited_by: string
          expires_at: string | null
          status: "pending" | "accepted" | "expired" | "revoked"
          created_at: string | null
        }
        Insert: {
          id?: string
          org_id: string
          email: string
          role: "member" | "viewer"
          token: string
          invited_by: string
          expires_at?: string | null
          status?: "pending" | "accepted" | "expired" | "revoked"
          created_at?: string | null
        }
        Update: {
          id?: string
          org_id?: string
          email?: string
          role?: "member" | "viewer"
          token?: string
          invited_by?: string
          expires_at?: string | null
          status?: "pending" | "accepted" | "expired" | "revoked"
          created_at?: string | null
        }
        Relationships: []
      }
      api_usage: {
        Row: {
          id: string
          org_id: string
          user_id: string | null
          endpoint: string
          method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"
          status_code: number
          response_time_ms: number
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          org_id: string
          user_id?: string | null
          endpoint: string
          method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"
          status_code: number
          response_time_ms: number
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          user_id?: string | null
          endpoint?: string
          method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"
          status_code?: number
          response_time_ms?: number
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Relationships: []
      }
      daily_usage_summary: {
        Row: {
          id: string
          org_id: string
          date: string
          api_calls: number | null
          active_users: number | null
          storage_bytes: number | null
          records_created: number | null
          automations_run: number | null
          schedules_executed: number | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          org_id: string
          date: string
          api_calls?: number | null
          active_users?: number | null
          storage_bytes?: number | null
          records_created?: number | null
          automations_run?: number | null
          schedules_executed?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          org_id?: string
          date?: string
          api_calls?: number | null
          active_users?: number | null
          storage_bytes?: number | null
          records_created?: number | null
          automations_run?: number | null
          schedules_executed?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      development_tasks: {
        Row: {
          id: string
          org_id: string
          title: string
          description: string | null
          status: "todo" | "in-progress" | "review" | "done" | "blocked"
          priority: "low" | "normal" | "high" | "urgent"
          assignee_id: string | null
          created_by: string
          notion_page_id: string | null
          notion_database_id: string | null
          metadata: Json | null
          due_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          org_id: string
          title: string
          description?: string | null
          status?: "todo" | "in-progress" | "review" | "done" | "blocked"
          priority?: "low" | "normal" | "high" | "urgent"
          assignee_id?: string | null
          created_by: string
          notion_page_id?: string | null
          notion_database_id?: string | null
          metadata?: Json | null
          due_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          title?: string
          description?: string | null
          status?: "todo" | "in-progress" | "review" | "done" | "blocked"
          priority?: "low" | "normal" | "high" | "urgent"
          assignee_id?: string | null
          created_by?: string
          notion_page_id?: string | null
          notion_database_id?: string | null
          metadata?: Json | null
          due_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      aggregate_daily_usage: {
        Args: {
          p_target_date?: string | null
        }
        Returns: unknown
      }
      get_api_usage_stats: {
        Args: {
          p_org_id: string
          p_start_date?: string | null
          p_end_date?: string | null
          days?: number | null
        }
        Returns: {
          endpoint: string | null
          status_code: number | null
          response_time_ms: number | null
          created_at: string | null
        }[]
      }
      get_storage_usage: {
        Args: {
          p_org_id: string
        }
        Returns: {
          total_bytes: number | null
        }[]
      }
      get_audit_stats: {
        Args: {
          p_org_id: string
          p_window?: string | null
        }
        Returns: unknown
      }
      get_active_users_count: {
        Args: {
          p_org_id: string
          p_period?: string | null
          p_reference_date?: string | null
        }
        Returns: {
          active_users: number | null
          period_type: string | null
          period_start: string | null
          period_end: string | null
        }[]
      }
    }
    Enums: {
      subscription_status:
        | "trialing"
        | "active"
        | "canceled"
        | "incomplete"
        | "incomplete_expired"
        | "past_due"
        | "unpaid"
        | "paused"
      pricing_type: "one_time" | "recurring"
      pricing_plan_interval: "day" | "week" | "month" | "year"
      task_status: "todo" | "in-progress" | "review" | "done" | "blocked"
      task_priority: "low" | "normal" | "high" | "urgent"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
