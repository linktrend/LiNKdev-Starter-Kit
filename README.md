# LTM Starter Kit

A production-ready monorepo template for building modern web and mobile applications with a unified design system.

## 🚀 Stack

- **Web**: Next.js 14 (App Router) + TypeScript + Tailwind CSS + shadcn/ui
- **Mobile**: React Native + Expo + NativeWind
- **Backend**: Supabase (Auth, Database, Edge Functions)
- **Payments**: Stripe integration
- **Automation**: n8n workflows
- **Design System**: `@starter/ui` with design tokens
- **Deployment**: Vercel (web), EAS (mobile)

## 📁 Structure

```
LTM-Starter-Kit/
├── apps/
│   ├── web/                    # Next.js web application
│   └── mobile/                 # React Native mobile application
├── packages/
│   ├── ui/                     # Shared UI components and primitives
│   ├── config/                 # Shared configuration (Tailwind preset, etc.)
│   └── utils/                  # Shared utility functions
├── mcp/                        # MCP servers for Cursor integration
│   ├── supabase/               # Supabase MCP server
│   ├── stripe/                 # Stripe MCP server
│   ├── figma/                  # Figma MCP server
│   └── shadcn/                 # Shadcn/UI MCP server
├── design/
│   └── DESIGN_TOKENS.json      # Design system tokens
└── docs/                       # Project documentation
```

## 🏃‍♂️ Quickstart

### Prerequisites

- Node.js 20+
- pnpm 10+
- Expo CLI (for mobile development)

### Installation

```bash
# Install dependencies
pnpm install

# Start web development server
pnpm dev:web

# Start mobile development server (in another terminal)
pnpm dev:mobile
```

## 🛠️ Environment Setup

1. Copy the example file and fill in your values:
   ```bash
   cp .env.example .env
   ```
2. Gather credentials:
   - Supabase: Project URL + anon key + service role key from **Project Settings → API**.
   - Stripe: Secret key(s), publishable key(s), price IDs, and webhook signing secret from **Stripe Dashboard → Developers (API keys/Webhooks)**.
   - Resend: API key from **https://resend.com/api-keys**.
   - n8n/cron: Webhook URL/secret and cron bearer token you control.
3. Validate by starting the app (`pnpm dev:web`); the env validator fails fast if anything required is missing.

See the detailed guide in [`apps/web/docs/ENVIRONMENT_SETUP.md`](apps/web/docs/ENVIRONMENT_SETUP.md) for service-by-service instructions and example values.

### Quality Gates

```bash
# Verify web application (typecheck, lint, build, test, routes)
pnpm verify:web

# Run mobile tests
pnpm test:mobile

# Run web tests
pnpm test:web

# Run E2E tests
pnpm e2e:web
```

## 🔌 MCP Integration (Cursor IDE)

This project includes Model Context Protocol (MCP) servers for enhanced Cursor IDE integration:

- **Supabase MCP**: Database operations, migrations, and queries
- **Stripe MCP**: Payment and subscription management
- **Figma MCP**: Design file access and component inspection
- **Shadcn MCP**: Component discovery and source code retrieval

### Quick Setup

1. **Install dependencies**:
   ```bash
   for dir in mcp/*/; do (cd "$dir" && npm install); done
   ```

2. **Set environment variables** (add to `~/.zshrc` or `~/.bashrc`):
   ```bash
   export SUPABASE_URL="https://your-project.supabase.co"
   export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
   export STRIPE_SECRET_KEY="sk_test_..."
   export FIGMA_ACCESS_TOKEN="figd_..."
   ```

3. **Restart Cursor** completely (Cmd+Q, then relaunch)

4. **Test the setup**:
   ```
   mcp servers
   call SupabaseMCP.ping
   ```

📚 **Full documentation**: See [`mcp/SETUP_GUIDE.md`](mcp/SETUP_GUIDE.md) for detailed setup and usage instructions.

## 🚀 Deployment

