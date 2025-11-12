/**
 * Generate a suggested username from email, phone, or name
 */
export function generateUsername(
  email?: string,
  phone?: string,
  name?: string
): string {
  if (email) {
    // Extract part before @, remove special chars
    const localPart = email.split('@')[0];
    return localPart
      .replace(/[^a-zA-Z0-9]/g, '')
      .toLowerCase()
      .slice(0, 20);
  }
  
  if (phone) {
    // Use last 7-8 digits
    const digits = phone.replace(/\D/g, '');
    return `user${digits.slice(-7)}`;
  }
  
  if (name) {
    // Use name, remove spaces
    return name
      .replace(/\s+/g, '')
      .toLowerCase()
      .slice(0, 20);
  }
  
  // Fallback: random
  return `user${Date.now().toString().slice(-8)}`;
}

/**
 * Check username availability (mock implementation)
 * TODO: Replace with actual API call
 */
export async function checkUsernameAvailability(
  username: string
): Promise<boolean> {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Mock: usernames starting with 'john' or 'test' are taken
      const isTaken = username.toLowerCase().startsWith('john') || 
                     username.toLowerCase().startsWith('test');
      resolve(!isTaken);
    }, 500);
  });
}

