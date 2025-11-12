/**
 * Magic Link Authentication Utilities
 * 
 * Mock implementation for magic link authentication.
 * In production, this would integrate with Supabase Auth.
 */

export interface MagicLinkResponse {
  success: boolean;
  link?: string;
  expiresIn: number; // seconds
  error?: string;
}

/**
 * Request a magic link to be sent to the user's email
 * @param email - User's email address
 * @returns Promise with magic link response
 */
export async function requestMagicLink(email: string): Promise<MagicLinkResponse> {
  // Mock implementation
  console.log(`Sending magic link to ${email}`);
  
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Generate mock token
  const token = btoa(`${email}:${Date.now()}`);
  const expiresAt = Date.now() + 300000; // 5 minutes
  const link = `/magic_link?token=${token}&expires=${expiresAt}`;
  
  return {
    success: true,
    link,
    expiresIn: 300, // 5 minutes
  };
}

/**
 * Verify a magic link token
 * @param token - The magic link token
 * @param expires - The expiration timestamp
 * @returns Promise with verification result
 */
export async function verifyMagicLink(
  token: string,
  expires: string
): Promise<{ success: boolean; error?: string }> {
  // Mock implementation
  console.log(`Verifying magic link token: ${token}`);
  
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const expiryTime = parseInt(expires);
  const now = Date.now();
  
  if (now > expiryTime) {
    return { success: false, error: 'expired' };
  }
  
  if (token === 'used') {
    return { success: false, error: 'used' };
  }
  
  if (!token || !expires) {
    return { success: false, error: 'invalid' };
  }
  
  return { success: true };
}

/**
 * Resend a magic link
 * @param email - User's email address
 * @returns Promise with magic link response
 */
export async function resendMagicLink(email: string): Promise<MagicLinkResponse> {
  console.log(`Resending magic link to ${email}`);
  return requestMagicLink(email);
}
