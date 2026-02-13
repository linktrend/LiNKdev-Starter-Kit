# Development Guide

**Complete guide to developing with the LiNKdev Starter Kit**

---

## Table of Contents

1. [Development Environment](#development-environment)
2. [Local Workflow](#local-workflow)
3. [Code Organization](#code-organization)
4. [Component Development](#component-development)
5. [State Management](#state-management)
6. [Error Handling](#error-handling)
7. [Testing](#testing)
8. [Best Practices](#best-practices)

---

## Development Environment

### Prerequisites

- **Node.js** 18+ (LTS recommended)
- **pnpm** 8+ (package manager)
- **Git** (version control)
- **Supabase account** (database & auth)
- **Stripe account** (payments)

### Initial Setup

```bash
# Clone repository
git clone <repository-url>
cd linkdev-starter-kit

# Install dependencies
pnpm install

# Set up environment variables
cp apps/web/.env.example apps/web/.env.local
# Edit .env.local with your credentials

# Start development server
pnpm --filter ./apps/web dev
```

### IDE Setup

**Recommended: VS Code or Cursor**

**Extensions:**
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- TypeScript and JavaScript Language Features
- Prisma (if using Prisma)

**Settings:**
```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib"
}
```

---

## Local Workflow

### Starting Development

```bash
# Start web app only
pnpm --filter ./apps/web dev

# Start all apps (web + mobile)
pnpm dev

# Start with turbo (faster builds)
pnpm turbo dev
```

### Common Commands

```bash
# Development
pnpm dev                           # Start all apps
pnpm --filter ./apps/web dev       # Start web app only
pnpm --filter ./apps/mobile dev    # Start mobile app only

# Building
pnpm build                         # Build all apps
pnpm --filter ./apps/web build     # Build web app only

# Testing
pnpm test                          # Run all tests
pnpm test:watch                    # Run tests in watch mode
pnpm test:integration              # Run integration tests
pnpm --filter ./apps/web test:e2e  # Run E2E tests

# Linting & Type Checking
pnpm lint                          # Run ESLint
pnpm lint:fix                      # Fix auto-fixable issues
pnpm typecheck                     # Run TypeScript type checking

# Database
pnpm --filter ./apps/web supabase:types  # Generate types from database

# Cleaning
pnpm clean                         # Clean all build artifacts
```

### Development Workflow

1. **Create feature branch**
   ```bash
   git checkout -b feature/my-feature
   ```

2. **Make changes**
   - Write code
   - Add tests
   - Update documentation

3. **Test locally**
   ```bash
   pnpm lint
   pnpm typecheck
   pnpm test
   ```

4. **Commit changes**
   ```bash
   git add .
   git commit -m "feat: add my feature"
   ```

5. **Push and create PR**
   ```bash
   git push origin feature/my-feature
   ```

---

## Code Organization

### Monorepo Structure

```
linkdev-starter-kit/
├── apps/
│   ├── web/                    # Next.js web application
│   └── mobile/                 # React Native mobile app
├── packages/
│   ├── api/                    # tRPC API routers
│   ├── ui/                     # Shared UI components
│   ├── config/                 # Shared configuration
│   └── utils/                  # Shared utilities
├── design/                     # Design tokens
├── docs/                       # Documentation
└── mcp/                        # MCP servers
```

### Web App Structure

```
apps/web/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── [locale]/           # Internationalized routes
│   │   │   ├── (marketing)/    # Public pages
│   │   │   ├── (auth_forms)/   # Auth pages
│   │   │   ├── (dashboard)/    # Main dashboard
│   │   │   ├── (app)/          # App features
│   │   │   ├── (console)/      # Developer console
│   │   │   └── org/[orgId]/    # Organization pages
│   │   ├── api/                # API routes
│   │   │   ├── trpc/           # tRPC handler
│   │   │   ├── webhooks/       # Webhook handlers
│   │   │   └── v1/             # REST API v1
│   │   └── actions/            # Server Actions
│   ├── components/             # React components
│   │   ├── ui/                 # Base UI components
│   │   ├── forms/              # Form components
│   │   └── console/            # Console components
│   ├── lib/                    # Utilities
│   │   ├── supabase/           # Supabase clients
│   │   ├── stripe/             # Stripe utilities
│   │   └── errors/             # Error handling
│   ├── hooks/                  # React hooks
│   └── styles/                 # Global styles
├── public/                     # Static assets
├── supabase/                   # Supabase migrations
└── tests/                      # E2E tests
```

### File Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| **Components** | PascalCase | `UserProfile.tsx` |
| **Hooks** | camelCase with `use` prefix | `useAuth.ts` |
| **Utilities** | camelCase | `formatDate.ts` |
| **Types** | PascalCase | `User.ts` |
| **Constants** | UPPER_SNAKE_CASE | `API_ROUTES.ts` |
| **Server Actions** | camelCase | `createUser.ts` |
| **API Routes** | kebab-case | `check-username/route.ts` |

---

## Component Development

### Creating a New Component

**1. Create component file:**

```tsx
// apps/web/src/components/UserCard.tsx
import { Card, CardHeader, CardTitle, CardContent } from '@starter/ui';

interface UserCardProps {
  name: string;
  email: string;
  role: string;
}

export function UserCard({ name, email, role }: UserCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{name}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{email}</p>
        <p className="text-xs">{role}</p>
      </CardContent>
    </Card>
  );
}
```

**2. Export from index (if in a directory):**

```tsx
// apps/web/src/components/index.ts
export { UserCard } from './UserCard';
```

**3. Use in pages:**

```tsx
// apps/web/src/app/[locale]/(dashboard)/users/page.tsx
import { UserCard } from '@/components/UserCard';

export default function UsersPage() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <UserCard name="John Doe" email="john@example.com" role="Admin" />
    </div>
  );
}
```

### Component Guidelines

**Do's:**
- ✅ Use TypeScript for all components
- ✅ Define prop interfaces
- ✅ Use semantic HTML
- ✅ Follow accessibility guidelines
- ✅ Use design system components from `@starter/ui`
- ✅ Keep components small and focused
- ✅ Use composition over inheritance

**Don'ts:**
- ❌ Don't use inline styles
- ❌ Don't import Radix UI directly
- ❌ Don't use raw hex colors
- ❌ Don't mix business logic with presentation
- ❌ Don't create deeply nested components

### Server vs Client Components

**Server Components (default):**
```tsx
// apps/web/src/app/[locale]/(dashboard)/page.tsx
import { createServerClient } from '@/lib/supabase/server';

export default async function DashboardPage() {
  const supabase = createServerClient();
  const { data: user } = await supabase.auth.getUser();
  
  return <div>Welcome, {user?.email}</div>;
}
```

**Client Components:**
```tsx
'use client';

import { useState } from 'react';
import { Button } from '@starter/ui';

export function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    <Button onClick={() => setCount(count + 1)}>
      Count: {count}
    </Button>
  );
}
```

---

## State Management

### Local State (useState)

For component-local state:

```tsx
'use client';

import { useState } from 'react';

export function SearchInput() {
  const [query, setQuery] = useState('');
  
  return (
    <input
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      placeholder="Search..."
    />
  );
}
```

### Server State (tRPC + React Query)

For server data:

```tsx
'use client';

import { api } from '@/lib/trpc/client';

export function UserList() {
  const { data: users, isLoading } = api.user.list.useQuery();
  
  if (isLoading) return <div>Loading...</div>;
  
  return (
    <ul>
      {users?.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}
```

### Global State (Context)

For app-wide state:

```tsx
// contexts/OrganizationContext.tsx
'use client';

import { createContext, useContext, useState } from 'react';

interface Organization {
  id: string;
  name: string;
}

interface OrganizationContextType {
  currentOrg: Organization | null;
  setCurrentOrg: (org: Organization) => void;
}

const OrganizationContext = createContext<OrganizationContextType | null>(null);

export function OrganizationProvider({ children }: { children: React.ReactNode }) {
  const [currentOrg, setCurrentOrg] = useState<Organization | null>(null);
  
  return (
    <OrganizationContext.Provider value={{ currentOrg, setCurrentOrg }}>
      {children}
    </OrganizationContext.Provider>
  );
}

export function useOrganization() {
  const context = useContext(OrganizationContext);
  if (!context) {
    throw new Error('useOrganization must be used within OrganizationProvider');
  }
  return context;
}
```

---

## Error Handling

### Client-Side Error Boundaries

```tsx
// components/errors/ErrorBoundary.tsx
'use client';

import { Component, ReactNode } from 'react';
import { logError } from '@/lib/errors/logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    logError(error, { errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-4 text-center">
          <h2 className="text-lg font-semibold">Something went wrong</h2>
          <p className="text-sm text-muted-foreground">
            {this.state.error?.message}
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### Server-Side Error Handling

```tsx
// app/[locale]/(dashboard)/page.tsx
import { createServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  try {
    const supabase = createServerClient();
    const { data: user, error } = await supabase.auth.getUser();
    
    if (error) throw error;
    if (!user) redirect('/signin');
    
    return <div>Dashboard</div>;
  } catch (error) {
    console.error('Dashboard error:', error);
    return <div>Error loading dashboard</div>;
  }
}
```

### tRPC Error Handling

```tsx
// packages/api/src/routers/user.ts
import { TRPCError } from '@trpc/server';

export const userRouter = createTRPCRouter({
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const user = await ctx.supabase
        .from('users')
        .select('*')
        .eq('id', input.id)
        .single();
      
      if (!user.data) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found',
        });
      }
      
      return user.data;
    }),
});
```

---

## Testing

### Unit Tests (Vitest)

```tsx
// components/UserCard.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { UserCard } from './UserCard';

describe('UserCard', () => {
  it('renders user information', () => {
    render(
      <UserCard 
        name="John Doe" 
        email="john@example.com" 
        role="Admin" 
      />
    );
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    expect(screen.getByText('Admin')).toBeInTheDocument();
  });
});
```

### Integration Tests

```tsx
// packages/api/src/__tests__/integration/user.integration.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { createTestContext } from './helpers/test-context';

describe('User Integration', () => {
  let ctx: any;
  
  beforeEach(async () => {
    ctx = await createTestContext();
  });
  
  it('creates a user', async () => {
    const user = await ctx.caller.user.create({
      email: 'test@example.com',
      name: 'Test User',
    });
    
    expect(user).toHaveProperty('id');
    expect(user.email).toBe('test@example.com');
  });
});
```

### E2E Tests (Playwright)

```tsx
// apps/web/tests/e2e/login.spec.ts
import { test, expect } from '@playwright/test';

test('user can log in', async ({ page }) => {
  await page.goto('/signin');
  
  await page.fill('input[name="email"]', 'test@example.com');
  await page.fill('input[name="password"]', 'password123');
  await page.click('button[type="submit"]');
  
  await expect(page).toHaveURL('/dashboard');
});
```

---

## Best Practices

### TypeScript

```tsx
// ✅ GOOD: Define explicit types
interface User {
  id: string;
  name: string;
  email: string;
}

function getUser(id: string): User {
  // ...
}

// ❌ BAD: Use 'any'
function getUser(id: any): any {
  // ...
}
```

### Async/Await

```tsx
// ✅ GOOD: Use async/await
async function fetchUser(id: string) {
  try {
    const response = await fetch(`/api/users/${id}`);
    const user = await response.json();
    return user;
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
}

// ❌ BAD: Use .then() chains
function fetchUser(id: string) {
  return fetch(`/api/users/${id}`)
    .then(response => response.json())
    .then(user => user)
    .catch(error => console.error(error));
}
```

### Component Composition

```tsx
// ✅ GOOD: Compose small components
function UserProfile({ user }: { user: User }) {
  return (
    <Card>
      <UserAvatar user={user} />
      <UserInfo user={user} />
      <UserActions user={user} />
    </Card>
  );
}

// ❌ BAD: Monolithic component
function UserProfile({ user }: { user: User }) {
  return (
    <Card>
      <div>
        <img src={user.avatar} />
        <h2>{user.name}</h2>
        <p>{user.email}</p>
        <button>Edit</button>
        <button>Delete</button>
      </div>
    </Card>
  );
}
```

### Error Messages

```tsx
// ✅ GOOD: Descriptive error messages
throw new Error('Failed to create user: email already exists');

// ❌ BAD: Generic error messages
throw new Error('Error');
```

### Comments

```tsx
// ✅ GOOD: Explain why, not what
// Use debounce to prevent excessive API calls during typing
const debouncedSearch = useDebouncedValue(searchQuery, 300);

// ❌ BAD: State the obvious
// Set the search query
setSearchQuery(value);
```

---

## Next Steps

- **Database Guide:** [DATABASE.md](./DATABASE.md)
- **Testing Guide:** [TESTING_GUIDE.md](./TESTING_GUIDE.md)
- **Troubleshooting:** [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
- **MCP Integration:** [MCP_INTEGRATION.md](./MCP_INTEGRATION.md)
- **API Reference:** [../05_API_REFERENCE/API_OVERVIEW.md](../05_API_REFERENCE/API_OVERVIEW.md)

---

**Last Updated:** 2025-12-22
