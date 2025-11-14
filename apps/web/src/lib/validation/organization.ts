import { z } from 'zod'

export const createOrganizationSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  org_type: z.enum(['personal', 'business', 'family', 'education', 'other']),
  slug: z
    .string()
    .min(3, 'Slug must be at least 3 characters')
    .max(50)
    .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
  description: z.string().max(500).optional().nullable(),
})

export const updateOrganizationSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  description: z.string().max(500).optional().nullable(),
  avatar_url: z.string().url().optional().nullable(),
  settings: z.record(z.any()).optional(),
})

export const inviteMemberSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.enum(['member', 'viewer']),
  org_id: z.string().uuid(),
})

export const updateMemberRoleSchema = z.object({
  user_id: z.string().uuid(),
  org_id: z.string().uuid(),
  new_role: z.enum(['owner', 'member', 'viewer']),
})

export const createInviteLinkSchema = z.object({
  org_id: z.string().uuid(),
  role: z.enum(['member', 'viewer']),
  expires_in_days: z.number().min(1).max(30).default(7),
})

export type CreateOrganization = z.infer<typeof createOrganizationSchema>
export type UpdateOrganization = z.infer<typeof updateOrganizationSchema>
export type InviteMember = z.infer<typeof inviteMemberSchema>
export type UpdateMemberRole = z.infer<typeof updateMemberRoleSchema>
export type CreateInviteLink = z.infer<typeof createInviteLinkSchema>
