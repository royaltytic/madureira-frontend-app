import { z } from 'zod';

// Esquema de validação para o formulário de funcionário
export const EmployeeSchema = z.object({
  id: z.string().optional(), // O ID só existirá no modo de edição
  user: z.string().min(3, 'O nome de usuário deve ter pelo menos 3 caracteres.'),
  tipo: z.string().min(0, 'O cargo deve ter pelo menos 3 caracteres.'),
  
})

export type EmployeeFormData = z.infer<typeof EmployeeSchema>;