import { z } from 'zod'

// Create job validation schema
export const createJobSchema = z.object({
  searchInput: z.string().min(1, { message: 'Law name is required' }),
  maxLaws: z.coerce.number().int().positive().optional().or(z.literal('')),
  email: z.string().email({ message: 'Invalid email address' }).optional().or(z.literal('')),
})

export type CreateJobInput = z.infer<typeof createJobSchema>
