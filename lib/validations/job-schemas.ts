import { z } from 'zod'

// Create job validation schema
export const createJobSchema = z.object({
  searchInput: z.string().min(1, { message: 'Law name is required' }),
  maxLaws: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val || val === '') return true
        const num = Number(val)
        return !isNaN(num) && Number.isInteger(num) && num > 0
      },
      { message: 'Must be a positive integer' }
    ),
  email: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val || val === '') return true
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)
      },
      { message: 'Invalid email address' }
    ),
})

export type CreateJobInput = z.infer<typeof createJobSchema>
