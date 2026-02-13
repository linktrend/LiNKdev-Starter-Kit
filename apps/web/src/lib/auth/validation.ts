/**
 * Validation utilities for email and phone authentication
 */

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidE164Phone(phone: string): boolean {
  // E.164 format: +[country code][number]
  // Require a realistic minimum length (8-15 digits total, not including '+')
  const e164Regex = /^\+[1-9]\d{7,14}$/;
  return e164Regex.test(phone);
}

export function formatPhoneForDisplay(phone: string): string {
  const sanitized = sanitizePhoneNumber(phone)

  if (sanitized.startsWith('+1') && sanitized.length > 6) {
    const rest = sanitized.slice(2)
    return `+1 ${rest.slice(0, 3)} *** *** ${rest.slice(-4)}`
  }

  if (sanitized.startsWith('+44') && sanitized.length > 6) {
    const rest = sanitized.slice(3)
    return `+44 ${rest.slice(0, 3)} *** *** ${rest.slice(-4)}`
  }

  const match = sanitized.match(/^\+(\d{1,3})(\d{5,})$/)
  if (!match) return sanitized

  const country = match[1]
  const rest = match[2]
  const firstBlock = rest.slice(0, 3)
  const lastFour = rest.slice(-4)

  return `+${country} ${firstBlock} *** *** ${lastFour}`
}

export function sanitizePhoneNumber(phone: string): string {
  // Remove all non-digit characters except leading +
  return phone.replace(/[^\d+]/g, '');
}

export function validatePassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}
