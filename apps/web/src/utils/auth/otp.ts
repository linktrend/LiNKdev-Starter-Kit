/**
 * OTP (One-Time Password) Authentication Utilities
 * 
 * Mock implementation for WhatsApp and SMS OTP authentication.
 * In production, this would integrate with Supabase Auth and WhatsApp Business API.
 */

export type OTPMethod = 'whatsapp' | 'sms';

export interface OTPResponse {
  success: boolean;
  code?: string; // Only for mock/dev
  expiresIn: number; // seconds
  error?: string;
}

export interface OTPVerificationResponse {
  success: boolean;
  error?: string;
}

/**
 * Send an OTP code via WhatsApp or SMS
 * @param phone - User's phone number (with country code)
 * @param method - Delivery method (whatsapp or sms)
 * @returns Promise with OTP response
 */
export async function sendOTP(
  phone: string,
  method: OTPMethod = 'whatsapp'
): Promise<OTPResponse> {
  // Mock implementation
  console.log(`Sending ${method} OTP to ${phone}`);
  
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Mock: Always return success with code 123456
  return {
    success: true,
    code: '123456', // Only for mock/dev
    expiresIn: 600, // 10 minutes
  };
}

/**
 * Verify an OTP code
 * @param phone - User's phone number
 * @param code - The OTP code to verify
 * @returns Promise with verification result
 */
export async function verifyOTP(
  phone: string,
  code: string
): Promise<OTPVerificationResponse> {
  // Mock implementation
  console.log(`Verifying OTP for ${phone}: ${code}`);
  
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Mock: Accept code 123456
  if (code === '123456') {
    return { success: true };
  }
  
  return { success: false, error: 'Invalid code' };
}

/**
 * Resend an OTP code
 * @param phone - User's phone number
 * @param method - Delivery method (whatsapp or sms)
 * @returns Promise with OTP response
 */
export async function resendOTP(
  phone: string,
  method: OTPMethod = 'whatsapp'
): Promise<OTPResponse> {
  console.log(`Resending ${method} OTP to ${phone}`);
  return sendOTP(phone, method);
}

/**
 * Switch OTP delivery method (e.g., from WhatsApp to SMS)
 * @param phone - User's phone number
 * @param newMethod - New delivery method
 * @returns Promise with OTP response
 */
export async function switchOTPMethod(
  phone: string,
  newMethod: OTPMethod
): Promise<OTPResponse> {
  console.log(`Switching to ${newMethod} for ${phone}`);
  return sendOTP(phone, newMethod);
}
