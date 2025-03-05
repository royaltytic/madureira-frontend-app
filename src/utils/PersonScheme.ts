import { z } from "zod";


// Helper para validar valores numéricos positivos no campo "imposto"
const positiveNumber = z
  .string()
  .optional()
  .transform((val) => {
    if (!val || val.trim() === "") return undefined;
    const parsed = parseFloat(val);
    if (isNaN(parsed) || parsed <= 0) {
      throw new Error("O valor de imposto deve ser um número positivo.");
    }
    return parsed;
  });

export const PersonScheme = z
  .object({
    name: z
      .string()
      .min(1, { message: "* Nome é obrigatório." })
      .min(3, { message: "O nome deve ter pelo menos 3 caracteres." })
      .max(50, { message: "O nome não pode ter mais de 50 caracteres." })
      .regex(/^[A-Za-zÀ-ÿ\s]+$/, { message: "O nome deve conter apenas letras." }),

    // Removemos as validações padrão para apelido e cpf,
    // mas fazemos transformações para facilitar as validações no superRefine.
    apelido: z.string().transform((val) => val.trim()),
    cpf: z.string().transform((val) => val.replace(/\D/g, "")),

    rg: z.string().optional(),
    caf: z.string().optional(),
    car: z.string().optional(),
    rgp: z.string().optional(),
    gta: z.string().optional(),

    phone: z
      .string()
      .min(1, { message: "* Telefone é obrigatório." })
      .regex(/^\(\d{2}\) \d{5}-\d{4}$/, { message: "O telefone deve estar no formato (XX) XXXXX-XXXX." }),

      neighborhood: z
      .string()
      .regex(/^[A-Za-zÀ-ÿ\s/]+$/, { message: "A localidade deve conter apenas letras e '/'" }),
    
    referencia: z
      .string()
      .min(1, { message: "* Referência é obrigatória." })
      .min(3, { message: "A referência deve ter pelo menos 3 caracteres." })
      .max(50, { message: "A referência não pode ter mais de 50 caracteres." })
      .regex(/^[A-Za-zÀ-ÿ\s]+$/, { message: "A referência deve conter apenas letras." }),

    // Campos opcionais para Agricultor e Feirante
    adagro: z.string().optional(),
    garantiaSafra: z.string().optional(),
    chapeuPalha: z.string().optional(),
    paa: z.string().optional(),
    pnae: z.string().optional(),
    agua: z.string().optional(),

    imposto: positiveNumber,

    area: z.string().optional(),
    tempo: z.string().optional(),
    carroDeMao: z.string().optional(),

    // O campo "produtos" é transformado de string para array, se for informado.
    produtos: z
    .string()
    .min(1, "Digite pelo menos um produto.") // Garante que tenha pelo menos um produto
    .transform((val) =>
      val
        .split(",") // Divide os produtos pela vírgula
        .map((produto) => produto.trim()) // Remove espaços extras
        .filter((produto) => produto.length > 0) // Evita valores vazios
    ).optional(),

    classe: z.array(
      z.enum(["Agricultor", "Pescador", "Feirante", "Outros", "Repartição Pública"])
    ),
  })
  .superRefine((data, ctx) => {
    const isReparticaoPublica = data.classe.includes("Repartição Pública");

    // Validações para "apelido"
    if (!isReparticaoPublica) {
      // Se não for Repartição Pública, o apelido é obrigatório
      if (data.apelido.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "* Apelido é obrigatório.",
          path: ["apelido"],
        });
      } else if (data.apelido.length < 3) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "O apelido deve ter pelo menos 3 caracteres.",
          path: ["apelido"],
        });
      } else if (data.apelido.length > 50) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "O apelido não pode ter mais de 50 caracteres.",
          path: ["apelido"],
        });
      } else if (!/^[A-Za-zÀ-ÿ\s]+$/.test(data.apelido)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "O apelido deve conter apenas letras.",
          path: ["apelido"],
        });
      }
    } else {
      // Se for Repartição Pública, não é obrigatório, mas se preenchido, valida o formato.
      if (data.apelido.length > 0) {
        if (data.apelido.length < 3) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "O apelido deve ter pelo menos 3 caracteres.",
            path: ["apelido"],
          });
        } else if (data.apelido.length > 50) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "O apelido não pode ter mais de 50 caracteres.",
            path: ["apelido"],
          });
        } else if (!/^[A-Za-zÀ-ÿ\s]+$/.test(data.apelido)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "O apelido deve conter apenas letras.",
            path: ["apelido"],
          });
        }
      }
    }

    // Validações para "cpf"
    if (!isReparticaoPublica) {
      if (data.cpf.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "* CPF é obrigatório e deve conter 11 dígitos.",
          path: ["cpf"],
        });
      } else if (!/^\d{11}$/.test(data.cpf)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "* CPF deve conter 11 dígitos.",
          path: ["cpf"],
        });
      }
    } else {
      // Se for Repartição Pública, o campo não é obrigatório; porém, se preenchido, deve ter 11 dígitos.
      if (data.cpf.length > 0 && !/^\d{11}$/.test(data.cpf)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "* CPF deve conter 11 dígitos.",
          path: ["cpf"],
        });
      }
    }

  });
