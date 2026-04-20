import { z } from 'zod'

export const registerSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caracteres').max(100).optional(),
  email: z.string().email('Adresse email invalide').toLowerCase().trim(),
  password: z
    .string()
    .min(6, 'Le mot de passe doit contenir au moins 6 caracteres')
    .max(100, 'Mot de passe trop long'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
})

export const loginSchema = z.object({
  email: z.string().email('Adresse email invalide').toLowerCase().trim(),
  password: z.string().min(1, 'Mot de passe requis'),
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
