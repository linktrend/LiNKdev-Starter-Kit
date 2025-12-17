export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: 'local-schema';
  };
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          full_name: string | null;
          avatar_url: string | null;
          billing_address: Json | null;
          payment_method: Json | null;
          username: string | null;
          display_name: string | null;
          personal_title: string | null;
          first_name: string | null;
          middle_name: string | null;
          last_name: string | null;
          email: string | null;
          phone_country_code: string | null;
          phone_number: string | null;
          personal_apt_suite: string | null;
          personal_street_address_1: string | null;
          personal_street_address_2: string | null;
          personal_city: string | null;
          personal_state: string | null;
          personal_postal_code: string | null;
          personal_country: string | null;
          account_type: 'super_admin' | 'admin' | 'user' | null;
          profile_completed: boolean | null;
          onboarding_completed: boolean | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: Partial<Database['public']['Tables']['users']['Row']> & {
          email?: string | null;
        };
        Update: Partial<Database['public']['Tables']['users']['Row']>;
        Relationships: [];
      };
      organizations: {
        Row: {
          id: string;
          name: string;
          owner_id: string;
          created_at: string | null;
          is_personal: boolean | null;
          org_type: 'personal' | 'business' | 'family' | 'education' | 'other' | null;
          slug: string | null;
          description: string | null;
          avatar_url: string | null;
          settings: Json | null;
          updated_at: string | null;
        };
        Insert: Partial<Database['public']['Tables']['organizations']['Row']> & {
          name: string;
          owner_id: string;
        };
        Update: Partial<Database['public']['Tables']['organizations']['Row']>;
        Relationships: [];
      };
      organization_members: {
        Row: {
          org_id: string;
          user_id: string;
          role: 'owner' | 'admin' | 'editor' | 'member' | 'viewer';
          created_at: string | null;
        };
        Insert: Partial<Database['public']['Tables']['organization_members']['Row']> & {
          role: Database['public']['Tables']['organization_members']['Row']['role'];
        };
        Update: Partial<Database['public']['Tables']['organization_members']['Row']>;
        Relationships: [];
      };
      invites: {
        Row: {
          id: string;
          org_id: string;
          email: string;
          role: 'admin' | 'editor' | 'viewer';
          token: string;
          status: 'pending' | 'accepted' | 'expired';
          created_by: string;
          created_at: string | null;
          expires_at: string | null;
          invite_type: 'email' | 'link' | null;
          expires_single_use: boolean | null;
        };
        Insert: Partial<Database['public']['Tables']['invites']['Row']> & {
          org_id: string;
          email: string;
          role: Database['public']['Tables']['invites']['Row']['role'];
          token: string;
          created_by: string;
        };
        Update: Partial<Database['public']['Tables']['invites']['Row']>;
        Relationships: [];
      };
      billing_customers: {
        Row: {
          org_id: string;
          stripe_customer_id: string | null;
          billing_email: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: Partial<Database['public']['Tables']['billing_customers']['Row']>;
        Update: Partial<Database['public']['Tables']['billing_customers']['Row']>;
        Relationships: [];
      };
      org_subscriptions: {
        Row: {
          org_id: string;
          plan_name: 'free' | 'pro' | 'business' | 'enterprise';
          status:
            | 'active'
            | 'trialing'
            | 'canceled'
            | 'past_due'
            | 'unpaid'
            | 'incomplete'
            | 'incomplete_expired'
            | 'paused';
          billing_interval: 'monthly' | 'annual' | null;
          seats: number | null;
          stripe_price_id: string | null;
          current_period_start: string | null;
          current_period_end: string | null;
          trial_start: string | null;
          trial_end: string | null;
          stripe_sub_id: string | null;
          stripe_subscription_id: string | null;
          cancel_at_period_end: boolean | null;
          canceled_at: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: Partial<Database['public']['Tables']['org_subscriptions']['Row']> & {
          org_id: string;
        };
        Update: Partial<Database['public']['Tables']['org_subscriptions']['Row']>;
        Relationships: [];
      };
      plan_features: {
        Row: {
          id: string;
          plan_name: 'free' | 'pro' | 'business' | 'enterprise';
          feature_key: string;
          feature_value: Json;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: Partial<Database['public']['Tables']['plan_features']['Row']> & {
          id?: string;
          plan_name: Database['public']['Tables']['plan_features']['Row']['plan_name'];
          feature_key: string;
        };
        Update: Partial<Database['public']['Tables']['plan_features']['Row']>;
        Relationships: [];
      };
      usage_events: {
        Row: {
          id: string;
          user_id: string;
          org_id: string | null;
          event_type:
            | 'record_created'
            | 'api_call'
            | 'automation_run'
            | 'storage_used'
            | 'schedule_executed'
            | 'ai_tokens_used'
            | 'user_active';
          event_data: Json | null;
          quantity: number | null;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['usage_events']['Row']> & {
          user_id: string;
          event_type: Database['public']['Tables']['usage_events']['Row']['event_type'];
        };
        Update: Partial<Database['public']['Tables']['usage_events']['Row']>;
        Relationships: [];
      };
      usage_aggregations: {
        Row: {
          id: string;
          user_id: string | null;
          org_id: string | null;
          period_type: 'daily' | 'monthly';
          period_start: string;
          period_end: string;
          metric_type: string;
          total_quantity: number;
          metadata: Json | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: Partial<Database['public']['Tables']['usage_aggregations']['Row']> & {
          period_type: Database['public']['Tables']['usage_aggregations']['Row']['period_type'];
          period_start: string;
          period_end: string;
          metric_type: string;
        };
        Update: Partial<Database['public']['Tables']['usage_aggregations']['Row']>;
        Relationships: [];
      };
      products: {
        Row: {
          id: string;
          active: boolean | null;
          name: string | null;
          description: string | null;
          image: string | null;
          metadata: Json | null;
        };
        Insert: Partial<Database['public']['Tables']['products']['Row']> & {
          id?: string;
        };
        Update: Partial<Database['public']['Tables']['products']['Row']>;
        Relationships: [];
      };
      prices: {
        Row: {
          id: string;
          product_id: string | null;
          active: boolean | null;
          description: string | null;
          unit_amount: number | null;
          currency: string | null;
          type: 'one_time' | 'recurring' | null;
          interval: 'day' | 'week' | 'month' | 'year' | null;
          interval_count: number | null;
          trial_period_days: number | null;
          metadata: Json | null;
        };
        Insert: Partial<Database['public']['Tables']['prices']['Row']> & {
          id?: string;
        };
        Update: Partial<Database['public']['Tables']['prices']['Row']>;
        Relationships: [];
      };
      processed_events: {
        Row: {
          id: string;
          event_id: string;
          event_type: string;
          processed_at: string | null;
          org_id: string | null;
          metadata: Json | null;
        };
        Insert: Partial<Database['public']['Tables']['processed_events']['Row']> & {
          event_id: string;
          event_type: string;
        };
        Update: Partial<Database['public']['Tables']['processed_events']['Row']>;
        Relationships: [];
      };
      notifications: {
        Row: {
          id: string;
          org_id: string;
          user_id: string;
          type: 'info' | 'success' | 'warning' | 'error' | string;
          title: string;
          message: string;
          metadata: Json | null;
          read: boolean;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['notifications']['Row']> & {
          org_id: string;
          user_id: string;
          title: string;
          message: string;
        };
        Update: Partial<Database['public']['Tables']['notifications']['Row']>;
        Relationships: [];
      };
      user_settings: {
        Row: {
          user_id: string;
          theme: 'light' | 'dark' | 'system';
          language: string;
          timezone: string;
          email_notifications: {
            marketing: boolean;
            features: boolean;
            security: boolean;
            updates: boolean;
          };
          push_notifications: {
            enabled: boolean;
            browser: boolean;
            mobile: boolean;
          };
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: Partial<Database['public']['Tables']['user_settings']['Row']> & {
          user_id: string;
        };
        Update: Partial<Database['public']['Tables']['user_settings']['Row']>;
        Relationships: [];
      };
      org_settings: {
        Row: {
          org_id: string;
          settings: Json;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: Partial<Database['public']['Tables']['org_settings']['Row']> & {
          org_id: string;
          settings?: Json;
        };
        Update: Partial<Database['public']['Tables']['org_settings']['Row']>;
        Relationships: [];
      };
      team_invites: {
        Row: {
          id: string;
          org_id: string;
          email: string;
          role: string;
          token: string;
          status: 'pending' | 'accepted' | 'expired' | 'revoked';
          invited_by: string;
          expires_at: string | null;
          created_at: string | null;
        };
        Insert: Partial<Database['public']['Tables']['team_invites']['Row']> & {
          org_id: string;
          email: string;
          role: string;
          token: string;
          invited_by: string;
        };
        Update: Partial<Database['public']['Tables']['team_invites']['Row']>;
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      subscription_status:
        | 'trialing'
        | 'active'
        | 'canceled'
        | 'incomplete'
        | 'incomplete_expired'
        | 'past_due'
        | 'unpaid'
        | 'paused';
      pricing_type: 'one_time' | 'recurring';
      pricing_plan_interval: 'day' | 'week' | 'month' | 'year';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