### Web Application
- **Platform**: Vercel
- **Command**: `pnpm build` (automatically deployed on push to main)
- **Environment**: Production-ready with Supabase integration

### Mobile Application
- **Platform**: EAS (Expo Application Services)
- **Command**: `eas build` (configured in `apps/mobile/`)
- **Distribution**: App Store and Google Play ready

## 🎨 Design System

The project uses a token-based design system:

1. **Design Tokens**: Defined in `/design/DESIGN_TOKENS.json`
2. **Tailwind Preset**: Consumed via `@starter/config/tailwind-preset`
3. **UI Primitives**: Available through `@starter/ui` package
4. **Application**: Uses Tailwind classes that map to design tokens

### Token Flow
```
DESIGN_TOKENS.json → tailwind-preset.js → Tailwind CSS → Application Components
```

## 📋 Development Conventions

### Git Workflow
- **Commits**: Use [Conventional Commits](https://conventionalcommits.org/)
- **Branches**: `feat/`, `fix/`, `chore/` prefixes
- **PRs**: Required for all changes, must pass quality gates

### Code Quality
- **TypeScript**: Strict type checking enabled
- **Linting**: ESLint with Next.js and Tailwind configurations
- **Formatting**: Prettier with Tailwind plugin
- **Testing**: Vitest (web), Jest (mobile)

### Design System Enforcement
- **ESLint Rule**: `no-restricted-imports` prevents direct primitive imports
- **Color Usage**: No raw hex colors in app code (use design tokens)
- **Component Reuse**: Prefer `@starter/ui` primitives over custom implementations

## 📚 Documentation

- **[Project Structure](docs/structure.md)** - Detailed monorepo layout and routing
- **[Design System](docs/DESIGN_SYSTEM_V0.md)** - Design tokens and component guidelines
- **[Database Operations](docs/DB_OPERATIONS.md)** - Supabase setup and migrations
- **[Development Environment](docs/DEV_ENV.md)** - Local development setup

## 🔧 Available Scripts

### Root Level
- `pnpm dev:web` - Start web development server
- `pnpm dev:mobile` - Start mobile development server
- `pnpm verify:web` - Run all web quality gates
- `pnpm test:web` - Run web tests
- `pnpm test:mobile` - Run mobile tests
- `pnpm e2e:web` - Run web E2E tests
- `pnpm release:alpha` - Prepare alpha release

### Web App (`apps/web/`)
- `pnpm dev` - Start Next.js dev server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm test` - Run Vitest tests
- `pnpm e2e` - Run Playwright E2E tests
- `pnpm verify` - Run all quality gates

### Mobile App (`apps/mobile/`)
- `pnpm dev` - Start Expo development server
- `pnpm android` - Run on Android
- `pnpm ios` - Run on iOS
- `pnpm web` - Run on web
- `pnpm test` - Run Jest tests

## 🛡️ Guardrails

### Design System
- Reference `.cursor/11-webapp-structure.mdc` for complete design system rules
- No direct primitive imports (use `@starter/ui`)
- No raw hex colors (use design tokens)

### Route Verification
- Script: `pnpm run verify:routes` checks required routes exist
- CI Integration: Route verification runs in build pipeline
- Documentation: Route inventory maintained in `docs/structure.md`

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch (`feat/your-feature`)
3. **Make** your changes following the conventions
4. **Run** quality gates: `pnpm verify:web && pnpm test:mobile`
5. **Commit** with conventional commits
6. **Push** and create a Pull Request

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- **[Project Structure](docs/structure.md)** - Detailed monorepo documentation
- **[Design System Guide](.cursor/11-webapp-structure.mdc)** - Complete design system rules
- **[Web App](apps/web/)** - Next.js application
- **[Mobile App](apps/mobile/)** - React Native application
- **[UI Package](packages/ui/)** - Shared design system components

---

**Ready to build?** Start with `pnpm install && pnpm dev:web` and check out the [Project Structure](docs/structure.md) for detailed guidance.
