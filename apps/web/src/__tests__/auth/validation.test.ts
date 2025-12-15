import { describe, it, expect } from 'vitest';
import {
  isValidEmail,
  isValidE164Phone,
  formatPhoneForDisplay,
  sanitizePhoneNumber,
  validatePassword,
} from '@/lib/auth/validation';

describe('Email Validation', () => {
  it('should validate correct email addresses', () => {
    expect(isValidEmail('test@example.com')).toBe(true);
    expect(isValidEmail('user.name@domain.co.uk')).toBe(true);
    expect(isValidEmail('user+tag@example.com')).toBe(true);
  });

  it('should reject invalid email addresses', () => {
    expect(isValidEmail('invalid')).toBe(false);
    expect(isValidEmail('invalid@')).toBe(false);
    expect(isValidEmail('@example.com')).toBe(false);
    expect(isValidEmail('invalid@domain')).toBe(false);
    expect(isValidEmail('')).toBe(false);
  });
});

describe('Phone Validation', () => {
  it('should validate correct E.164 phone numbers', () => {
    expect(isValidE164Phone('+12345678901')).toBe(true);
    expect(isValidE164Phone('+447911123456')).toBe(true);
    expect(isValidE164Phone('+861234567890')).toBe(true);
  });

  it('should reject invalid E.164 phone numbers', () => {
    expect(isValidE164Phone('12345678901')).toBe(false); // Missing +
    expect(isValidE164Phone('+0123456789')).toBe(false); // Starts with 0
    expect(isValidE164Phone('+1')).toBe(false); // Too short
    expect(isValidE164Phone('+123456789012345678')).toBe(false); // Too long
    expect(isValidE164Phone('')).toBe(false);
  });

  it('should format phone numbers for display', () => {
    expect(formatPhoneForDisplay('+12345678901')).toBe('+1 234 *** *** 8901');
    expect(formatPhoneForDisplay('+447911123456')).toBe('+44 791 *** *** 3456');
  });

  it('should sanitize phone numbers', () => {
    expect(sanitizePhoneNumber('+1 (234) 567-8901')).toBe('+12345678901');
    expect(sanitizePhoneNumber('+44 7911 123 456')).toBe('+447911123456');
    expect(sanitizePhoneNumber('123-456-7890')).toBe('1234567890');
  });
});

describe('Password Validation', () => {
  it('should validate strong passwords', () => {
    const result = validatePassword('StrongPass123');
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should reject passwords that are too short', () => {
    const result = validatePassword('Short1');
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Password must be at least 8 characters long');
  });

  it('should reject passwords without uppercase letters', () => {
    const result = validatePassword('lowercase123');
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Password must contain at least one uppercase letter');
  });

  it('should reject passwords without lowercase letters', () => {
    const result = validatePassword('UPPERCASE123');
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Password must contain at least one lowercase letter');
  });

  it('should reject passwords without numbers', () => {
    const result = validatePassword('NoNumbers');
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Password must contain at least one number');
  });
});
