import { describe, it, expect } from 'vitest';
import { isValidEmail, isValidE164Phone } from '@/lib/auth/validation';

describe('Verification Logic', () => {
  describe('Email Verification', () => {
    it('should validate email before sending magic link', () => {
      expect(isValidEmail('valid@example.com')).toBe(true);
      expect(isValidEmail('invalid')).toBe(false);
    });

    it('should handle various email formats', () => {
      const validEmails = [
        'user@domain.com',
        'user.name@domain.com',
        'user+tag@domain.com',
        'user@subdomain.domain.com',
      ];

      validEmails.forEach((email) => {
        expect(isValidEmail(email)).toBe(true);
      });
    });

    it('should reject malformed emails', () => {
      const invalidEmails = [
        'user@',
        '@domain.com',
        'user domain@test.com',
        'user@domain',
        '',
      ];

      invalidEmails.forEach((email) => {
        expect(isValidEmail(email)).toBe(false);
      });
    });
  });

  describe('Phone Verification', () => {
    it('should validate E.164 phone format before sending OTP', () => {
      expect(isValidE164Phone('+12345678901')).toBe(true);
      expect(isValidE164Phone('12345678901')).toBe(false);
    });

    it('should handle various country codes', () => {
      const validPhones = [
        '+12345678901', // US
        '+447911123456', // UK
        '+861234567890', // China
        '+33123456789', // France
        '+919876543210', // India
      ];

      validPhones.forEach((phone) => {
        expect(isValidE164Phone(phone)).toBe(true);
      });
    });

    it('should reject invalid phone formats', () => {
      const invalidPhones = [
        '12345678901', // Missing +
        '+0123456789', // Starts with 0
        '+1', // Too short
        '+123456789012345678', // Too long
        '+1 234 567 8901', // Contains spaces
        '',
      ];

      invalidPhones.forEach((phone) => {
        expect(isValidE164Phone(phone)).toBe(false);
      });
    });
  });
});
