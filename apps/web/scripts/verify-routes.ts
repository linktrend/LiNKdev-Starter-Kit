#!/usr/bin/env tsx

import { existsSync } from 'fs';
import { join } from 'path';

/**
 * Route verification script for Next.js App Router
 * Ensures all required routes exist in the application
 */

const REQUIRED_ROUTES = [
  // Marketing routes
  'src/app/(marketing)/page.tsx',
  
  // Authentication routes
  'src/app/(auth_forms)/signup/page.tsx',
  'src/app/(auth_forms)/signin/page.tsx',
  
  // Dashboard routes
  'src/app/(dashboard)/dashboard/page.tsx',
  'src/app/(dashboard)/dashboard/notifications/page.tsx',
  
  // Application routes
  'src/app/(app)/settings/billing/page.tsx', // Known error remains, but must exist
  
  // Admin routes
  'src/app/(admin)/admin/page.tsx',
  
  // Developer Console routes
  'src/app/(console)/console/page.tsx',
  'src/app/(console)/console/login/page.tsx',
  'src/app/(console)/console/health/page.tsx',
  'src/app/(console)/console/db/page.tsx',
  'src/app/(console)/console/jobs/page.tsx',
  'src/app/(console)/console/flags/page.tsx',
  'src/app/(console)/console/env/page.tsx',
  'src/app/(console)/console/integrations/page.tsx',
  'src/app/(console)/console/automations/page.tsx',
  'src/app/(console)/console/api/page.tsx',
  'src/app/(console)/console/errors/page.tsx',
  'src/app/(console)/console/analytics/page.tsx',
  'src/app/(console)/console/audit/page.tsx',
  'src/app/(console)/console/security/page.tsx',
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
