import { z } from "zod";

export const CarValidator = z.object({
    nome: z.string(),
    marca: z.string(),
    preco: z.number().min(0.01),
    anoFabricacao: z.number().int(),
});
