import { NextRequest, NextResponse } from 'next/server'

import { checkFeatureAccess } from './server'

/**
 * Middleware to check feature access before allowing route access
 */
export async function withFeatureGate(req: NextRequest, featureKey: string, orgIdFromParams?: string) {
  try {
    const access = await checkFeatureAccess(featureKey, orgIdFromParams)

    if (!access.enabled) {
      return NextResponse.redirect(new URL(`/en/billing?upgrade=${featureKey}`, req.url))
    }

    return NextResponse.next()
  } catch (error) {
    console.error('Feature gate error:', error)
    return NextResponse.redirect(new URL('/en/dashboard', req.url))
  }
}
