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
      attachments: {
        Row: {
          access_token: string | null
          bucket_name: string
          created_at: string | null
          created_by: string
          expires_at: string | null
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          id: string
          image_format: string | null
          image_height: number | null
          image_width: number | null
          is_public: boolean | null
          mime_type: string
          org_id: string | null
          public_url: string | null
          record_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          access_token?: string | null
          bucket_name: string
          created_at?: string | null
          created_by: string
          expires_at?: string | null
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          id?: string
          image_format?: string | null
          image_height?: number | null
          image_width?: number | null
          is_public?: boolean | null
          mime_type: string
          org_id?: string | null
          public_url?: string | null
          record_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          access_token?: string | null
          bucket_name?: string
          created_at?: string | null
          created_by?: string
          expires_at?: string | null
          file_name?: string
          file_path?: string
          file_size?: number
          file_type?: string
          id?: string
          image_format?: string | null
          image_height?: number | null
          image_width?: number | null
          is_public?: boolean | null
          mime_type?: string
          org_id?: string | null
          public_url?: string | null
          record_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attachments_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attachments_record_id_fkey"
            columns: ["record_id"]
            isOneToOne: false
            referencedRelation: "records"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          entity_id: string
          entity_type: string
          id: string
          metadata: Json
          org_id: string
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          entity_id: string
          entity_type: string
          id?: string
          metadata?: Json
          org_id: string
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          entity_id?: string
          entity_type?: string
          id?: string
          metadata?: Json
          org_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      billing_customers: {
        Row: {
          billing_email: string | null
          created_at: string | null
          org_id: string
          stripe_customer_id: string | null
          updated_at: string | null
        }
        Insert: {
          billing_email?: string | null
          created_at?: string | null
          org_id: string
          stripe_customer_id?: string | null
          updated_at?: string | null
        }
        Update: {
          billing_email?: string | null
          created_at?: string | null
          org_id?: string
          stripe_customer_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "billing_customers_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          id: string
          stripe_customer_id: string | null
        }
        Insert: {
          id: string
          stripe_customer_id?: string | null
        }
        Update: {
          id?: string
          stripe_customer_id?: string | null
        }
        Relationships: []
      }
      idempotency_keys: {
        Row: {
          created_at: string | null
          key: string
          locked_at: string | null
          method: string
          org_id: string | null
          path: string
          request_hash: string
          response: Json | null
          status: number | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          key: string
          locked_at?: string | null
          method: string
          org_id?: string | null
          path: string
          request_hash: string
          response?: Json | null
          status?: number | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          key?: string
          locked_at?: string | null
          method?: string
          org_id?: string | null
          path?: string
          request_hash?: string
          response?: Json | null
          status?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "idempotency_keys_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      invites: {
        Row: {
          created_at: string | null
          created_by: string
          email: string
          expires_at: string | null
          id: string
          org_id: string
          role: 'member' | 'viewer'
          status: 'pending' | 'accepted' | 'expired'
          token: string
        }
        Insert: {
          created_at?: string | null
          created_by: string
          email: string
          expires_at?: string | null
          id?: string
          org_id: string
          role: 'member' | 'viewer'
          status?: 'pending' | 'accepted' | 'expired'
          token: string
        }
        Update: {
          created_at?: string | null
          created_by?: string
          email?: string
          expires_at?: string | null
          id?: string
          org_id?: string
          role?: 'member' | 'viewer'
          status?: 'pending' | 'accepted' | 'expired'
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "invites_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      mcp_sanity: {
        Row: {
          created_at: string
          id: string
          note: string
        }
        Insert: {
          created_at?: string
          id?: string
          note: string
        }
        Update: {
          created_at?: string
          id?: string
          note?: string
        }
        Relationships: []
      }
      notifications_outbox: {
        Row: {
          attempt_count: number | null
          created_at: string | null
          delivered_at: string | null
          error: string | null
          event: string
          id: string
          next_retry_at: string | null
          org_id: string
          payload: Json
        }
        Insert: {
          attempt_count?: number | null
          created_at?: string | null
          delivered_at?: string | null
          error?: string | null
          event: string
          id?: string
          next_retry_at?: string | null
          org_id: string
          payload?: Json
        }
        Update: {
          attempt_count?: number | null
          created_at?: string | null
          delivered_at?: string | null
          error?: string | null
          event?: string
          id?: string
          next_retry_at?: string | null
          org_id?: string
          payload?: Json
        }
        Relationships: [
          {
            foreignKeyName: "notifications_outbox_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      org_subscriptions: {
        Row: {
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          org_id: string
          plan: string
          status: string
          stripe_sub_id: string | null
          trial_end: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          org_id: string
          plan?: string
          status?: string
          stripe_sub_id?: string | null
          trial_end?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          org_id?: string
          plan?: string
          status?: string
          stripe_sub_id?: string | null
          trial_end?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "org_subscriptions_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_members: {
        Row: {
          created_at: string | null
          org_id: string
          role: 'owner' | 'member' | 'viewer'
          user_id: string
        }
        Insert: {
          created_at?: string | null
          org_id: string
          role: 'owner' | 'member' | 'viewer'
          user_id: string
        }
        Update: {
          created_at?: string | null
          org_id?: string
          role?: 'owner' | 'member' | 'viewer'
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          description: string | null
          id: string
          is_personal: boolean | null
          name: string
          org_type: 'personal' | 'business' | 'family' | 'education' | 'other' | null
          owner_id: string
          settings: Json | null
          slug: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_personal?: boolean | null
          name: string
          org_type?: 'personal' | 'business' | 'family' | 'education' | 'other' | null
          owner_id: string
          settings?: Json | null
          slug?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_personal?: boolean | null
          name?: string
          org_type?: 'personal' | 'business' | 'family' | 'education' | 'other' | null
          owner_id?: string
          settings?: Json | null
          slug?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      posts: {
        Row: {
          content: string | null
          created_at: string
          id: number
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: never
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: never
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      prices: {
        Row: {
          active: boolean | null
          currency: string | null
          description: string | null
          id: string
          interval: Database["public"]["Enums"]["pricing_plan_interval"] | null
          interval_count: number | null
          metadata: Json | null
          product_id: string | null
          trial_period_days: number | null
          type: Database["public"]["Enums"]["pricing_type"] | null
          unit_amount: number | null
        }
        Insert: {
          active?: boolean | null
          currency?: string | null
          description?: string | null
          id: string
          interval?: Database["public"]["Enums"]["pricing_plan_interval"] | null
          interval_count?: number | null
          metadata?: Json | null
          product_id?: string | null
          trial_period_days?: number | null
          type?: Database["public"]["Enums"]["pricing_type"] | null
          unit_amount?: number | null
        }
        Update: {
          active?: boolean | null
          currency?: string | null
          description?: string | null
          id?: string
          interval?: Database["public"]["Enums"]["pricing_plan_interval"] | null
          interval_count?: number | null
          metadata?: Json | null
          product_id?: string | null
          trial_period_days?: number | null
          type?: Database["public"]["Enums"]["pricing_type"] | null
          unit_amount?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "prices_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      processed_events: {
        Row: {
          event_id: string
          event_type: string
          id: string
          metadata: Json | null
          org_id: string | null
          processed_at: string | null
        }
        Insert: {
          event_id: string
          event_type: string
          id?: string
          metadata?: Json | null
          org_id?: string | null
          processed_at?: string | null
        }
        Update: {
          event_id?: string
          event_type?: string
          id?: string
          metadata?: Json | null
          org_id?: string | null
          processed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "processed_events_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          active: boolean | null
          description: string | null
          id: string
          image: string | null
          metadata: Json | null
          name: string | null
        }
        Insert: {
          active?: boolean | null
          description?: string | null
          id: string
          image?: string | null
          metadata?: Json | null
          name?: string | null
        }
        Update: {
          active?: boolean | null
          description?: string | null
          id?: string
          image?: string | null
          metadata?: Json | null
          name?: string | null
        }
        Relationships: []
      }
      rate_limits: {
        Row: {
          bucket: string
          count: number
          created_at: string | null
          window_start: string
        }
        Insert: {
          bucket: string
          count?: number
          created_at?: string | null
          window_start: string
        }
        Update: {
          bucket?: string
          count?: number
          created_at?: string | null
          window_start?: string
        }
        Relationships: []
      }
      record_types: {
        Row: {
          config: Json
          created_at: string | null
          created_by: string
          description: string | null
          display_name: string
          id: string
          key: string
          updated_at: string | null
        }
        Insert: {
          config?: Json
          created_at?: string | null
          created_by: string
          description?: string | null
          display_name: string
          id?: string
          key: string
          updated_at?: string | null
        }
        Update: {
          config?: Json
          created_at?: string | null
          created_by?: string
          description?: string | null
          display_name?: string
          id?: string
          key?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      records: {
        Row: {
          created_at: string | null
          created_by: string
          data: Json
          id: string
          org_id: string | null
          type_id: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          data?: Json
          id?: string
          org_id?: string | null
          type_id: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          data?: Json
          id?: string
          org_id?: string | null
          type_id?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "records_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "records_type_id_fkey"
            columns: ["type_id"]
            isOneToOne: false
            referencedRelation: "record_types"
            referencedColumns: ["id"]
          },
        ]
      }
      reminders: {
        Row: {
          completed_at: string | null
          created_at: string | null
          created_by: string
          due_at: string | null
          id: string
          notes: string | null
          org_id: string
          priority: string | null
          record_id: string | null
          sent_at: string | null
          snoozed_until: string | null
          status: string
          title: string
          updated_at: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          created_by: string
          due_at?: string | null
          id?: string
          notes?: string | null
          org_id: string
          priority?: string | null
          record_id?: string | null
          sent_at?: string | null
          snoozed_until?: string | null
          status?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          created_by?: string
          due_at?: string | null
          id?: string
          notes?: string | null
          org_id?: string
          priority?: string | null
          record_id?: string | null
          sent_at?: string | null
          snoozed_until?: string | null
          status?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reminders_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reminders_record_id_fkey"
            columns: ["record_id"]
            isOneToOne: false
            referencedRelation: "records"
            referencedColumns: ["id"]
          },
        ]
      }
      schedules: {
        Row: {
          active: boolean | null
          created_at: string | null
          created_by: string
          cron: string | null
          description: string | null
          id: string
          name: string
          org_id: string
          rule: Json | null
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          created_by: string
          cron?: string | null
          description?: string | null
          id?: string
          name: string
          org_id: string
          rule?: Json | null
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          created_by?: string
          cron?: string | null
          description?: string | null
          id?: string
          name?: string
          org_id?: string
          rule?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "schedules_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          cancel_at: string | null
          cancel_at_period_end: boolean | null
          canceled_at: string | null
          created: string
          current_period_end: string
          current_period_start: string
          ended_at: string | null
          id: string
          metadata: Json | null
          price_id: string | null
          quantity: number | null
          status: Database["public"]["Enums"]["subscription_status"] | null
          trial_end: string | null
          trial_start: string | null
          user_id: string
        }
        Insert: {
          cancel_at?: string | null
          cancel_at_period_end?: boolean | null
          canceled_at?: string | null
          created?: string
          current_period_end?: string
          current_period_start?: string
          ended_at?: string | null
          id: string
          metadata?: Json | null
          price_id?: string | null
          quantity?: number | null
          status?: Database["public"]["Enums"]["subscription_status"] | null
          trial_end?: string | null
          trial_start?: string | null
          user_id: string
        }
        Update: {
          cancel_at?: string | null
          cancel_at_period_end?: boolean | null
          canceled_at?: string | null
          created?: string
          current_period_end?: string
          current_period_start?: string
          ended_at?: string | null
          id?: string
          metadata?: Json | null
          price_id?: string | null
          quantity?: number | null
          status?: Database["public"]["Enums"]["subscription_status"] | null
          trial_end?: string | null
          trial_start?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_price_id_fkey"
            columns: ["price_id"]
            isOneToOne: false
            referencedRelation: "prices"
            referencedColumns: ["id"]
          },
        ]
      }
      usage_aggregations: {
        Row: {
          id: string
          user_id: string | null
          org_id: string | null
          period_type: 'daily' | 'monthly'
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
          period_type: 'daily' | 'monthly'
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
          period_type?: 'daily' | 'monthly'
          period_start?: string
          period_end?: string
          metric_type?: string
          total_quantity?: number
          metadata?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "usage_aggregations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "usage_aggregations_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      usage_events: {
        Row: {
          id: string
          user_id: string
          org_id: string | null
          event_type: 'record_created' | 'api_call' | 'automation_run' | 'storage_used' | 'schedule_executed' | 'ai_tokens_used' | 'user_active'
          event_data: Json | null
          quantity: number | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          org_id?: string | null
          event_type: 'record_created' | 'api_call' | 'automation_run' | 'storage_used' | 'schedule_executed' | 'ai_tokens_used' | 'user_active'
          event_data?: Json | null
          quantity?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          org_id?: string | null
          event_type?: 'record_created' | 'api_call' | 'automation_run' | 'storage_used' | 'schedule_executed' | 'ai_tokens_used' | 'user_active'
          event_data?: Json | null
          quantity?: number | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "usage_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "usage_events_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          id: string
          // Core identity fields
          username: string | null
          display_name: string | null
          personal_title: string | null
          first_name: string | null
          middle_name: string | null
          last_name: string | null
          full_name: string | null
          avatar_url: string | null
          // Contact information
          email: string | null
          phone_country_code: string | null
          phone_number: string | null
          // Personal address
          personal_apt_suite: string | null
          personal_street_address_1: string | null
          personal_street_address_2: string | null
          personal_city: string | null
          personal_state: string | null
          personal_postal_code: string | null
          personal_country: string | null
          // About section
          bio: string | null
          education: Json
          work_experience: Json
          // Business information
          business_position: string | null
          business_company: string | null
          business_apt_suite: string | null
          business_street_address_1: string | null
          business_street_address_2: string | null
          business_city: string | null
          business_state: string | null
          business_postal_code: string | null
          business_country: string | null
          // Legacy fields
          billing_address: Json | null
          payment_method: Json | null
          last_sign_in_at: string | null
          // System/metadata
          account_type: 'super_admin' | 'admin' | 'user'
          profile_completed: boolean | null
          onboarding_completed: boolean | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id: string
          // Core identity fields
          username?: string | null
          display_name?: string | null
          personal_title?: string | null
          first_name?: string | null
          middle_name?: string | null
          last_name?: string | null
          full_name?: string | null
          avatar_url?: string | null
          // Contact information
          email?: string | null
          phone_country_code?: string | null
          phone_number?: string | null
          // Personal address
          personal_apt_suite?: string | null
          personal_street_address_1?: string | null
          personal_street_address_2?: string | null
          personal_city?: string | null
          personal_state?: string | null
          personal_postal_code?: string | null
          personal_country?: string | null
          // About section
          bio?: string | null
          education?: Json
          work_experience?: Json
          // Business information
          business_position?: string | null
          business_company?: string | null
          business_apt_suite?: string | null
          business_street_address_1?: string | null
          business_street_address_2?: string | null
          business_city?: string | null
          business_state?: string | null
          business_postal_code?: string | null
          business_country?: string | null
          // Legacy fields
          billing_address?: Json | null
          payment_method?: Json | null
          last_sign_in_at?: string | null
          // System/metadata
          account_type?: 'super_admin' | 'admin' | 'user'
          profile_completed?: boolean | null
          onboarding_completed?: boolean | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          // Core identity fields
          username?: string | null
          display_name?: string | null
          personal_title?: string | null
          first_name?: string | null
          middle_name?: string | null
          last_name?: string | null
          full_name?: string | null
          avatar_url?: string | null
          // Contact information
          email?: string | null
          phone_country_code?: string | null
          phone_number?: string | null
          // Personal address
          personal_apt_suite?: string | null
          personal_street_address_1?: string | null
          personal_street_address_2?: string | null
          personal_city?: string | null
          personal_state?: string | null
          personal_postal_code?: string | null
          personal_country?: string | null
          // About section
          bio?: string | null
          education?: Json
          work_experience?: Json
          // Business information
          business_position?: string | null
          business_company?: string | null
          business_apt_suite?: string | null
          business_street_address_1?: string | null
          business_street_address_2?: string | null
          business_city?: string | null
          business_state?: string | null
          business_postal_code?: string | null
          business_country?: string | null
          // Legacy fields
          billing_address?: Json | null
          payment_method?: Json | null
          last_sign_in_at?: string | null
          // System/metadata
          account_type?: 'super_admin' | 'admin' | 'user'
          profile_completed?: boolean | null
          onboarding_completed?: boolean | null
          created_at?: string
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      team_members: {
        Row: {
          role: string | null
          team_id: string | null
          user_id: string | null
        }
        Insert: {
          role?: string | null
          team_id?: string | null
          user_id?: string | null
        }
        Update: {
          role?: string | null
          team_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_org_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      aggregate_usage: {
        Args: {
          p_period_type: string
          p_period_start: string
          p_period_end: string
        }
        Returns: undefined
      }
      check_rate_limit_bucket: {
        Args: { p_bucket: string; p_limit: number; p_window_start: string }
        Returns: {
          allowed: boolean
          bucket: string
          count: number
          retry_after_sec: number
          window_start: string
        }[]
      }
      cleanup_expired_idempotency_keys: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_expired_invites: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_expired_rate_limits: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      create_reminders_from_schedules: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      emit_notification_event: {
        Args: { p_event: string; p_org_id: string; p_payload: Json }
        Returns: string
      }
      generate_invite_token: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_signed_url: {
        Args: {
          bucket_name: string
          expires_in_seconds?: number
          file_path: string
        }
        Returns: string
      }
      get_audit_stats: {
        Args: { p_org_id: string; p_window?: string }
        Returns: {
          by_action: Json
          by_actor: Json
          by_entity_type: Json
          total: number
        }[]
      }
      get_or_create_rate_limit_bucket: {
        Args: { p_bucket: string; p_limit: number; p_window_start: string }
        Returns: {
          allowed: boolean
          bucket: string
          count: number
          retry_after_sec: number
          window_start: string
        }[]
      }
    }
    Enums: {
      pricing_plan_interval: "day" | "week" | "month" | "year"
      pricing_type: "one_time" | "recurring"
      subscription_status:
        | "trialing"
        | "active"
        | "canceled"
        | "incomplete"
        | "incomplete_expired"
        | "past_due"
        | "unpaid"
        | "paused"
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
      pricing_plan_interval: ["day", "week", "month", "year"],
      pricing_type: ["one_time", "recurring"],
      subscription_status: [
        "trialing",
        "active",
        "canceled",
        "incomplete",
        "incomplete_expired",
        "past_due",
        "unpaid",
        "paused",
      ],
    },
  },
} as const
