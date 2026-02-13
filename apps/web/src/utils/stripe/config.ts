import Stripe from 'stripe';

/**
 * Centralized Stripe client for server-side operations
 * 
 * IMPORTANT: For any future Stripe API modifications, use the Stripe MCP Server tools
 * available in the AI assistant. This ensures proper API usage and reduces errors.
 * 
 * The MCP tools provide:
 * - Type-safe API calls
 * - Proper error handling
 * - Documentation integration
 * - Best practices enforcement
 * 
 * @see https://stripe.com/docs/api for official Stripe API documentation
 */
export const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY_LIVE ?? process.env.STRIPE_SECRET_KEY as string,
  {
    // https://github.com/stripe/stripe-node#configuration
    // https://stripe.com/docs/api/versioning
    apiVersion: '2023-10-16',
    // Register this as an official Stripe plugin.
    // https://stripe.com/docs/building-plugins#setappinfo
    appInfo: {
      name: 'LiNKdev Starter Kit',
      version: '1.0.0',
      url: 'https://github.com/linktrend/LiNKdev-Starter-Kit'
    }
  }
);

/**
 * Validates that Stripe is properly configured
 * @throws {Error} If Stripe secret key is missing
 */
export function validateStripeConfig(): void {
  if (!process.env.STRIPE_SECRET_KEY_LIVE && !process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY or STRIPE_SECRET_KEY_LIVE environment variable is required');
  }
}
