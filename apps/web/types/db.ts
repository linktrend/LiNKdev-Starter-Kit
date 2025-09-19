// Database types for template - replace with actual generated types when needed
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          full_name: string | null
          avatar_url: string | null
          billing_address: Json | null
          payment_method: Json | null
        }
        Insert: {
          id: string
          full_name?: string | null
          avatar_url?: string | null
          billing_address?: Json | null
          payment_method?: Json | null
        }
        Update: {
          id?: string
          full_name?: string | null
          avatar_url?: string | null
          billing_address?: Json | null
          payment_method?: Json | null
        }
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
          id: string
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
      }
      prices: {
        Row: {
          id: string
          product_id: string | null
          active: boolean | null
          description: string | null
          unit_amount: number | null
          currency: string | null
          type: 'one_time' | 'recurring' | null
          interval: 'day' | 'week' | 'month' | 'year' | null
          interval_count: number | null
          trial_period_days: number | null
          metadata: Json | null
        }
        Insert: {
          id: string
          product_id?: string | null
          active?: boolean | null
          description?: string | null
          unit_amount?: number | null
          currency?: string | null
          type?: 'one_time' | 'recurring' | null
          interval?: 'day' | 'week' | 'month' | 'year' | null
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
          type?: 'one_time' | 'recurring' | null
          interval?: 'day' | 'week' | 'month' | 'year' | null
          interval_count?: number | null
          trial_period_days?: number | null
          metadata?: Json | null
        }
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          status: 'trialing' | 'active' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'past_due' | 'unpaid' | 'paused' | null
          metadata: Json | null
          price_id: string | null
          quantity: number | null
          cancel_at_period_end: boolean | null
          created: string
          current_period_start: string
          current_period_end: string
          ended_at: string | null
          cancel_at: string | null
          canceled_at: string | null
          trial_start: string | null
          trial_end: string | null
        }
        Insert: {
          id: string
          user_id: string
          status?: 'trialing' | 'active' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'past_due' | 'unpaid' | 'paused' | null
          metadata?: Json | null
          price_id?: string | null
          quantity?: number | null
          cancel_at_period_end?: boolean | null
          created?: string
          current_period_start?: string
          current_period_end?: string
          ended_at?: string | null
          cancel_at?: string | null
          canceled_at?: string | null
          trial_start?: string | null
          trial_end?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          status?: 'trialing' | 'active' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'past_due' | 'unpaid' | 'paused' | null
          metadata?: Json | null
          price_id?: string | null
          quantity?: number | null
          cancel_at_period_end?: boolean | null
          created?: string
          current_period_start?: string
          current_period_end?: string
          ended_at?: string | null
          cancel_at?: string | null
          canceled_at?: string | null
          trial_start?: string | null
          trial_end?: string | null
        }
      }
      organizations: {
        Row: {
          id: string
          name: string
          owner_id: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          owner_id: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          owner_id?: string
          created_at?: string
        }
      }
      organization_members: {
        Row: {
          org_id: string
          user_id: string
          role: 'owner' | 'admin' | 'editor' | 'viewer'
          created_at: string
        }
        Insert: {
          org_id: string
          user_id: string
          role: 'owner' | 'admin' | 'editor' | 'viewer'
          created_at?: string
        }
        Update: {
          org_id?: string
          user_id?: string
          role?: 'owner' | 'admin' | 'editor' | 'viewer'
          created_at?: string
        }
      }
      invites: {
        Row: {
          id: string
          org_id: string
          email: string
          role: 'admin' | 'editor' | 'viewer'
          token: string
          status: 'pending' | 'accepted' | 'expired'
          created_by: string
          created_at: string
          expires_at: string
        }
        Insert: {
          id?: string
          org_id: string
          email: string
          role: 'admin' | 'editor' | 'viewer'
          token: string
          status?: 'pending' | 'accepted' | 'expired'
          created_by: string
          created_at?: string
          expires_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          email?: string
          role?: 'admin' | 'editor' | 'viewer'
          token?: string
          status?: 'pending' | 'accepted' | 'expired'
          created_by?: string
          created_at?: string
          expires_at?: string
        }
      }
      record_types: {
        Row: {
          id: string
          key: string
          display_name: string
          description: string | null
          config: Json
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          key: string
          display_name: string
          description?: string | null
          config?: Json
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          key?: string
          display_name?: string
          description?: string | null
          config?: Json
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      records: {
        Row: {
          id: string
          type_id: string
          org_id: string | null
          user_id: string | null
          created_by: string
          data: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          type_id: string
          org_id?: string | null
          user_id?: string | null
          created_by: string
          data?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          type_id?: string
          org_id?: string | null
          user_id?: string | null
          created_by?: string
          data?: Json
          created_at?: string
          updated_at?: string
        }
      }
      reminders: {
        Row: {
          id: string
          org_id: string
          record_id: string | null
          title: string
          notes: string | null
          due_at: string | null
          priority: 'low' | 'medium' | 'high' | 'urgent'
          status: 'pending' | 'sent' | 'completed' | 'snoozed' | 'cancelled'
          created_by: string
          created_at: string
          updated_at: string
          snoozed_until: string | null
          completed_at: string | null
        }
        Insert: {
          id?: string
          org_id: string
          record_id?: string | null
          title: string
          notes?: string | null
          due_at?: string | null
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          status?: 'pending' | 'sent' | 'completed' | 'snoozed' | 'cancelled'
          created_by: string
          created_at?: string
          updated_at?: string
          snoozed_until?: string | null
          completed_at?: string | null
        }
        Update: {
          id?: string
          org_id?: string
          record_id?: string | null
          title?: string
          notes?: string | null
          due_at?: string | null
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          status?: 'pending' | 'sent' | 'completed' | 'snoozed' | 'cancelled'
          created_by?: string
          created_at?: string
          updated_at?: string
          snoozed_until?: string | null
          completed_at?: string | null
        }
      }
      schedules: {
        Row: {
          id: string
          org_id: string
          name: string
          description: string | null
          cron: string | null
          rule: Json | null
          active: boolean
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          org_id: string
          name: string
          description?: string | null
          cron?: string | null
          rule?: Json | null
          active?: boolean
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          name?: string
          description?: string | null
          cron?: string | null
          rule?: Json | null
          active?: boolean
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      notifications_outbox: {
        Row: {
          id: string
          org_id: string
          event: string
          payload: Json
          status: 'pending' | 'delivered' | 'failed'
          attempt_count: number
          created_at: string
          delivered_at: string | null
          error_message: string | null
        }
        Insert: {
          id?: string
          org_id: string
          event: string
          payload: Json
          status?: 'pending' | 'delivered' | 'failed'
          attempt_count?: number
          created_at?: string
          delivered_at?: string | null
          error_message?: string | null
        }
        Update: {
          id?: string
          org_id?: string
          event?: string
          payload?: Json
          status?: 'pending' | 'delivered' | 'failed'
          attempt_count?: number
          created_at?: string
          delivered_at?: string | null
          error_message?: string | null
        }
      }
      audit_logs: {
        Row: {
          id: string
          org_id: string
          actor_id: string
          action: string
          entity_type: string
          entity_id: string
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          org_id: string
          actor_id: string
          action: string
          entity_type: string
          entity_id: string
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          actor_id?: string
          action?: string
          entity_type?: string
          entity_id?: string
          metadata?: Json | null
          created_at?: string
        }
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

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]

// Helper types for common use cases
export type Product = Tables<'products'>
export type Price = Tables<'prices'>
export type Subscription = Tables<'subscriptions'>
export type User = Tables<'users'>
export type Organization = Tables<'organizations'>
export type OrganizationMember = Tables<'organization_members'>
export type Invite = Tables<'invites'>
export type RecordType = Tables<'record_types'>
export type Record = Tables<'records'>
export type Reminder = Tables<'reminders'>
export type Schedule = Tables<'schedules'>
export type AuditLog = Tables<'audit_logs'>

// Extended types with relationships
export type ProductWithPrices = Product & {
  prices: Price[]
}

export type PriceWithProduct = Price & {
  products: Product
}

export type SubscriptionWithProduct = Subscription & {
  prices: PriceWithProduct[]
}

export type OrganizationWithMembers = Organization & {
  members: OrganizationMember[]
}

export type RecordWithType = Record & {
  record_types: RecordType
}

export type ReminderWithRecord = Reminder & {
  records?: Record | null
}
