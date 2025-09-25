/**
 * Enhanced Storage Client
 * Extends the existing storage client with server-side capabilities and attachment management
 */

import { createClient } from "@/utils/supabase/client";
import { createClient as createServerClient } from "@/utils/supabase/server";
import { env } from "@/env";
import { cookies } from 'next/headers';
import { 
  generateStoragePath, 
  generateUniqueFilename, 
  getBucketName, 
  generatePublicUrl,
  type StorageContext,
  type PathOptions 
} from "./paths";

// Re-export existing functions for backward compatibility
export { uploadImage } from "@/utils/supabase/storage/client";

// Types for enhanced storage functionality
export interface AttachmentMetadata {
  id?: string;
  recordId?: string;
  orgId?: string;
  userId?: string;
  createdBy: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  mimeType: string;
  bucketName: string;
  filePath: string;
  publicUrl?: string;
  imageWidth?: number;
  imageHeight?: number;
  imageFormat?: string;
  isPublic?: boolean;
  accessToken?: string;
  expiresAt?: Date;
}

export interface UploadResult {
  success: boolean;
  attachmentId?: string;
  publicUrl?: string;
  signedUrl?: string;
  error?: string;
  metadata?: AttachmentMetadata;
}

export interface StorageConfig {
  maxFileSizeMB: number;
  allowedTypes: string[];
  compressImages: boolean;
  generateThumbnails: boolean;
}

// Default storage configuration
const defaultConfig: StorageConfig = {
  maxFileSizeMB: parseInt(env.STORAGE_MAX_FILE_SIZE_MB || "10"),
  allowedTypes: (env.STORAGE_ALLOWED_TYPES || "image/jpeg,image/png,image/webp,image/gif,application/pdf,text/plain").split(","),
  compressImages: true,
  generateThumbnails: true,
};

/**
 * Client-side storage operations (browser)
 */
export class ClientStorageService {
  private getStorage() {
    const { storage } = createClient();
    return storage;
  }

  /**
   * Upload a file with enhanced metadata tracking
   */
  async uploadFile(
    file: File,
    options: PathOptions,
    config: Partial<StorageConfig> = {}
  ): Promise<UploadResult> {
    const finalConfig = { ...defaultConfig, ...config };
    
    // Validate file
    const validation = this.validateFile(file, finalConfig);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    try {
      // Generate unique filename and path
      const uniqueFilename = generateUniqueFilename(file.name);
      const filePath = generateStoragePath({ ...options, filename: uniqueFilename });
      const bucketName = getBucketName(options.context);

      // Compress image if needed
      let processedFile = file;
      if (finalConfig.compressImages && file.type.startsWith('image/')) {
        processedFile = await this.compressImage(file);
      }

      // Upload to storage
      const { data, error } = await this.getStorage()
        .from(bucketName)
        .upload(filePath, processedFile, { upsert: true });

      if (error) {
        return { success: false, error: error.message };
      }

      // Generate public URL
      const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
      const publicUrl = generatePublicUrl(bucketName, data.path, supabaseUrl);

      // Create attachment metadata
      const metadata: AttachmentMetadata = {
        createdBy: 'current-user', // Will be set by server
        fileName: file.name,
        fileSize: file.size,
        fileType: getFileExtension(file.name),
        mimeType: file.type,
        bucketName,
        filePath: data.path,
        publicUrl: options.context === 'public' ? publicUrl : undefined,
        isPublic: options.context === 'public',
      };

      return {
        success: true,
        publicUrl,
        metadata,
      };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Upload failed' 
      };
    }
  }

  /**
   * Delete a file from storage
   */
  async deleteFile(bucketName: string, filePath: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await this.getStorage().from(bucketName).remove([filePath]);
      
      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Delete failed' 
      };
    }
  }

  /**
   * Get a signed URL for private file access
   */
  async getSignedUrl(
    bucketName: string, 
    filePath: string, 
    expiresIn: number = 3600
  ): Promise<{ success: boolean; signedUrl?: string; error?: string }> {
    try {
      const { data, error } = await this.getStorage()
        .from(bucketName)
        .createSignedUrl(filePath, expiresIn);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, signedUrl: data.signedUrl };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to generate signed URL' 
      };
    }
  }

  private validateFile(file: File, config: StorageConfig): { valid: boolean; error?: string } {
    // Check file size
    const maxSizeBytes = config.maxFileSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return { 
        valid: false, 
        error: `File size exceeds ${config.maxFileSizeMB}MB limit` 
      };
    }

    // Check file type
    if (!config.allowedTypes.includes(file.type)) {
      return { 
        valid: false, 
        error: `File type ${file.type} not allowed. Allowed types: ${config.allowedTypes.join(', ')}` 
      };
    }

    return { valid: true };
  }

  private async compressImage(file: File): Promise<File> {
    // Use browser-image-compression for client-side compression
    const imageCompression = (await import("browser-image-compression")).default;
    
    try {
      return await imageCompression(file, {
        maxSizeMB: 0.5,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      });
    } catch (error) {
      console.warn('Image compression failed, using original file:', error);
      return file;
    }
  }
}

