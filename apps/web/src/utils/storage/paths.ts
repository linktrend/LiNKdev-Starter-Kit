/**
 * Storage path utilities for consistent file organization
 * Provides deterministic paths for different file types and contexts
 */

export type StorageContext = 'user' | 'org' | 'public' | 'record';

export interface PathOptions {
  context: StorageContext;
  userId?: string;
  orgId?: string;
  recordId?: string;
  folder?: string;
  filename: string;
}

/**
 * Generate a consistent storage path based on context and options
 */
export function generateStoragePath(options: PathOptions): string {
  const { context, userId, orgId, recordId, folder, filename } = options;
  
  // Sanitize filename to prevent path traversal
  const sanitizedFilename = sanitizeFilename(filename);
  
  switch (context) {
    case 'user':
      if (!userId) throw new Error('userId required for user context');
      return `users/${userId}/${folder ? `${folder}/` : ''}${sanitizedFilename}`;
      
    case 'org':
      if (!orgId) throw new Error('orgId required for org context');
      return `organizations/${orgId}/${folder ? `${folder}/` : ''}${sanitizedFilename}`;
      
    case 'record':
      if (!recordId) throw new Error('recordId required for record context');
      return `records/${recordId}/${folder ? `${folder}/` : ''}${sanitizedFilename}`;
      
    case 'public':
      return `public/${folder ? `${folder}/` : ''}${sanitizedFilename}`;
      
    default:
      throw new Error(`Unknown storage context: ${context}`);
  }
}

/**
 * Generate a unique filename with timestamp to prevent conflicts
 */
export function generateUniqueFilename(originalFilename: string): string {
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  const extension = getFileExtension(originalFilename);
  const nameWithoutExt = originalFilename.replace(/\.[^/.]+$/, '');
  
  return `${nameWithoutExt}_${timestamp}_${randomSuffix}${extension}`;
}

/**
 * Extract file extension from filename
 */
export function getFileExtension(filename: string): string {
  const lastDot = filename.lastIndexOf('.');
  return lastDot === -1 ? '' : filename.substring(lastDot);
}

/**
 * Sanitize filename to prevent path traversal and other security issues
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, '_') // Replace special chars with underscore
    .replace(/\.{2,}/g, '.') // Replace multiple dots with single dot
    .replace(/^\.+|\.+$/g, '') // Remove leading/trailing dots
    .substring(0, 255); // Limit length
}

/**
 * Get the appropriate bucket name for a given context
 */
export function getBucketName(context: StorageContext): string {
  switch (context) {
    case 'user':
      return 'user-uploads';
    case 'org':
    case 'record':
      return 'attachments';
    case 'public':
      return 'public-assets';
    default:
      throw new Error(`Unknown storage context: ${context}`);
  }
}

/**
 * Parse a storage path to extract context and metadata
 */
export function parseStoragePath(path: string): {
  context: StorageContext;
  userId?: string;
  orgId?: string;
  recordId?: string;
  filename: string;
} {
  const parts = path.split('/');
  
  if (parts[0] === 'users' && parts.length >= 3) {
    return {
      context: 'user',
      userId: parts[1],
      filename: parts[parts.length - 1],
    };
  }
  
  if (parts[0] === 'organizations' && parts.length >= 3) {
    return {
      context: 'org',
      orgId: parts[1],
      filename: parts[parts.length - 1],
    };
  }
  
  if (parts[0] === 'records' && parts.length >= 3) {
    return {
      context: 'record',
      recordId: parts[1],
      filename: parts[parts.length - 1],
    };
  }
  
  if (parts[0] === 'public' && parts.length >= 2) {
    return {
      context: 'public',
      filename: parts[parts.length - 1],
    };
  }
  
  throw new Error(`Unable to parse storage path: ${path}`);
}

/**
 * Generate a public URL for a file in storage
 */
export function generatePublicUrl(bucketName: string, filePath: string, supabaseUrl: string): string {
  return `${supabaseUrl}/storage/v1/object/public/${bucketName}/${filePath}`;
}

/**
 * Generate a signed URL for private file access
 */
export function generateSignedUrl(bucketName: string, filePath: string, supabaseUrl: string, expiresIn: number = 3600): string {
  // This is a placeholder - actual signed URL generation happens in the API
  // The API will use Supabase's createSignedUrl method
  return `${supabaseUrl}/storage/v1/object/sign/${bucketName}/${filePath}?expires=${Date.now() + expiresIn * 1000}`;
}
