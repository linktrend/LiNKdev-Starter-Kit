#!/usr/bin/env tsx

import { existsSync } from 'fs';
import { join } from 'path';

/**
 * Route verification script for Next.js App Router
 * Ensures all required routes exist in the application
 */

const REQUIRED_ROUTES = [
  // Marketing
  'apps/web/src/app/[locale]/(marketing)/page.tsx',
  'apps/web/src/app/[locale]/(marketing)/pricing/page.tsx',
  'apps/web/src/app/[locale]/(marketing)/pricing/success/page.tsx',
  'apps/web/src/app/[locale]/(marketing)/pricing/cancel/page.tsx',

  // Auth
  'apps/web/src/app/[locale]/(auth_forms)/login/page.tsx',
  'apps/web/src/app/[locale]/(auth_forms)/signup/page.tsx',
  'apps/web/src/app/[locale]/(auth_forms)/magic_link/page.tsx',
  'apps/web/src/app/[locale]/(auth_forms)/verify_otp/page.tsx',
  'apps/web/src/app/[locale]/(auth_forms)/onboarding/page.tsx',

  // Dashboard
  'apps/web/src/app/[locale]/(dashboard)/dashboard/page.tsx',
  'apps/web/src/app/[locale]/(dashboard)/dashboard/settings/page.tsx',
  'apps/web/src/app/[locale]/(dashboard)/dashboard/help/page.tsx',

  // Console
  'apps/web/src/app/[locale]/(console)/console/page.tsx',
  'apps/web/src/app/[locale]/(console)/console/login/page.tsx',
  'apps/web/src/app/[locale]/(console)/console/health/page.tsx',
  'apps/web/src/app/[locale]/(console)/console/database/page.tsx',
  'apps/web/src/app/[locale]/(console)/console/errors/page.tsx',
  'apps/web/src/app/[locale]/(console)/console/billing/page.tsx',
  'apps/web/src/app/[locale]/(console)/console/reports/page.tsx',
  'apps/web/src/app/[locale]/(console)/console/security/page.tsx',
  'apps/web/src/app/[locale]/(console)/console/config/page.tsx',
  'apps/web/src/app/[locale]/(console)/console/config/application/page.tsx',

  // Shared
  'apps/web/src/app/[locale]/not-found.tsx',
];

function verifyRoutes(): void {
  const projectRoot = process.cwd();
  const missingRoutes: string[] = [];
  
  console.log('🔍 Verifying required routes...\n');
  
  for (const route of REQUIRED_ROUTES) {
    const fullPath = join(projectRoot, route);
    const exists = existsSync(fullPath);
    
    if (exists) {
      console.log(`✅ ${route}`);
    } else {
      console.log(`❌ ${route} - MISSING`);
      missingRoutes.push(route);
    }
  }
  
  console.log('\n' + '='.repeat(50));
  
  if (missingRoutes.length === 0) {
    console.log('🎉 Route verification passed! All required routes exist.');
    process.exit(0);
  } else {
    console.log(`❌ Route verification failed! ${missingRoutes.length} route(s) missing:`);
    missingRoutes.forEach(route => console.log(`   - ${route}`));
    console.log('\nPlease create the missing route files before proceeding.');
    process.exit(1);
  }
}

// Run verification
verifyRoutes();