/**
 * Server-side storage operations (Node.js)
 */
export class ServerStorageService {
  private getStorage() {
    const supabase = createServerClient({ cookies });
    return supabase.storage;
  }

  /**
   * Upload a file from server-side (e.g., from API route)
   */
  async uploadFile(
    file: Buffer | Uint8Array,
    options: PathOptions & { 
      originalName: string;
      mimeType: string;
      size: number;
    },
    config: Partial<StorageConfig> = {}
  ): Promise<UploadResult> {
    const finalConfig = { ...defaultConfig, ...config };
    
    try {
      // Generate unique filename and path
      const uniqueFilename = generateUniqueFilename(options.originalName);
      const filePath = generateStoragePath({ ...options, filename: uniqueFilename });
      const bucketName = getBucketName(options.context);

      // Upload to storage
      const { data, error } = await this.getStorage()
        .from(bucketName)
        .upload(filePath, file, { upsert: true });

      if (error) {
        return { success: false, error: error.message };
      }

      // Generate URLs
      const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
      const publicUrl = generatePublicUrl(bucketName, data.path, supabaseUrl);

      // Create attachment metadata
      const metadata: AttachmentMetadata = {
        createdBy: options.userId || 'system',
        fileName: options.originalName,
        fileSize: options.size,
        fileType: getFileExtension(options.originalName),
        mimeType: options.mimeType,
        bucketName,
        filePath: data.path,
        publicUrl: options.context === 'public' ? publicUrl : undefined,
        isPublic: options.context === 'public',
      };

      return {
        success: true,
        publicUrl,
        metadata,
      };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Upload failed' 
      };
    }
  }

  /**
   * Get a signed URL for private file access
   */
  async getSignedUrl(
    bucketName: string, 
    filePath: string, 
    expiresIn: number = 3600
  ): Promise<{ success: boolean; signedUrl?: string; error?: string }> {
    try {
      const { data, error } = await this.getStorage()
        .from(bucketName)
        .createSignedUrl(filePath, expiresIn);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, signedUrl: data.signedUrl };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to generate signed URL' 
      };
    }
  }

  /**
   * Delete a file from storage
   */
  async deleteFile(bucketName: string, filePath: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await this.getStorage().from(bucketName).remove([filePath]);
      
      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Delete failed' 
      };
    }
  }
}

// Helper function to get file extension
function getFileExtension(filename: string): string {
  const lastDot = filename.lastIndexOf('.');
  return lastDot === -1 ? '' : filename.substring(lastDot);
}

// Export instances for easy use
export const clientStorage = new ClientStorageService();
export const serverStorage = new ServerStorageService();
