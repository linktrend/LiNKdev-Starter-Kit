"use client";

import { useState, useEffect } from 'react';

/**
 * Rate limiting utilities for authentication
 */

export interface RateLimitInfo {
  isRateLimited: boolean;
  retryAfter?: number; // seconds
  attemptsRemaining?: number;
}

export function parseRateLimitError(error: any): RateLimitInfo {
  // Supabase rate limit errors typically include retry-after info
  if (error.message?.includes('rate limit') || error.status === 429 || error.message?.includes('too many')) {
    // Extract retry-after from error (default to 60s if not specified)
    const retryAfter = error.retryAfter || 60;
    
    return {
      isRateLimited: true,
      retryAfter,
    };
  }
  
  return { isRateLimited: false };
}

export function useRateLimitCountdown(initialSeconds: number) {
  const [secondsRemaining, setSecondsRemaining] = useState(initialSeconds);
  
  useEffect(() => {
    if (secondsRemaining <= 0) return;
    
    const timer = setTimeout(() => {
      setSecondsRemaining(secondsRemaining - 1);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [secondsRemaining]);
  
  return {
    secondsRemaining,
    isComplete: secondsRemaining <= 0,
    reset: (seconds: number) => setSecondsRemaining(seconds),
    formatTime: () => {
      const minutes = Math.floor(secondsRemaining / 60);
      const seconds = secondsRemaining % 60;
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    },
  };
}

export function useResendCountdown(initialSeconds: number = 30) {
  const [secondsRemaining, setSecondsRemaining] = useState(initialSeconds);
  const [canResend, setCanResend] = useState(false);
  
  useEffect(() => {
    if (secondsRemaining <= 0) {
      setCanResend(true);
      return;
    }
    
    const timer = setTimeout(() => {
      setSecondsRemaining(secondsRemaining - 1);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [secondsRemaining]);
  
  const reset = () => {
    setSecondsRemaining(initialSeconds);
    setCanResend(false);
  };
  
  return {
    secondsRemaining,
    canResend,
    reset,
  };
}
