/**
 * Validation utilities for email and phone authentication
 */

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidE164Phone(phone: string): boolean {
  // E.164 format: +[country code][number]
  // Must start with +, followed by 1-3 digit country code, then 1-14 digits
  const e164Regex = /^\+[1-9]\d{1,14}$/;
  return e164Regex.test(phone);
}

export function formatPhoneForDisplay(phone: string): string {
  // Mask middle digits: +1 234 *** *** 5678
  // Match: country code (1-3 digits), first 3 digits, middle digits, last 4 digits
  if (phone.startsWith('+1')) {
    const usMatch = phone.match(/^(\+1)(\d{3})(\d+)(\d{4})$/)
    if (usMatch) {
      return `${usMatch[1]} ${usMatch[2]} *** *** ${usMatch[4]}`
    }
  }

  // Prefer longer country codes first so +44... is parsed correctly
  const longMatch = phone.match(/^(\+\d{2,3})(\d{3})(\d+)(\d{4})$/);
  if (longMatch) {
    return `${longMatch[1]} ${longMatch[2]} *** *** ${longMatch[4]}`;
  }
  
  const match = phone.match(/^(\+\d{1})(\d{3})(\d+)(\d{4})$/);
  if (match) {
    return `${match[1]} ${match[2]} *** *** ${match[4]}`;
  }
  
  // Fallback for shorter numbers
  const shortMatch = phone.match(/^(\+\d{1,3})(\d{2})(\d+)(\d{2})$/);
  if (shortMatch) {
    return `${shortMatch[1]} ${shortMatch[2]} *** ${shortMatch[4]}`;
  }
  
  return phone;
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
