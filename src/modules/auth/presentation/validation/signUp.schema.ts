import { z } from 'zod';

export const signUpSchema = z.object({
  name: z.string().min(2, 'Nome deve conter ao menos 2 caracteres'),
  email: z.email('E-mail inválido'),
  password: z.string().min(8, 'Senha deve conter ao menos 8 caracteres'),
});

export type SignUpSchema = typeof signUpSchema;
export type SignUpInput = z.infer<typeof signUpSchema>;
