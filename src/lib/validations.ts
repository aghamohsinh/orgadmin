import { z } from 'zod'

export const signUpSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  full_name: z.string().min(2, 'Full name must be at least 2 characters'),
})

export const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export const orgTypeSchema = z.enum(['school', 'nonprofit', 'business'])

export const createOrgSchema = z
  .object({
    name: z.string().min(2, 'Organization name must be at least 2 characters').max(100),
    type: orgTypeSchema,
    school_district: z.string().optional(),
    tax_id: z.string().optional(),
    industry: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.type === 'school' && !data.school_district?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'School district is required for schools',
        path: ['school_district'],
      })
    }
    if (data.type === 'nonprofit' && !data.tax_id?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Tax ID (EIN) is required for nonprofits',
        path: ['tax_id'],
      })
    }
    if (data.type === 'business' && !data.industry?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Industry is required for businesses',
        path: ['industry'],
      })
    }
  })

export const inviteMemberSchema = z.object({
  email: z.string().email('Invalid email address'),
})

export type SignUpFormData = z.infer<typeof signUpSchema>
export type SignInFormData = z.infer<typeof signInSchema>
export type CreateOrgFormData = z.infer<typeof createOrgSchema>
export type InviteMemberFormData = z.infer<typeof inviteMemberSchema>
