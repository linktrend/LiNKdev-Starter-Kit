import { z } from 'zod'

// Username validation
export const usernameSchema = z
  .string()
  .min(3, 'Username must be at least 3 characters')
  .max(30, 'Username must be less than 30 characters')
  .regex(
    /^[a-zA-Z0-9_-]+$/,
    'Username can only contain letters, numbers, underscores, and hyphens'
  )
  .transform((val) => val.toLowerCase())

// Personal information
export const personalInfoSchema = z.object({
  username: usernameSchema.optional(),
  display_name: z.string().max(100).optional().nullable(),
  personal_title: z.string().max(10).optional().nullable(),
  first_name: z.string().min(1, 'First name is required').max(50),
  middle_name: z.string().max(50).optional().nullable(),
  last_name: z.string().min(1, 'Last name is required').max(50),
  bio: z.string().max(500).optional().nullable(),
})

// Contact information
export const contactInfoSchema = z.object({
  phone_country_code: z.string().max(5).optional().nullable(),
  phone_number: z.string().max(20).optional().nullable(),
})

// Personal address
export const personalAddressSchema = z.object({
  personal_apt_suite: z.string().max(20).optional().nullable(),
  personal_street_address_1: z.string().max(200).optional().nullable(),
  personal_street_address_2: z.string().max(200).optional().nullable(),
  personal_city: z.string().max(100).optional().nullable(),
  personal_state: z.string().max(100).optional().nullable(),
  personal_postal_code: z.string().max(20).optional().nullable(),
  personal_country: z.string().max(100).optional().nullable(),
})

// Business information
export const businessInfoSchema = z.object({
  business_position: z.string().max(100).optional().nullable(),
  business_company: z.string().max(200).optional().nullable(),
  business_apt_suite: z.string().max(20).optional().nullable(),
  business_street_address_1: z.string().max(200).optional().nullable(),
  business_street_address_2: z.string().max(200).optional().nullable(),
  business_city: z.string().max(100).optional().nullable(),
  business_state: z.string().max(100).optional().nullable(),
  business_postal_code: z.string().max(20).optional().nullable(),
  business_country: z.string().max(100).optional().nullable(),
})

// Education entry
export const educationEntrySchema = z.object({
  id: z.string().uuid().optional(),
  institution: z.string().min(1, 'Institution name is required').max(200),
  degree: z.string().max(100).optional().nullable(),
  field: z.string().max(100).optional().nullable(),
  start_year: z.number().int().min(1900).max(2100).optional().nullable(),
  end_year: z.number().int().min(1900).max(2100).optional().nullable(),
  current: z.boolean().default(false),
})

export const educationSchema = z.array(educationEntrySchema).default([])

// Work experience entry
export const workExperienceEntrySchema = z.object({
  id: z.string().uuid().optional(),
  company: z.string().min(1, 'Company name is required').max(200),
  position: z.string().min(1, 'Position is required').max(100),
  start_date: z.string().optional().nullable(),
  end_date: z.string().optional().nullable(),
  current: z.boolean().default(false),
  description: z.string().max(500).optional().nullable(),
})

export const workExperienceSchema = z.array(workExperienceEntrySchema).default([])

// Complete profile update schema
export const profileUpdateSchema = z
  .object({
    ...personalInfoSchema.shape,
    ...contactInfoSchema.shape,
    ...personalAddressSchema.shape,
    ...businessInfoSchema.shape,
    education: educationSchema.optional(),
    work_experience: workExperienceSchema.optional(),
    avatar_url: z.string().url().optional().nullable(),
  })
  .partial({
    first_name: true,
    last_name: true,
  })
  .extend({
    full_name: z.string().max(150).optional().nullable(),
  })

// Onboarding Step 2 schema
export const onboardingStep2Schema = z.object({
  username: usernameSchema,
  first_name: z.string().min(1, 'First name is required').max(50),
  last_name: z.string().min(1, 'Last name is required').max(50),
  display_name: z.string().max(100).optional().nullable(),
})

// Types
export type PersonalInfo = z.infer<typeof personalInfoSchema>
export type ContactInfo = z.infer<typeof contactInfoSchema>
export type PersonalAddress = z.infer<typeof personalAddressSchema>
export type BusinessInfo = z.infer<typeof businessInfoSchema>
export type EducationEntry = z.infer<typeof educationEntrySchema>
export type WorkExperienceEntry = z.infer<typeof workExperienceEntrySchema>
export type ProfileUpdate = z.infer<typeof profileUpdateSchema>
export type OnboardingStep2 = z.infer<typeof onboardingStep2Schema>
