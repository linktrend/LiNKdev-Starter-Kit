# Project Structure Documentation

## Monorepo Layout

```
linkdev-starter-kit/
├── apps/
│   ├── web/                    # Next.js web application
│   └── mobile/                 # React Native mobile application
├── packages/
│   ├── ui/                     # Shared UI components and primitives
│   ├── config/                 # Shared configuration (Tailwind preset, etc.)
│   └── utils/                  # Shared utility functions
├── design/
│   └── DESIGN_TOKENS.json      # Design system tokens
└── docs/                       # Project documentation
```

## Design System Wiring

The design system follows a token-based approach:

1. **Design Tokens**: Defined in `/design/DESIGN_TOKENS.json`
2. **Tailwind Preset**: Consumed via `@starter/config/tailwind-preset`
3. **UI Primitives**: Available through `@starter/ui` package
4. **Application**: Uses Tailwind classes that map to design tokens

### Token Flow
```
DESIGN_TOKENS.json → tailwind-preset.js → Tailwind CSS → Application Components
```

## Web Application Routing

The web app uses Next.js App Router with the following route groups:

### Route Groups
- `(marketing)` - Landing page, pricing, blog, docs
- `(auth_forms)` - Sign up, sign in, password reset
- `(dashboard)` - Main dashboard and notifications
- `(app)` - Application features and settings
- `(org)` - Organization management
- `(admin)` - Admin panel
- `(console)` - Developer console (separate shell)

### Required Routes Inventory

#### Marketing Routes
- ✅ `src/app/(marketing)/page.tsx` - Landing page
- ✅ `src/app/(marketing)/pricing/page.tsx` - Pricing page
- ✅ `src/app/(marketing)/blog/page.tsx` - Blog listing
- ✅ `src/app/(marketing)/docs/page.tsx` - Documentation

#### Authentication Routes
- ✅ `src/app/(auth_forms)/signup/page.tsx` - User registration
- ✅ `src/app/(auth_forms)/signin/page.tsx` - User login

#### Dashboard Routes
- ✅ `src/app/(dashboard)/dashboard/page.tsx` - Main dashboard
- ✅ `src/app/(dashboard)/dashboard/notifications/page.tsx` - Notifications

#### Application Routes
- ✅ `src/app/(app)/settings/billing/page.tsx` - Billing management (known error remains)
- ✅ `src/app/(app)/settings/page.tsx` - Settings page
- ✅ `src/app/(app)/profile/page.tsx` - User profile

#### Admin Routes
- ✅ `src/app/(admin)/admin/page.tsx` - Admin panel

#### Developer Console Routes
- ✅ `src/app/(console)/console/page.tsx` - Console home
- ✅ `src/app/(console)/console/login/page.tsx` - Console login
- 🔄 `src/app/(console)/console/health/page.tsx` - System health (stub)
- 🔄 `src/app/(console)/console/db/page.tsx` - Database viewer (stub)
- 🔄 `src/app/(console)/console/env/page.tsx` - Environment management (stub)
- ℹ️ `src/app/(console)/console/config/page.tsx` - Configuration (includes Jobs/Queue and Feature Flags tabs)
- 🔄 `src/app/(console)/console/integrations/page.tsx` - Integrations (stub)
- 🔄 `src/app/(console)/console/automations/page.tsx` - Automations (stub)
- 🔄 `src/app/(console)/console/api/page.tsx` - API monitoring (stub)
- 🔄 `src/app/(console)/console/errors/page.tsx` - Error tracking (stub)
- 🔄 `src/app/(console)/console/analytics/page.tsx` - Usage metrics (stub)
- 🔄 `src/app/(console)/console/audit/page.tsx` - Audit logs (stub)
- 🔄 `src/app/(console)/console/security/page.tsx` - Security control (stub)

**Legend**: ✅ Implemented, 🔄 Stub/Placeholder

## Developer Console

The Developer Console is a separate shell with its own authentication and interface:

- **Separate Login**: Independent authentication flow
- **System Administration**: Health monitoring, database management, job control
- **Configuration Management**: Feature flags, environment settings
- **Integration Hub**: Webhooks, automations, API monitoring
- **Security & Compliance**: Audit logs, access control, error tracking

## Guardrails

### Design System Enforcement
- **Reference**: See `.cursor/11-webapp-structure.mdc` for complete design system rules
- **ESLint Rule**: `no-restricted-imports` prevents direct primitive imports
- **Color Usage**: No raw hex colors in app code (use design tokens)
- **Component Reuse**: Prefer `@starter/ui` primitives over custom implementations

### Code Quality
- **TypeScript**: Strict type checking enabled
- **Linting**: ESLint with Next.js and Tailwind configurations
- **Formatting**: Prettier with Tailwind plugin
- **Testing**: Vitest for unit and integration tests

### Route Verification
- **Script**: `pnpm run verify:routes` checks required routes exist
- **CI Integration**: Route verification runs in build pipeline
- **Documentation**: Route inventory maintained in this file

## Development Workflow

1. **Design Tokens**: Update `/design/DESIGN_TOKENS.json` for design changes
2. **UI Primitives**: Add new components to `packages/ui`
3. **Application**: Use primitives and design tokens in app code
4. **Verification**: Run `pnpm run verify:routes` before committing
5. **Testing**: Ensure all tests pass and routes are accessible
