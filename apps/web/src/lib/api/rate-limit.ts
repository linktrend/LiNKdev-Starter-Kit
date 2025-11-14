import { NextRequest } from 'next/server'

interface RateLimitConfig {
  windowMs: number
  max: number
}

interface RateLimitSuccess {
  success: true
}

interface RateLimitFailure {
  success: false
  error: string
  retryAfter: number
}

type RateLimitResult = RateLimitSuccess | RateLimitFailure

const requestCounts = new Map<string, { count: number; resetTime: number }>()

export function rateLimit(config: RateLimitConfig) {
  return (req: NextRequest): RateLimitResult => {
    const ip = req.ip || req.headers.get('x-forwarded-for') || 'unknown'
    const now = Date.now()

    const record = requestCounts.get(ip)

    if (!record || now > record.resetTime) {
      requestCounts.set(ip, {
        count: 1,
        resetTime: now + config.windowMs,
      })
      return { success: true }
    }

    if (record.count >= config.max) {
      return {
        success: false,
        error: 'Too many requests',
        retryAfter: Math.ceil((record.resetTime - now) / 1000),
      }
    }

    record.count += 1
    return { success: true }
  }
}

export const defaultRateLimiter = rateLimit({ windowMs: 60000, max: 60 })
export const strictRateLimiter = rateLimit({ windowMs: 60000, max: 10 })
