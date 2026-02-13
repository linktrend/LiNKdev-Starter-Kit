# Troubleshooting Guide

**Comprehensive troubleshooting guide for common issues in the LiNKdev Starter Kit**

---

## Table of Contents

1. [Environment Setup Issues](#environment-setup-issues)
2. [Build Errors](#build-errors)
3. [Type Errors (especially tRPC)](#type-errors-especially-trpc)
4. [Authentication Issues](#authentication-issues)
5. [Database Issues](#database-issues)
6. [Stripe/Billing Issues](#stripebilling-issues)
7. [MCP Issues](#mcp-issues)
8. [Development Server Issues](#development-server-issues)
9. [Test Failures](#test-failures)
10. [Deployment Issues](#deployment-issues)

---

## Environment Setup Issues

### Issue: Environment Variables Not Loading

**Symptoms:**
- `undefined` values for environment variables
- "Missing required environment variable" errors
- Variables work in terminal but not in app

**Common Causes:**
- `.env.local` file missing or in wrong location
- Typos in variable names (case-sensitive)
- Extra whitespace around values
- Dev server not restarted after changes
- Variables not exported in shell

**Step-by-Step Solutions:**

1. **Verify file location:**
   ```bash
   # Should be at:
   apps/web/.env.local
   
   # NOT at:
   .env.local  # root directory
   ```

2. **Check for typos:**
   ```bash
   # Variable names are case-sensitive
   NEXT_PUBLIC_SUPABASE_URL  # ✅ Correct
   next_public_supabase_url  # ❌ Wrong
   ```

3. **Remove whitespace:**
   ```bash
   # ❌ Wrong:
   NEXT_PUBLIC_SUPABASE_URL = "https://..."
   
   # ✅ Correct:
   NEXT_PUBLIC_SUPABASE_URL=https://...
   ```

4. **Restart dev server:**
   ```bash
   # Stop server (Ctrl+C)
   # Then restart:
   pnpm --filter ./apps/web dev
   ```

5. **Verify variables are loaded:**
   ```typescript
   // Add temporary log in your code:
   console.log('SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
   ```

**Prevention Tips:**
- Use `.env.example` as template
- Copy from `.env.example` instead of typing manually
- Use environment validation utility (see `apps/web/src/lib/env/validation.ts`)
- Never commit `.env.local` to git

---

### Issue: Supabase Connection Failed

**Symptoms:**
- "Failed to connect to Supabase" error
- 401 Unauthorized errors
- Timeout errors when querying database

**Common Causes:**
- Incorrect Supabase URL or keys
- Using wrong key type (anon vs service role)
- Expired or invalid keys
- Supabase project paused or deleted
- Network/firewall blocking connection

**Step-by-Step Solutions:**

1. **Verify URL format:**
   ```bash
   # Should be:
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   
   # NOT:
   NEXT_PUBLIC_SUPABASE_URL=https://supabase.com/dashboard/project/xxxxx
   ```

2. **Check key types:**
   ```bash
   # Public (anon) key - safe for browser:
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   
   # Service role key - SERVER-SIDE ONLY:
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

3. **Verify keys in Supabase Dashboard:**
   - Go to Project Settings → API
   - Copy keys directly from dashboard
   - Ensure no extra characters or whitespace

4. **Check project status:**
   - Go to Supabase Dashboard
   - Verify project is active (not paused)
   - Check project hasn't been deleted

5. **Test connection:**
   ```bash
   # Using MCP (if available):
   # Ping Supabase server
   
   # Or test in code:
   const { data, error } = await supabase.from('users').select('count');
   console.log('Connection test:', error || 'Success');
   ```

**Prevention Tips:**
- Store keys securely (never commit to git)
- Use different keys for dev/prod
- Rotate keys regularly
- Monitor Supabase dashboard for project status
- Use environment validation on startup

---

### Issue: Stripe Keys Not Working

**Symptoms:**
- "Invalid API key" errors from Stripe
- Webhook signature validation failures
- Test mode vs live mode confusion

**Common Causes:**
- Using wrong key type (secret vs publishable)
- Mixing test and live keys
- Missing webhook secret
- Incorrect key format

**Step-by-Step Solutions:**

1. **Verify key types:**
   ```bash
   # Secret key (server-side only):
   STRIPE_SECRET_KEY=your_stripe_secret_key_test  # Test mode (sk_test_...)
   STRIPE_SECRET_KEY=your_stripe_secret_key_live  # Live mode (sk_live_...)
   
   # Publishable key (client-side):
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key_test  # Test mode (pk_test_...)
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key_live  # Live mode (pk_live_...)
   ```

2. **Ensure matching modes:**
   ```bash
   # ✅ Correct - both test:
   STRIPE_SECRET_KEY=your_stripe_secret_key_test
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key_test
   
   # ❌ Wrong - mixed modes:
   STRIPE_SECRET_KEY=your_stripe_secret_key_test
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key_live
   ```

3. **Set webhook secret:**
   ```bash
   # For local development:
   # Run: stripe listen --forward-to localhost:3000/api/webhooks/stripe
   # Copy webhook secret from output:
   STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
   ```

4. **Verify keys in Stripe Dashboard:**
   - Go to Developers → API keys
   - Copy keys directly from dashboard
   - Ensure keys match your mode (test/live)

**Prevention Tips:**
- Use test keys for development
- Never commit Stripe keys to git
- Use environment validation utility
- Keep test and live keys separate
- Rotate keys if compromised

---

## Build Errors

### Issue: TypeScript Compilation Errors

**Symptoms:**
- Build fails with TypeScript errors
- "Property does not exist" errors
- Type mismatches in code

**Common Causes:**
- Stale type definitions
- Missing type imports
- Incorrect type annotations
- Supabase type inference issues
- Package dependency issues

**Step-by-Step Solutions:**

1. **Clear TypeScript cache:**
   ```bash
   rm -rf apps/web/tsconfig.tsbuildinfo
   rm -rf packages/api/tsconfig.tsbuildinfo
   rm -rf apps/web/.next
   ```

2. **Rebuild packages:**
   ```bash
   # Build API package first:
   cd packages/api && pnpm build
   
   # Then build web app:
   cd ../../apps/web && pnpm build
   ```

3. **Regenerate database types:**
   ```bash
   pnpm --filter ./apps/web supabase:types
   ```

4. **Check for missing imports:**
   ```typescript
   // Ensure all types are imported:
   import type { Database } from '@/types/supabase';
   import type { AppRouter } from '@starter/api';
   ```

5. **Restart TypeScript server:**
   - VS Code/Cursor: `Cmd+Shift+P` → "TypeScript: Restart TS Server"

**Prevention Tips:**
- Run `pnpm typecheck` before committing
- Keep database types up to date
- Use consistent type imports
- Avoid `any` types where possible

---

### Issue: Module Resolution Errors

**Symptoms:**
- "Cannot find module '@starter/api'"
- "Module not found" errors
- Import paths not resolving

**Common Causes:**
- Missing package symlinks
- Incorrect tsconfig paths
- Package not built
- Workspace configuration issues

**Step-by-Step Solutions:**

1. **Verify symlinks:**
   ```bash
   ls -la apps/web/node_modules/@starter/api
   # Should show: @starter/api -> ../../../../packages/api
   ```

2. **Reinstall dependencies:**
   ```bash
   pnpm install
   ```

3. **Check tsconfig paths:**
   ```json
   // apps/web/tsconfig.json
   {
     "compilerOptions": {
       "paths": {
         "@starter/api": ["../packages/api/src"],
         "@starter/api/*": ["../packages/api/src/*"]
       }
     }
   }
   ```

4. **Verify Next.js config:**
   ```javascript
   // apps/web/next.config.mjs
   {
     transpilePackages: ['@starter/api', '@starter/types']
   }
   ```

5. **Build API package:**
   ```bash
   cd packages/api && pnpm build
   ```

**Prevention Tips:**
- Use pnpm workspaces correctly
- Keep tsconfig paths consistent
- Build API package before web app
- Verify symlinks after `pnpm install`

---

### Issue: Build Fails with "Out of Memory"

**Symptoms:**
- Build process crashes
- "JavaScript heap out of memory" error
- Build hangs indefinitely

**Common Causes:**
- Large codebase
- Too many dependencies
- Insufficient Node.js memory
- Memory leaks in build process

**Step-by-Step Solutions:**

1. **Increase Node.js memory:**
   ```bash
   # Set NODE_OPTIONS:
   export NODE_OPTIONS="--max-old-space-size=4096"
   
   # Or in package.json:
   "scripts": {
     "build": "NODE_OPTIONS='--max-old-space-size=4096' next build"
   }
   ```

2. **Use Turbo for parallel builds:**
   ```bash
   pnpm turbo build
   ```

3. **Build packages separately:**
   ```bash
   # Build API first:
   pnpm --filter @starter/api build
   
   # Then web app:
   pnpm --filter ./apps/web build
   ```

4. **Clear caches:**
   ```bash
   rm -rf apps/web/.next
   rm -rf node_modules/.cache
   pnpm store prune
   ```

**Prevention Tips:**
- Use incremental builds
- Keep dependencies minimal
- Monitor memory usage
- Use Turbo for monorepo builds

---

## Type Errors (especially tRPC)

### Issue: "Property 'X' does not exist on type 'any'"

**Symptoms:**
```typescript
api.billing.getPlans.useQuery();
//  ^^^^^^^ Property 'billing' does not exist on type 'any'
```

**Common Causes:**
- TRPC client using `any` instead of `AppRouter`
- Missing type exports
- TypeScript server needs restart

**Step-by-Step Solutions:**

1. **Check TRPC client setup:**
   ```typescript
   // apps/web/src/trpc/react.tsx
   // Should be:
   export const api = createTRPCReact<AppRouter>();
   
   // NOT:
   export const api = createTRPCReact<any>();
   ```

2. **Verify type exports:**
   ```typescript
   // apps/web/src/trpc/types.ts
   // Should be:
   export type { AppRouter } from '@starter/api';
   
   // NOT:
   export type AppRouter = any;
   ```

3. **Rebuild API package:**
   ```bash
   cd packages/api && pnpm build
   ```

4. **Restart TypeScript server:**
   - VS Code/Cursor: `Cmd+Shift+P` → "TypeScript: Restart TS Server"

**Prevention Tips:**
- Never use `any` for TRPC client
- Keep API package built
- Use proper type exports
- Restart TS server after API changes

---

### Issue: Types are Stale After API Changes

**Symptoms:**
- Added new procedure but web app doesn't see it
- Autocomplete not showing new procedures
- Type errors for new API endpoints

**Common Causes:**
- API package not rebuilt
- TypeScript cache stale
- Next.js cache needs clearing

**Step-by-Step Solutions:**

1. **Rebuild API package:**
   ```bash
   cd packages/api && pnpm build
   ```

2. **Clear TypeScript cache:**
   ```bash
   cd apps/web
   rm -rf node_modules/.cache
   rm -rf .next
   rm -rf tsconfig.tsbuildinfo
   ```

3. **Restart TypeScript server:**
   - VS Code/Cursor: `Cmd+Shift+P` → "TypeScript: Restart TS Server"

4. **Verify Next.js config:**
   ```javascript
   // apps/web/next.config.mjs
   {
     transpilePackages: ['@starter/api', '@starter/types']
   }
   ```

**Prevention Tips:**
- Always rebuild API after adding procedures
- Use Turbo to ensure build order
- Clear caches when types seem stale
- Restart TS server after API changes

---

### Issue: "Type too complex to serialize"

**Symptoms:**
```
error TS7056: The inferred type of this node exceeds the maximum length 
the compiler will serialize. An explicit type annotation is needed.
```

**Common Causes:**
- TRPC router types too complex for declaration files
- Trying to generate `.d.ts` files

**Step-by-Step Solutions:**

1. **Use source files (not declaration files):**
   ```json
   // packages/api/package.json
   {
     "types": "./src/index.ts"
   }
   ```

2. **Do NOT generate `.d.ts` files:**
   - TRPC routers exceed TypeScript's serialization limits
   - Using source files is the recommended approach

3. **Let Next.js transpile:**
   - Next.js will transpile source files automatically
   - No need for declaration files

**Prevention Tips:**
- Always use source files for TRPC types
- Never try to generate declaration files
- This is expected behavior for TRPC monorepos

---

### Issue: Autocomplete Not Working

**Symptoms:**
- No suggestions when typing `api.`
- No IntelliSense for TRPC procedures
- Types not showing in editor

**Common Causes:**
- TypeScript server needs restart
- Wrong import path
- AppRouter not properly exported
- Build order issue

**Step-by-Step Solutions:**

1. **Restart TypeScript server:**
   - VS Code/Cursor: `Cmd+Shift+P` → "TypeScript: Restart TS Server"

2. **Check import path:**
   ```typescript
   // Should be:
   import { api } from '@/trpc/react';
   
   // NOT:
   import { api } from '@trpc/react';
   ```

3. **Verify AppRouter export:**
   ```typescript
   // packages/api/src/root.ts
   export type AppRouter = typeof appRouter;
   ```

4. **Build API package:**
   ```bash
   cd packages/api && pnpm build
   ```

5. **Check module resolution:**
   ```bash
   ls -la apps/web/node_modules/@starter/api
   # Should be a symlink
   ```

**Prevention Tips:**
- Restart TS server after API changes
- Use correct import paths
- Keep API package built
- Verify exports are correct

---

## Authentication Issues

### Issue: User Cannot Log In

**Symptoms:**
- Login form submits but nothing happens
- "Invalid credentials" error
- Redirect loops

**Common Causes:**
- Incorrect email/password
- User account not confirmed
- Supabase auth configuration issues
- Session cookie problems

**Step-by-Step Solutions:**

1. **Verify credentials:**
   - Check email/password are correct
   - Try password reset if needed

2. **Check email confirmation:**
   ```sql
   -- In Supabase SQL Editor:
   SELECT email, email_confirmed_at 
   FROM auth.users 
   WHERE email = 'user@example.com';
   ```

3. **Manually confirm email (if needed):**
   ```sql
   UPDATE auth.users 
   SET email_confirmed_at = NOW() 
   WHERE email = 'user@example.com';
   ```

4. **Check Supabase auth settings:**
   - Go to Authentication → Settings
   - Verify email confirmation is enabled/disabled as needed
   - Check redirect URLs are configured

5. **Clear browser cookies:**
   - Clear cookies for localhost
   - Try incognito/private mode

**Prevention Tips:**
- Test auth flows regularly
- Keep Supabase auth settings documented
- Use test accounts for development
- Monitor auth logs in Supabase dashboard

---

### Issue: Session Not Persisting

**Symptoms:**
- User logged out after page refresh
- Session expires immediately
- Cookies not being set

**Common Causes:**
- Cookie settings incorrect
- SameSite cookie issues
- Domain mismatch
- Session storage configuration

**Step-by-Step Solutions:**

1. **Check cookie settings:**
   ```typescript
   // apps/web/src/lib/supabase/server.ts
   createServerClient({
     cookies: {
       get(name: string) { ... },
       set(name: string, value: string, options) {
         // Ensure SameSite and Secure are set correctly
         options.sameSite = 'lax';
         options.secure = process.env.NODE_ENV === 'production';
       }
     }
   });
   ```

2. **Verify domain settings:**
   - Ensure cookies are set for correct domain
   - Check for domain mismatches

3. **Check browser settings:**
   - Disable "Block third-party cookies"
   - Check browser privacy settings

4. **Test in different browsers:**
   - Some browsers have stricter cookie policies

**Prevention Tips:**
- Use consistent cookie settings
- Test in multiple browsers
- Document cookie requirements
- Handle cookie errors gracefully

---

### Issue: OAuth Provider Not Working

**Symptoms:**
- OAuth redirect fails
- "Invalid redirect URI" error
- Provider returns error

**Common Causes:**
- Redirect URI not configured in provider
- OAuth app credentials incorrect
- Provider settings mismatch

**Step-by-Step Solutions:**

1. **Verify redirect URI in provider:**
   ```bash
   # For GitHub:
   http://localhost:3000/auth/callback/github
   
   # For Google:
   http://localhost:3000/auth/callback/google
   ```

2. **Check OAuth app settings:**
   - Go to provider's developer console
   - Verify client ID and secret
   - Check redirect URIs match exactly

3. **Verify Supabase OAuth settings:**
   - Go to Authentication → Providers
   - Enable provider
   - Enter client ID and secret
   - Check redirect URL matches

4. **Test with provider's test mode:**
   - Some providers have test/sandbox modes
   - Use test credentials for development

**Prevention Tips:**
- Document OAuth setup for each provider
- Use test credentials for development
- Keep redirect URIs consistent
- Test OAuth flows regularly

---

## Database Issues

### Issue: Migration Failed

**Symptoms:**
- SQL errors when running migration
- "Table already exists" errors
- Constraint violations

**Common Causes:**
- Syntax errors in SQL
- Missing dependencies (tables/functions)
- Conflicting constraints
- RLS policy errors

**Step-by-Step Solutions:**

1. **Review error message:**
   - Read full error message
   - Identify specific SQL issue

2. **Check for syntax errors:**
   ```sql
   -- Common issues:
   -- Missing semicolons
   -- Unclosed quotes
   -- Invalid SQL keywords
   ```

3. **Verify dependencies:**
   ```sql
   -- Check if referenced tables exist:
   SELECT * FROM information_schema.tables 
   WHERE table_name = 'referenced_table';
   ```

4. **Fix migration SQL:**
   - Correct syntax errors
   - Add missing dependencies
   - Fix constraint conflicts

5. **Create new migration with fix:**
   ```bash
   # Don't modify existing migrations
   # Create new migration:
   # 20250122120000_fix_previous_migration.sql
   ```

6. **Apply new migration:**
   - Use Supabase Dashboard SQL Editor
   - Or MCP tools if available

**Prevention Tips:**
- Test migrations on dev database first
- Use `IF NOT EXISTS` for idempotency
- Review SQL before applying
- Keep migrations small and focused

---

### Issue: RLS Blocking Queries

**Symptoms:**
- Queries return empty results
- "Permission denied" errors
- Data exists but not accessible

**Common Causes:**
- User not authenticated
- RLS policies too restrictive
- Missing policies for operation
- Policy conditions incorrect

**Step-by-Step Solutions:**

1. **Verify user is authenticated:**
   ```typescript
   const { data: { user } } = await supabase.auth.getUser();
   if (!user) {
     // User not authenticated
   }
   ```

2. **Check RLS is enabled:**
   ```sql
   SELECT tablename, rowsecurity
   FROM pg_tables
   WHERE schemaname = 'public'
   AND tablename = 'your_table';
   ```

3. **Review RLS policies:**
   ```sql
   SELECT * FROM pg_policies
   WHERE schemaname = 'public'
   AND tablename = 'your_table';
   ```

4. **Test with service role (bypasses RLS):**
   ```typescript
   // Use service role key for testing:
   const supabase = createClient(
     process.env.NEXT_PUBLIC_SUPABASE_URL!,
     process.env.SUPABASE_SERVICE_ROLE_KEY!  // Bypasses RLS
   );
   ```

5. **Fix policy conditions:**
   ```sql
   -- Example: Allow users to see own records
   CREATE POLICY "Users can view own records"
   ON public.records FOR SELECT
   USING (auth.uid() = user_id);
   ```

**Prevention Tips:**
- Test RLS policies thoroughly
- Document policy requirements
- Use service role only for testing
- Review policies after schema changes

---

### Issue: Type Generation Failed

**Symptoms:**
- `supabase:types` command fails
- Generated types are incomplete
- Type errors after regeneration

**Common Causes:**
- Supabase CLI not installed
- Project not linked to cloud
- Database inaccessible
- Schema syntax errors

**Step-by-Step Solutions:**

1. **Verify Supabase CLI:**
   ```bash
   supabase --version
   # Should show version number
   ```

2. **Install/update CLI:**
   ```bash
   npm install -g supabase
   ```

3. **Link project to cloud:**
   ```bash
   supabase link --project-ref <project-ref>
   # Get project-ref from Supabase dashboard URL
   ```

4. **Test database connection:**
   ```bash
   # Try querying database:
   supabase db pull
   ```

5. **Regenerate types:**
   ```bash
   pnpm --filter ./apps/web supabase:types
   ```

6. **Check for schema errors:**
   - Review Supabase dashboard for errors
   - Fix any syntax issues in schema

**Prevention Tips:**
- Keep Supabase CLI updated
- Link project correctly
- Regenerate types after migrations
- Verify types after generation

---

## Stripe/Billing Issues

### Issue: Webhook Not Receiving Events

**Symptoms:**
- Subscription updates not reflected
- "Invalid signature" errors
- Webhook endpoint not called

**Common Causes:**
- Stripe CLI not running (local)
- Webhook secret incorrect
- Endpoint URL wrong
- Events not selected in Stripe

**Step-by-Step Solutions:**

1. **Start Stripe CLI (local dev):**
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

2. **Copy webhook secret:**
   - From Stripe CLI output: `whsec_...`
   - Add to `.env.local`: `STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret`

3. **Restart dev server:**
   ```bash
   # After updating webhook secret
   pnpm --filter ./apps/web dev
   ```

4. **Verify endpoint is accessible:**
   ```bash
   curl http://localhost:3000/api/webhooks/stripe
   # Should return 405 Method Not Allowed (not 404)
   ```

5. **Check Stripe dashboard (production):**
   - Go to Developers → Webhooks
   - Verify endpoint URL is correct
   - Check events are selected
   - View webhook logs for errors

**Prevention Tips:**
- Keep Stripe CLI running during development
- Use different webhook secrets for dev/prod
- Monitor webhook logs in Stripe dashboard
- Test webhook handler with test events

---

### Issue: Subscription Status Not Updating

**Symptoms:**
- User subscribed but status shows "free"
- Features not unlocked after payment
- Subscription data out of sync

**Common Causes:**
- Webhook not processed
- Database update failed
- Race condition
- Stripe data not synced

**Step-by-Step Solutions:**

1. **Check webhook logs:**
   ```bash
   # Local: Check Stripe CLI output
   # Production: Check Stripe dashboard → Webhooks → Logs
   ```

2. **Verify database record:**
   ```sql
   SELECT * FROM org_subscriptions 
   WHERE org_id = 'org-uuid';
   ```

3. **Check Stripe subscription:**
   ```bash
   # Using Stripe CLI:
   stripe subscriptions retrieve sub_xxx
   ```

4. **Manually sync (if needed):**
   ```typescript
   // Create sync endpoint or use Stripe dashboard
   // to manually trigger webhook
   ```

5. **Review webhook handler:**
   ```typescript
   // apps/web/src/app/api/webhooks/stripe/route.ts
   // Ensure handler updates database correctly
   ```

**Prevention Tips:**
- Monitor webhook processing
- Add logging to webhook handler
- Handle webhook failures gracefully
- Implement webhook retry logic

---

### Issue: Checkout Session Creation Fails

**Symptoms:**
- "Failed to create checkout session" error
- Checkout page doesn't load
- Stripe API errors

**Common Causes:**
- Invalid price ID
- Missing required parameters
- Stripe API key issues
- Organization context missing

**Step-by-Step Solutions:**

1. **Verify price IDs:**
   ```bash
   # Check .env.local:
   STRIPE_PRICE_PRO_MONTHLY=price_xxx
   STRIPE_PRICE_PRO_ANNUAL=price_xxx
   
   # Verify in Stripe dashboard:
   # Products → Prices → Copy Price ID
   ```

2. **Check required parameters:**
   ```typescript
   // Ensure all required fields are provided:
   stripe.checkout.sessions.create({
     customer: customerId,
     line_items: [{ price: priceId, quantity: 1 }],
     mode: 'subscription',
     success_url: successUrl,
     cancel_url: cancelUrl,
   });
   ```

3. **Verify Stripe API key:**
   ```bash
   # Test with Stripe CLI:
   stripe prices list
   ```

4. **Check organization context:**
   ```typescript
   // Ensure org_id is valid and user is owner
   const org = await getOrganization(orgId);
   if (!org || org.owner_id !== userId) {
     throw new Error('Unauthorized');
   }
   ```

**Prevention Tips:**
- Validate price IDs on startup
- Use environment validation
- Test checkout flow regularly
- Handle Stripe API errors gracefully

---

## MCP Issues

### Issue: MCP Servers Not Connecting

**Symptoms:**
- "MCP server not found" errors
- Tools not available in Cursor
- Server connection timeouts

**Common Causes:**
- Environment variables not exported
- MCP configuration incorrect
- Cursor not restarted after config changes
- Server path incorrect

**Step-by-Step Solutions:**

1. **Export environment variables:**
   ```bash
   # Add to ~/.zshrc or ~/.bashrc:
   export SUPABASE_URL=https://xxx.supabase.co
   export SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   export STRIPE_SECRET_KEY=your_stripe_secret_key_test
   ```

2. **Restart Cursor completely:**
   ```bash
   # Quit Cursor (Cmd+Q on Mac)
   # Then relaunch from terminal:
   open -a Cursor
   ```

3. **Verify MCP configuration:**
   ```json
   // .cursor/mcp.json
   {
     "mcpServers": {
       "supabase": {
         "command": "node",
         "args": ["mcp/servers/supabase/index.js"],
         "env": {
           "SUPABASE_URL": "${SUPABASE_URL}",
           "SUPABASE_SERVICE_ROLE_KEY": "${SUPABASE_SERVICE_ROLE_KEY}"
         }
       }
     }
   }
   ```

4. **Check server logs:**
   - Open Cursor Developer Tools
   - Check MCP server logs for errors

5. **Test server manually:**
   ```bash
   # Test server directly:
   node mcp/servers/supabase/index.js
   ```

**Prevention Tips:**
- Export env vars in shell profile
- Restart Cursor after config changes
- Keep MCP config documented
- Test servers independently

---

### Issue: MCP Tools Not Working

**Symptoms:**
- Tool calls fail
- "Invalid arguments" errors
- Tools return empty results

**Common Causes:**
- Incorrect tool arguments
- API permissions insufficient
- Service unavailable
- Authentication failures

**Step-by-Step Solutions:**

1. **Test with ping first:**
   ```bash
   # Use ping tool to verify connection
   ```

2. **Check tool arguments:**
   ```json
   // Verify required parameters:
   {
     "query": "SELECT * FROM users LIMIT 10"
   }
   ```

3. **Verify API permissions:**
   - Check API keys have correct permissions
   - Verify service role key is used (not anon key)

4. **Check service status:**
   - Supabase: Check dashboard for status
   - Stripe: Check status page

5. **Review tool implementation:**
   ```javascript
   // Check tool handler for errors
   // mcp/servers/supabase/index.js
   ```

**Prevention Tips:**
- Test tools with simple queries first
- Verify API permissions
- Handle errors gracefully
- Document tool usage

---

## Development Server Issues

### Issue: Dev Server Won't Start

**Symptoms:**
- Server fails to start
- Port already in use error
- Startup crashes immediately

**Common Causes:**
- Port 3000 already in use
- Missing environment variables
- Dependency issues
- Node.js version mismatch

**Step-by-Step Solutions:**

1. **Check for port conflict:**
   ```bash
   # Find process using port 3000:
   lsof -i :3000
   
   # Kill process:
   kill -9 <PID>
   
   # Or use different port:
   PORT=3001 pnpm dev
   ```

2. **Verify environment variables:**
   ```bash
   # Check .env.local exists:
   ls apps/web/.env.local
   
   # Verify required vars are set:
   cat apps/web/.env.local | grep SUPABASE_URL
   ```

3. **Check Node.js version:**
   ```bash
   node --version
   # Should be 18+ (LTS recommended)
   ```

4. **Reinstall dependencies:**
   ```bash
   rm -rf node_modules
   pnpm install
   ```

5. **Check for errors:**
   ```bash
   # Run with verbose output:
   pnpm --filter ./apps/web dev --debug
   ```

**Prevention Tips:**
- Use consistent Node.js version
- Keep dependencies updated
- Document port requirements
- Use environment validation

---

### Issue: Hot Reload Not Working

**Symptoms:**
- Changes not reflected in browser
- Manual refresh required
- Fast Refresh errors

**Common Causes:**
- File watcher issues
- Too many files
- Syntax errors preventing reload
- Browser cache

**Step-by-Step Solutions:**

1. **Check for syntax errors:**
   ```bash
   # Run typecheck:
   pnpm typecheck
   ```

2. **Restart dev server:**
   ```bash
   # Stop server (Ctrl+C)
   # Clear cache:
   rm -rf apps/web/.next
   # Restart:
   pnpm dev
   ```

3. **Check file watcher limits:**
   ```bash
   # macOS/Linux:
   echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
   sudo sysctl -p
   ```

4. **Clear browser cache:**
   - Hard refresh: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)
   - Or use incognito mode

5. **Check for circular dependencies:**
   - Review import structure
   - Fix circular imports

**Prevention Tips:**
- Fix syntax errors immediately
- Keep file structure organized
- Monitor file watcher limits
- Use Fast Refresh compatible patterns

---

### Issue: Server Crashes on Request

**Symptoms:**
- Server crashes when accessing certain pages
- Unhandled promise rejections
- Memory errors

**Common Causes:**
- Unhandled errors
- Memory leaks
- Infinite loops
- Missing error boundaries

**Step-by-Step Solutions:**

1. **Check server logs:**
   ```bash
   # Look for error stack traces
   # Identify failing code
   ```

2. **Add error handling:**
   ```typescript
   try {
     // Your code
   } catch (error) {
     console.error('Error:', error);
     // Handle error gracefully
   }
   ```

3. **Check for memory leaks:**
   ```bash
   # Monitor memory usage:
   node --inspect apps/web
   # Use Chrome DevTools to profile
   ```

4. **Add error boundaries:**
   ```tsx
   <ErrorBoundary fallback={<ErrorPage />}>
     <YourComponent />
   </ErrorBoundary>
   ```

5. **Review async code:**
   - Ensure all promises are handled
   - Use async/await correctly
   - Avoid unhandled rejections

**Prevention Tips:**
- Always handle errors
- Use error boundaries
- Monitor memory usage
- Test error scenarios

---

## Test Failures

### Issue: Tests Fail with "Cannot find module"

**Symptoms:**
- Import errors in tests
- Module resolution failures
- Type errors in test files

**Common Causes:**
- Test configuration incorrect
- Path aliases not resolved
- Missing test setup
- Type definitions missing

**Step-by-Step Solutions:**

1. **Check test configuration:**
   ```javascript
   // vitest.config.ts or jest.config.js
   {
     resolve: {
       alias: {
         '@': path.resolve(__dirname, './src'),
         '@starter/api': path.resolve(__dirname, '../packages/api/src')
       }
     }
   }
   ```

2. **Verify test setup file:**
   ```typescript
   // src/__tests__/setup.ts
   // Ensure setup runs before tests
   ```

3. **Install missing dependencies:**
   ```bash
   pnpm add -D @types/node @types/react
   ```

4. **Check import paths:**
   ```typescript
   // Use correct aliases:
   import { api } from '@/trpc/react';
   // Not:
   import { api } from '../../trpc/react';
   ```

**Prevention Tips:**
- Keep test config consistent
- Use path aliases in tests
- Document test setup
- Run tests before committing

---

### Issue: Integration Tests Fail

**Symptoms:**
- Database connection errors
- Test data not cleaned up
- Flaky test failures

**Common Causes:**
- Test database not configured
- Data isolation issues
- Async timing problems
- Missing test fixtures

**Step-by-Step Solutions:**

1. **Configure test database:**
   ```typescript
   // Use separate test database or transactions
   const testSupabase = createClient(
     process.env.TEST_SUPABASE_URL!,
     process.env.TEST_SUPABASE_KEY!
   );
   ```

2. **Clean up test data:**
   ```typescript
   beforeEach(async () => {
     // Clean up before each test
     await cleanupTestData();
   });
   
   afterEach(async () => {
     // Clean up after each test
     await cleanupTestData();
   });
   ```

3. **Fix async timing:**
   ```typescript
   // Use proper async/await:
   test('should create user', async () => {
     const user = await createUser();
     expect(user).toBeDefined();
   });
   ```

4. **Use test fixtures:**
   ```typescript
   // Create reusable test data:
   export const testUser = {
     email: 'test@example.com',
     password: 'TestPassword123!'
   };
   ```

**Prevention Tips:**
- Use test database for integration tests
- Clean up data between tests
- Use fixtures for consistency
- Handle async operations correctly

---

### Issue: E2E Tests Fail

**Symptoms:**
- Playwright tests timeout
- Elements not found
- Browser crashes

**Common Causes:**
- Selectors changed
- Timing issues
- Browser not installed
- Test environment not set up

**Step-by-Step Solutions:**

1. **Install Playwright browsers:**
   ```bash
   pnpm exec playwright install
   ```

2. **Check selectors:**
   ```typescript
   // Use stable selectors:
   await page.getByRole('button', { name: 'Submit' }).click();
   // Not:
   await page.click('.btn-submit');  // May change
   ```

3. **Add proper waits:**
   ```typescript
   // Wait for elements:
   await page.waitForSelector('[data-testid="submit"]');
   await page.click('[data-testid="submit"]');
   ```

4. **Verify test environment:**
   ```bash
   # Ensure dev server is running:
   pnpm dev
   
   # In another terminal:
   pnpm test:e2e
   ```

5. **Check for flakiness:**
   ```typescript
   // Use retries for flaky tests:
   test('flaky test', async ({ page }) => {
     // Test code
   }, { retries: 2 });
   ```

**Prevention Tips:**
- Use data-testid for stable selectors
- Add proper waits
- Keep browsers updated
- Run tests in CI consistently

---

## Deployment Issues

### Issue: Build Fails in Production

**Symptoms:**
- Build succeeds locally but fails in CI/CD
- Environment variable errors
- Type errors in production build

**Common Causes:**
- Missing environment variables
- Different Node.js versions
- Build cache issues
- Production-specific errors

**Step-by-Step Solutions:**

1. **Verify environment variables:**
   ```bash
   # Check all required vars are set in deployment platform
   # Vercel: Project Settings → Environment Variables
   # Other platforms: Check their docs
   ```

2. **Match Node.js version:**
   ```json
   // package.json
   {
     "engines": {
       "node": "18.x"
     }
   }
   ```

3. **Clear build cache:**
   ```bash
   # In CI/CD:
   # Clear cache and rebuild
   ```

4. **Check build logs:**
   - Review full build output
   - Identify specific error
   - Compare with local build

5. **Test production build locally:**
   ```bash
   # Simulate production:
   NODE_ENV=production pnpm build
   ```

**Prevention Tips:**
- Set all env vars in deployment platform
- Match Node.js versions
- Test production builds locally
- Monitor build logs

---

### Issue: Environment Variables Not Available

**Symptoms:**
- Variables undefined in production
- Different values than expected
- Secrets not loading

**Common Causes:**
- Variables not set in platform
- Wrong variable names
- Build-time vs runtime variables
- Secrets not configured

**Step-by-Step Solutions:**

1. **Verify variables in platform:**
   ```bash
   # Vercel: Project Settings → Environment Variables
   # Ensure all required vars are set
   ```

2. **Check variable names:**
   ```bash
   # Ensure names match exactly (case-sensitive)
   NEXT_PUBLIC_SUPABASE_URL  # ✅
   next_public_supabase_url  # ❌
   ```

3. **Distinguish build vs runtime:**
   ```bash
   # Build-time (available during build):
   NEXT_PUBLIC_* variables
   
   # Runtime (available in server):
   All other variables
   ```

4. **Restart deployment:**
   ```bash
   # After adding variables, redeploy
   ```

5. **Verify in runtime:**
   ```typescript
   // Add temporary log:
   console.log('Env check:', {
     url: process.env.NEXT_PUBLIC_SUPABASE_URL,
     key: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'set' : 'missing'
   });
   ```

**Prevention Tips:**
- Document all required variables
- Use environment validation
- Test variables in staging first
- Keep secrets secure

---

### Issue: Database Connection Fails in Production

**Symptoms:**
- Production app can't connect to Supabase
- 401/403 errors
- Timeout errors

**Common Causes:**
- Wrong Supabase URL/keys
- IP restrictions
- Network issues
- Service role key exposed

**Step-by-Step Solutions:**

1. **Verify Supabase credentials:**
   ```bash
   # Check production env vars match Supabase project
   ```

2. **Check IP restrictions:**
   - Go to Supabase Dashboard → Settings → Database
   - Ensure deployment platform IPs are allowed
   - Or disable IP restrictions for testing

3. **Verify network access:**
   ```bash
   # Test connection from deployment platform
   # Use Supabase dashboard to check connection logs
   ```

4. **Check key types:**
   ```bash
   # Ensure using correct keys:
   # - Anon key for client-side
   # - Service role key for server-side only
   ```

5. **Review RLS policies:**
   - Ensure policies work for production users
   - Test with production data

**Prevention Tips:**
- Use different Supabase projects for dev/prod
- Document IP restrictions
- Monitor connection logs
- Test database access before deployment

---

## Quick Reference

### Common Commands

```bash
# Environment
pnpm install                    # Install dependencies
pnpm --filter ./apps/web dev    # Start dev server

# Building
pnpm build                      # Build all packages
cd packages/api && pnpm build  # Build API package
cd apps/web && pnpm build      # Build web app

# Type Checking
pnpm typecheck                  # Check all types
cd packages/api && pnpm typecheck
cd apps/web && pnpm typecheck

# Database
pnpm --filter ./apps/web supabase:types  # Generate types

# Testing
pnpm test                       # Run unit tests
pnpm test:integration          # Run integration tests
pnpm test:e2e                  # Run E2E tests

# Cleaning
rm -rf apps/web/.next          # Clear Next.js cache
rm -rf node_modules/.cache     # Clear node cache
rm -rf tsconfig.tsbuildinfo    # Clear TS cache
```

### File Locations

- **Environment:** `apps/web/.env.local`
- **TRPC Client:** `apps/web/src/trpc/react.tsx`
- **TRPC Types:** `apps/web/src/trpc/types.ts`
- **API Routers:** `packages/api/src/routers/`
- **Database Types:** `apps/web/src/types/supabase.ts`
- **MCP Config:** `.cursor/mcp.json`

### Getting Help

- **Troubleshooting:** This guide
- **Development:** [DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md)
- **Database:** [DATABASE.md](./DATABASE.md)
- **TRPC Types:** [../TRPC_TYPE_TROUBLESHOOTING.md](../TRPC_TYPE_TROUBLESHOOTING.md)
- **Environment Setup:** [../01_GETTING_STARTED/ENVIRONMENT_SETUP.md](../01_GETTING_STARTED/ENVIRONMENT_SETUP.md)

---

**Last Updated:** 2025-01-22
