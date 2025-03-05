import { z } from "zod";

export const LoginScheme = z.object({

    cpf: z
        .string()
        .transform((val) => val.replace(/\D/g, "")) // Remove todos os caracteres que não são dígitos
        .refine((val) => /^\d{11}$/.test(val), { message: "* CPF é obrigatório" }),

});