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
        Relationships: [
          {
            foreignKeyName: "users_id_fkey"
            columns: ["id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          id: string
          name: string
          owner_id: string
          created_at: string | null
          is_personal: boolean | null
          org_type:
            | "personal"
            | "business"
            | "family"
            | "education"
            | "other"
            | null
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
          org_type?:
            | "personal"
            | "business"
            | "family"
            | "education"
            | "other"
            | null
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
          org_type?:
            | "personal"
            | "business"
            | "family"
            | "education"
            | "other"
            | null
          slug?: string | null
          description?: string | null
          avatar_url?: string | null
          settings?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organizations_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_members: {
        Row: {
          org_id: string
          user_id: string
          role: "owner" | "admin" | "editor" | "viewer"
          created_at: string | null
        }
        Insert: {
          org_id?: string
          user_id?: string
          role: "owner" | "admin" | "editor" | "viewer"
          created_at?: string | null
        }
        Update: {
          org_id?: string
          user_id?: string
          role?: "owner" | "admin" | "editor" | "viewer"
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
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
        Relationships: [
          {
            foreignKeyName: "invites_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invites_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
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
          org_id?: string
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
        Relationships: [
          {
            foreignKeyName: "billing_customers_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
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
          trial_end: string | null
          stripe_sub_id: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
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
          trial_end?: string | null
          stripe_sub_id?: string | null
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
          trial_end?: string | null
          stripe_sub_id?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "org_subscriptions_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
