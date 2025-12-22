import type { Tables } from './db'

/**
 * Full Supabase `public.users` profile capturing contact, personal, and business details.
 * Includes optional onboarding flags and defaulted system fields used for RBAC decisions.
 */
export type UserProfile = Tables<'users'>

/**
 * Lightweight user snapshot for UI contexts where only identity fields are required.
 */
export type UserDetails = Pick<
  UserProfile,
  'id' | 'full_name' | 'avatar_url' | 'email' | 'username' | 'display_name'
>

/**
 * Product catalog entry from `public.products`.
 */
export type Product = Tables<'products'>

/**
 * Price entry from `public.prices`, scoped to a product and pricing interval/type.
 */
export type Price = Tables<'prices'>

/**
 * Organization-scoped subscription record from `public.org_subscriptions`.
 */
export type Subscription = Tables<'org_subscriptions'>

/**
 * Convenience shape that stitches subscription data to the price/product it references.
 */
export interface SubscriptionWithProduct extends Subscription {
  product?: Product | null
  price?: Price | null
}

/**
 * Product bundle with all available price points.
 */
export interface ProductWithPrices extends Product {
  prices: Price[]
}
