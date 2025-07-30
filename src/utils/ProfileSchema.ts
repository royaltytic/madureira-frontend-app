// src/utils/ProfileSchema.ts
import { z } from 'zod';

export const ProfileSchema = z.object({
  user: z.string().min(3, 'O nome de usuário deve ter pelo menos 3 caracteres.'),
  email: z.string().email('Digite um e-mail válido.'),
  birthDate: z.coerce.date().optional(), 
  password: z.string().optional(), // A senha é opcional
  confirmPassword: z.string().optional(),
}).refine(data => data.password === data.confirmPassword, {
  message: "As senhas não conferem.",
  path: ["confirmPassword"], // Indica qual campo receberá a mensagem de erro
});

export type ProfileFormData = z.infer<typeof ProfileSchema>;