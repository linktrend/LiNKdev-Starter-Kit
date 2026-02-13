/**
 * Environment variable validation utility
 * Validates required environment variables at application startup
 */

interface EnvVar {
  name: string;
  required: boolean;
  description: string;
  example?: string;
}

const ENV_VARS: EnvVar[] = [
  // Supabase
  {
    name: "NEXT_PUBLIC_SUPABASE_URL",
    required: true,
    description: "Supabase project URL",
    example: "https://xxxxx.supabase.co",
  },
  {
    name: "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    required: true,
    description: "Supabase anonymous/public key",
  },
  {
    name: "SUPABASE_SERVICE_ROLE_KEY",
    required: true,
    description:
      "Supabase service role key (for webhooks and admin operations)",
  },

  // Stripe
  {
    name: "STRIPE_SECRET_KEY",
    required: false,
    description: "Stripe secret key (test). Set this OR STRIPE_SECRET_KEY_LIVE.",
    example: "sk_test_...",
  },
  {
    name: "STRIPE_SECRET_KEY_LIVE",
    required: false,
    description: "Stripe secret key (live). Set this OR STRIPE_SECRET_KEY.",
    example: "sk_live_...",
  },
  {
    name: "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
    required: false,
    description:
      "Stripe publishable key (test). Set this OR NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_LIVE.",
    example: "pk_test_...",
  },
  {
    name: "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_LIVE",
    required: false,
    description:
      "Stripe publishable key (live). Set this OR NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.",
    example: "pk_live_...",
  },
  {
    name: "STRIPE_WEBHOOK_SECRET",
    required: true,
    description: "Stripe webhook signing secret",
    example: "whsec_...",
  },

  // Stripe Price IDs
  {
    name: "STRIPE_PRICE_PRO_MONTHLY",
    required: true,
    description: "Stripe price ID for Pro monthly plan",
    example: "price_...",
  },
  {
    name: "STRIPE_PRICE_PRO_ANNUAL",
    required: true,
    description: "Stripe price ID for Pro annual plan",
    example: "price_...",
  },
  {
    name: "STRIPE_PRICE_BUSINESS_MONTHLY",
    required: true,
    description: "Stripe price ID for Business monthly plan",
    example: "price_...",
  },
  {
    name: "STRIPE_PRICE_BUSINESS_ANNUAL",
    required: true,
    description: "Stripe price ID for Business annual plan",
    example: "price_...",
  },
  {
    name: "STRIPE_PRICE_FREE",
    required: false,
    description: "Stripe price ID for Free plan (optional)",
    example: "price_free",
  },

  // Application URLs
  {
    name: "NEXT_PUBLIC_SITE_URL",
    required: false,
    description: "Public site URL (for redirects)",
    example: "https://yourdomain.com",
  },
];

export function validateEnvironment(): void {
  const errors: string[] = [];
  const warnings: string[] = [];

  const hasStripeSecret =
    Boolean(process.env.STRIPE_SECRET_KEY?.trim()) ||
    Boolean(process.env.STRIPE_SECRET_KEY_LIVE?.trim());
  const hasStripePublishable =
    Boolean(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim()) ||
    Boolean(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_LIVE?.trim());

  for (const envVar of ENV_VARS) {
    const value = process.env[envVar.name];

    if (!value || value.trim() === "") {
      if (envVar.required) {
        const message = `Missing required environment variable: ${envVar.name}\n  Description: ${envVar.description}${
          envVar.example ? `\n  Example: ${envVar.example}` : ""
        }`;
        errors.push(message);
      } else {
        const message = `Missing optional environment variable: ${envVar.name}\n  Description: ${envVar.description}`;
        warnings.push(message);
      }
    }
  }

  if (!hasStripeSecret) {
    errors.push(
      "Missing Stripe secret key: set STRIPE_SECRET_KEY or STRIPE_SECRET_KEY_LIVE"
    );
  }
  if (!hasStripePublishable) {
    errors.push(
      "Missing Stripe publishable key: set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY or NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_LIVE"
    );
  }

  // Log warnings
  if (warnings.length > 0) {
    console.warn("\n⚠️  Environment Variable Warnings:\n");
    warnings.forEach((warning) => console.warn(`  ${warning}\n`));
  }

  // Throw errors
  if (errors.length > 0) {
    console.error("\n❌ Environment Variable Validation Failed:\n");
    errors.forEach((error) => console.error(`  ${error}\n`));
    console.error(
      "\nPlease check your .env.local file and ensure all required variables are set."
    );
    console.error("See .env.example for reference.\n");
    throw new Error(
      "Environment validation failed. Missing required environment variables."
    );
  }

  console.log("✅ Environment variables validated successfully");
}

/**
 * Get validated environment variables with type safety
 */
export function getEnv() {
  return {
    supabase: {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
      anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
    },
    stripe: {
      secretKey: process.env.STRIPE_SECRET_KEY ?? process.env.STRIPE_SECRET_KEY_LIVE!,
      publishableKey:
        process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ??
        process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_LIVE!,
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
      prices: {
        free: process.env.STRIPE_PRICE_FREE || "price_free",
        proMonthly: process.env.STRIPE_PRICE_PRO_MONTHLY!,
        proAnnual: process.env.STRIPE_PRICE_PRO_ANNUAL!,
        businessMonthly: process.env.STRIPE_PRICE_BUSINESS_MONTHLY!,
        businessAnnual: process.env.STRIPE_PRICE_BUSINESS_ANNUAL!,
      },
    },
    app: {
      siteUrl:
        process.env.NEXT_PUBLIC_SITE_URL ||
        process.env.NEXT_PUBLIC_APP_URL ||
        "http://localhost:3000",
    },
  };
}
