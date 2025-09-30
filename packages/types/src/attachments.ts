/**
 * Type definitions for storage attachments
 */

export interface Attachment {
  id: string;
  record_id?: string;
  org_id?: string;
  user_id?: string;
  created_by: string;
  file_name: string;
  file_size: number;
  file_type: string;
  mime_type: string;
  bucket_name: string;
  file_path: string;
  public_url?: string;
  image_width?: number;
  image_height?: number;
  image_format?: string;
  is_public: boolean;
  access_token?: string;
  created_at: string;
  updated_at: string;
  expires_at?: string;
}

export interface CreateAttachmentInput {
  record_id?: string;
  org_id?: string;
  user_id?: string;
  created_by: string;
  file_name: string;
  file_size: number;
  file_type: string;
  mime_type: string;
  bucket_name: string;
  file_path: string;
  public_url?: string;
  image_width?: number;
  image_height?: number;
  image_format?: string;
  is_public?: boolean;
  access_token?: string;
  expires_at?: string;
}

export interface UpdateAttachmentInput {
  file_name?: string;
  public_url?: string;
  is_public?: boolean;
  access_token?: string;
  expires_at?: string;
}

export interface AttachmentQuery {
  record_id?: string;
  org_id?: string;
  user_id?: string;
  created_by?: string;
  is_public?: boolean;
  mime_type?: string;
  limit?: number;
  offset?: number;
}
