import { z } from 'zod';

export const signInSchema = z.object({
  email: z.email('E-mail inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
});

export type SignInSchema = typeof signInSchema;
export type SignInInput = z.infer<typeof signInSchema>;
