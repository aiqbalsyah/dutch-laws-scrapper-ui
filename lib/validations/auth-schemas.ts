import { z } from 'zod'

// Sign-in validation schema
export const signInSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters' }),
})

export type SignInInput = z.infer<typeof signInSchema>

// Sign-up validation schema
export const signUpSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters' }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

export type SignUpInput = z.infer<typeof signUpSchema>

// Forgot password validation schema
export const forgotPasswordSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
})

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>

// Reset password validation schema
export const resetPasswordSchema = z.object({
  password: z.string().min(8, { message: 'Password must be at least 8 characters' }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
