/**
 * Admin/Owner Email Whitelist Utilities
 * 
 * Mock implementation for admin email whitelist validation.
 * In production, this would query a Supabase database table.
 */

export type AdminRole = 'admin' | 'owner';

export interface AdminWhitelistEntry {
  email: string;
  role: AdminRole;
  requires2FA: boolean;
  twoFactorEnabled: boolean;
  verified: boolean;
  addedBy: string;
  addedAt: string;
  lastLogin: Date | null;
}

export interface WhitelistValidationResult {
  isAuthorized: boolean;
  role?: AdminRole;
  requires2FA?: boolean;
  error?: string;
}

// Mock whitelist data
const mockWhitelist: AdminWhitelistEntry[] = [
  {
    email: 'owner@example.com',
    role: 'owner',
    requires2FA: true,
    twoFactorEnabled: true,
    verified: true,
    addedBy: 'system',
    addedAt: '2024-01-01',
    lastLogin: new Date('2025-01-27T09:00:00Z'),
  },
  {
    email: 'admin@example.com',
    role: 'admin',
    requires2FA: true,
    twoFactorEnabled: true,
    verified: true,
    addedBy: 'owner@example.com',
    addedAt: '2024-01-15',
    lastLogin: new Date('2025-01-27T10:30:00Z'),
  },
  {
    email: 'admin2@example.com',
    role: 'admin',
    requires2FA: true,
    twoFactorEnabled: false,
    verified: true,
    addedBy: 'owner@example.com',
    addedAt: '2024-02-10',
    lastLogin: new Date('2025-01-26T16:45:00Z'),
  },
];

/**
 * Validate if an email is in the admin/owner whitelist
 * @param email - Email address to validate
 * @returns Promise with validation result
 */
export async function validateAdminWhitelist(
  email: string
): Promise<WhitelistValidationResult> {
  // Mock implementation
  console.log(`Validating admin whitelist for: ${email}`);
  
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const normalizedEmail = email.toLowerCase().trim();
  const entry = mockWhitelist.find(item => item.email === normalizedEmail);
  
  if (!entry) {
    return {
      isAuthorized: false,
      error: 'Email not in whitelist',
    };
  }
  
  if (!entry.verified) {
    return {
      isAuthorized: false,
      error: 'Email not verified',
    };
  }
  
  return {
    isAuthorized: true,
    role: entry.role,
    requires2FA: entry.requires2FA,
  };
}

/**
 * Get all whitelisted admin/owner emails
 * @returns Promise with list of whitelist entries
 */
export async function getAdminWhitelist(): Promise<AdminWhitelistEntry[]> {
  // Mock implementation
  console.log('Fetching admin whitelist');
  
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 300));
  
  return mockWhitelist;
}

/**
 * Add an email to the admin/owner whitelist
 * @param email - Email address to add
 * @param role - Role to assign (admin or owner)
 * @param addedBy - Email of the user adding this entry
 * @returns Promise with success result
 */
export async function addToWhitelist(
  email: string,
  role: AdminRole,
  addedBy: string
): Promise<{ success: boolean; error?: string }> {
  // Mock implementation
  console.log(`Adding ${email} to whitelist as ${role} by ${addedBy}`);
  
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // In production, this would insert into database
  return { success: true };
}

/**
 * Remove an email from the admin/owner whitelist
 * @param email - Email address to remove
 * @returns Promise with success result
 */
export async function removeFromWhitelist(
  email: string
): Promise<{ success: boolean; error?: string }> {
  // Mock implementation
  console.log(`Removing ${email} from whitelist`);
  
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Prevent removing owner emails
  const entry = mockWhitelist.find(item => item.email === email);
  if (entry?.role === 'owner') {
    return {
      success: false,
      error: 'Cannot remove owner from whitelist',
    };
  }
  
  // In production, this would delete from database
  return { success: true };
}
