'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { Session, User } from '@supabase/supabase-js'
import { createClient } from '@/lib/auth/client'

export interface UseSessionReturn {
  session: Session | null
  user: User | null
  loading: boolean
  error: Error | null
  refresh: () => Promise<void>
}

/**
 * Client-side session hook with automatic refresh and focus detection
 * 
 * Features:
 * - Subscribes to auth state changes
 * - Auto-refreshes session on window focus
 * - Auto-refreshes before token expiry (5 minutes threshold)
 * - Provides loading and error states
 */
export function useSession(): UseSessionReturn {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const sessionRef = useRef<Session | null>(null)

  const supabase = createClient()

  // Refresh session manually
  const refresh = useCallback(async () => {
    try {
      setError(null)
      const { data, error: refreshError } = await supabase.auth.refreshSession()
      
      if (refreshError) {
        throw refreshError
      }
      
      if (data.session) {
        setSession(data.session)
        sessionRef.current = data.session
        setUser(data.session.user)
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to refresh session'))
      console.error('Session refresh error:', err)
    }
  }, [supabase])

  // Check if session needs refresh (within 5 minutes of expiry)
  const shouldRefreshSession = useCallback((currentSession: Session | null): boolean => {
    if (!currentSession?.expires_at) return false
    
    const expiresAt = currentSession.expires_at
    const now = Math.floor(Date.now() / 1000)
    const timeUntilExpiry = expiresAt - now
    
    // Refresh if less than 5 minutes (300 seconds) until expiry
    return timeUntilExpiry < 300
  }, [])

  // Initialize session
  useEffect(() => {
    let mounted = true
    const refreshInterval = setInterval(() => {
      const current = sessionRef.current
      if (current && shouldRefreshSession(current)) {
        void refresh()
      }
    }, 60000) // Check every minute

    const initSession = async () => {
      try {
        const { data, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          throw sessionError
        }

        if (mounted) {
          setSession(data.session)
          sessionRef.current = data.session
          setUser(data.session?.user ?? null)
          setLoading(false)

          // Set up auto-refresh if session exists and needs refresh
          if (data.session && shouldRefreshSession(data.session)) {
            await refresh()
          }
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err : new Error('Failed to get session'))
          setLoading(false)
        }
        console.error('Session initialization error:', err)
      }
    }

    initSession()

    // Subscribe to auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      if (!mounted) return
      setSession(currentSession)
      sessionRef.current = currentSession
      setUser(currentSession?.user ?? null)
      setLoading(false)

      // Clear any errors on successful auth change
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        setError(null)
      }

      // Handle sign out
      if (event === 'SIGNED_OUT') {
        setSession(null)
        sessionRef.current = null
        setUser(null)
        setError(null)
      }
    })

    // Refresh on window focus
    const handleFocus = () => {
      const current = sessionRef.current
      if (current && shouldRefreshSession(current)) {
        void refresh()
      }
    }

    window.addEventListener('focus', handleFocus)

    return () => {
      mounted = false
      subscription.unsubscribe()
      clearInterval(refreshInterval)
      window.removeEventListener('focus', handleFocus)
    }
  }, [supabase, refresh, shouldRefreshSession])

  return {
    session,
    user,
    loading,
    error,
    refresh,
  }
}
